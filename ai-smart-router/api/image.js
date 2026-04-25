const { checkApiSecret, checkClientAuth } = require("../lib/auth");
const { applySecurityHeaders } = require("../lib/security-headers");
const { sendSuccess, sendError } = require("../lib/api-response");

const GEMINI_IMAGE_MODEL = "gemini-2.0-flash-001";

async function generateWithGemini(apiKey, prompt) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/${GEMINI_IMAGE_MODEL}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["Text", "Image"] },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API: ${res.status} ${err}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];

  const inlineData = parts.find((p) => p.inlineData);
  if (inlineData?.inlineData?.data) {
    const mimeType = inlineData.inlineData.mimeType || "image/png";
    const base64 = inlineData.inlineData.data;
    return { imageUrl: `data:${mimeType};base64,${base64}`, provider: "gemini", model: GEMINI_IMAGE_MODEL };
  }

  const textPart = parts.find((p) => p.text);
  if (textPart) {
    const urlMatch = textPart.text.match(/https?:\/\/[^\s)]+/);
    if (urlMatch) return { imageUrl: urlMatch[0], provider: "gemini", model: GEMINI_IMAGE_MODEL };
  }

  throw new Error("Gemini n'a pas généré d'image dans sa réponse.");
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key, X-Client-Key, X-Signature, X-Timestamp");
  applySecurityHeaders(res);

  if (req.method === "OPTIONS") return res.status(204).end();

  const hasClientKey = req.headers["x-client-key"];
  if (hasClientKey) {
    if (!checkClientAuth(req, res)) return;
  } else {
    if (!checkApiSecret(req, res)) return;
  }

  if (req.method !== "POST") {
    return sendError(res, "Méthode non autorisée. Utilisez POST.", 405);
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    return sendError(res, "Body JSON invalide.", 400);
  }

  const { prompt, model, enhance } = body;
  if (!prompt) {
    return sendError(res, "Le champ 'prompt' est requis.", 400);
  }

  let finalPrompt = prompt;
  if (enhance) {
    try {
      const groqProvider = require("../lib/providers/groq");
      const groqKey = process.env.GROQ_API_KEY;
      if (groqKey) {
        const enhanceMsg = [{ role: "user", content: `Enrichis ce prompt pour une image d'horreur DarkMedia-X (style Junji Ito, sombre, détaillé) : "${prompt}". Réponds uniquement avec le prompt enrichi en anglais.` }];
        const enhanced = await groqProvider.generate({ apiKey: groqKey, messages: enhanceMsg });
        finalPrompt = enhanced.text || prompt;
        console.log(`[Images] Prompt enrichi par GROQ: ${finalPrompt}`);
      }
    } catch (e) {
      console.warn("[Images] Échec de l'enrichissement GROQ, utilisation du prompt original.");
    }
  }

  try {
    const falKey = process.env.FAL_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    let result;
    let usedProvider = "";
    const providers = [];

    if (falKey) providers.push("fal");
    if (openrouterKey) providers.push("openrouter");
    if (geminiKey) providers.push("gemini");

    for (const provider of providers) {
      try {
        if (provider === "fal") {
          console.log("[api/image] Tentative avec Fal.ai");
          const falProvider = require("../lib/providers/fal");
          result = await falProvider.generate({
            apiKey: falKey,
            model: (model && model.includes("fal-ai")) ? model : require("../lib/providers/fal").DEFAULT_MODEL,
            prompt: finalPrompt,
          });
          usedProvider = "fal";
        } else if (provider === "openrouter") {
          console.log("[api/image] Tentative avec OpenRouter");
          const openrouterProvider = require("../lib/providers/images");
          result = await openrouterProvider.generate({
            apiKey: openrouterKey,
            model: model || "openai/dall-e-3",
            prompt: finalPrompt,
          });
          usedProvider = "openrouter";
        } else if (provider === "gemini") {
          console.log("[api/image] Tentative avec Google Gemini");
          result = await generateWithGemini(geminiKey, finalPrompt);
          usedProvider = "gemini";
        }
        if (result) break;
      } catch (err) {
        console.warn(`[api/image] Échec ${provider}:`, err.message);
        if (provider === providers[providers.length - 1]) throw err;
      }
    }

    if (!result) {
      throw new Error("Aucun fournisseur d'image configuré (FAL_KEY, OPENROUTER_API_KEY ou GEMINI_API_KEY manquant)");
    }

    return sendSuccess(
      res,
      {
        imageUrl: result.imageUrl,
        provider: result.provider,
        model: result.model,
      },
      `Image générée avec succès (${usedProvider})`
    );
  } catch (err) {
    console.error("[api/image]", err.message);
    return sendError(res, err.message || "Erreur lors de la génération d'image.", 500);
  }
};
