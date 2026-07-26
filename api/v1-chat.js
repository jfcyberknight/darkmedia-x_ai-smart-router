const crypto = require("crypto");
const { routeChat, PROVIDERS } = require("../lib/router");
const { checkApiSecret, checkClientAuth } = require("../lib/auth");
const { applySecurityHeaders } = require("../lib/security-headers");

/**
 * POST /v1/chat/completions — façade OpenAI-compatible.
 *
 * Permet aux apps existantes de brancher le smart-router en changeant
 * UNIQUEMENT leur base URL (`.../v1`) + leur clé : elles envoient un corps
 * OpenAI standard ({model?, messages}) et reçoivent une réponse OpenAI
 * standard ({choices:[{message:{content}}]}). En interne, le router choisit
 * un provider (ordre aléatoire + fallback) — la centralisation recherchée.
 *
 * - Texte, cas par défaut : le `model` reçu est IGNORÉ (le router impose ses
 *   défauts + fallback, c'est tout l'intérêt : un provider change -> on corrige
 *   ici, pas dans l'app).
 * - Texte, ciblage explicite (opt-in) : si la requête fournit un hint provider
 *   (`provider` dans le body OU en-tête `X-AI-Provider`), le router se restreint
 *   à CE provider et HONORE le `model` reçu. Cela permet à une app d'imposer un
 *   modèle précis (ex. openrouter / openrouter/fusion) tout en égressant par le
 *   router (clés centralisées, un seul point de correction). Provider inconnu
 *   -> 400.
 * - Multimodal (content en tableau, ex. image_url) : restreint aux providers
 *   OpenAI-compat capables de vision, et le `model` reçu EST respecté (un modèle
 *   vision est spécifique). Providers visés : openrouter, groq, nvapi, deepseek,
 *   mistral. Prioritaire sur le hint provider. Si l'app n'envoie AUCUN modèle
 *   (cas `auto` : elle délègue le choix au router), on impose un modèle VISION
 *   par provider — le `defaultModel` de lib/router.js est un modèle texte et
 *   l'upstream répond alors « No endpoints found that support image input ».
 *
 * Auth : identique à /api/chat (Bearer / X-API-Key, ou HMAC X-Client-Key).
 */

const VISION_CAPABLE = ["openrouter", "groq", "nvapi", "deepseek", "mistral"];

// Modèle vision par défaut, par provider, quand la requête multimodale n'impose
// pas de `model`. Un provider absent de cette table n'est PAS candidat au
// routage multimodal : son modèle par défaut est textuel, il échouerait en 404
// (erreur non rejouable, donc fatale pour toute la requête).
const VISION_DEFAULT_MODELS = {
  openrouter: "openai/gpt-4o-mini",
};

// Borne de taille propre à cette façade : le parseur global (server.js) est
// large pour laisser passer une photo en base64, mais on refuse ici ce qui
// dépasse, avec une erreur au format OpenAI plutôt que l'envelope 413 d'Express.
const MAX_BODY_RAW_LENGTH = 12 * 1024 * 1024;

// Ids de providers connus (source de vérité : lib/router.js) pour valider un
// hint provider explicite.
const KNOWN_PROVIDERS = new Set(PROVIDERS.map((p) => p.id));

function sendOpenAiError(res, status, message, type = "invalid_request_error") {
  res.status(status).json({ error: { message, type, code: null } });
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-API-Key, X-Client-Key, X-Signature, X-Timestamp, X-AI-Provider"
  );
  applySecurityHeaders(res);

  if (req.method === "OPTIONS") return res.status(204).end();

  // Auth (mêmes règles que /api/chat) — checkApiSecret/checkClientAuth
  // répondent au format envelope, mais le code HTTP (401) reste correct pour
  // les clients OpenAI qui ne regardent que le statut.
  const hasClientKey = req.headers["x-client-key"];
  if (hasClientKey) {
    if (!checkClientAuth(req, res)) return;
  } else {
    if (!checkApiSecret(req, res)) return;
  }

  if (req.method !== "POST") {
    return sendOpenAiError(res, 405, "Méthode non autorisée. Utilisez POST.");
  }

  if (typeof req.body === "string" && req.body.length > MAX_BODY_RAW_LENGTH) {
    return sendOpenAiError(res, 413, "Body trop volumineux.");
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch {
    return sendOpenAiError(res, 400, "Body JSON invalide.");
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return sendOpenAiError(res, 400, 'Le champ "messages" (tableau non vide) est requis.');
  }
  for (const m of messages) {
    if (!m || typeof m !== "object" || typeof m.role !== "string") {
      return sendOpenAiError(res, 400, "Chaque message doit avoir un role (string) et un content.");
    }
  }

  // Détection multimodale : au moins un content en tableau (blocs image_url/text).
  const isMultimodal = messages.some((m) => Array.isArray(m.content));

  // Hint provider explicite (opt-in) : body.provider ou en-tête X-AI-Provider.
  const providerHint = (
    (typeof body.provider === "string" && body.provider) ||
    req.headers["x-ai-provider"] ||
    ""
  )
    .toString()
    .trim()
    .toLowerCase();

  let onlyProviders = null;
  let modelOverrides = {};
  if (isMultimodal) {
    // Le modèle vision est spécifique : on respecte celui envoyé par l'app.
    if (typeof body.model === "string" && body.model) {
      onlyProviders = VISION_CAPABLE;
      for (const id of VISION_CAPABLE) modelOverrides[id] = body.model;
    } else {
      // Aucun modèle imposé : le router choisit, mais parmi les seuls providers
      // pour lesquels on connaît un modèle vision (sinon le defaultModel textuel
      // du provider ferait échouer la requête).
      onlyProviders = VISION_CAPABLE.filter((id) => VISION_DEFAULT_MODELS[id]);
      for (const id of onlyProviders) modelOverrides[id] = VISION_DEFAULT_MODELS[id];
    }
  } else if (providerHint) {
    // Ciblage explicite : un seul provider, et le modèle reçu est honoré.
    if (!KNOWN_PROVIDERS.has(providerHint)) {
      return sendOpenAiError(
        res,
        400,
        `Provider inconnu : "${providerHint}". Connus : ${[...KNOWN_PROVIDERS].join(", ")}.`
      );
    }
    onlyProviders = [providerHint];
    if (typeof body.model === "string" && body.model) {
      modelOverrides[providerHint] = body.model;
    }
  }

  try {
    const result = await routeChat({ messages, modelOverrides, onlyProviders });
    const now = Math.floor(Date.now() / 1000);
    return res.status(200).json({
      id: "chatcmpl-" + crypto.randomBytes(12).toString("hex"),
      object: "chat.completion",
      created: now,
      model: result.model,
      // Champ non-standard mais utile pour le debug : quel provider a répondu.
      provider: result.provider,
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: result.text },
          finish_reason: "stop",
        },
      ],
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    });
  } catch (err) {
    console.error("[api/v1-chat]", err.message);
    const status = err.status || (err.message?.includes("échoué") ? 502 : 500);
    return sendOpenAiError(
      res,
      status,
      err.message || "Erreur lors du routage vers les APIs IA.",
      "api_error"
    );
  }
};
