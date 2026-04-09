const { generate } = require("../lib/providers/images");
const { checkApiSecret, checkClientAuth } = require("../lib/auth");
const { applySecurityHeaders } = require("../lib/security-headers");
const { sendSuccess, sendError } = require("../lib/api-response");

/**
 * POST /api/image
 * Header requis : X-Client-Key + X-Signature ou Authorization: Bearer <API_SECRET>
 * Body: { prompt: "string", model?: "string" }
 * Réponse : { id, statut, donnees: { imageUrl, provider, model }, message }
 */
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key, X-Client-Key, X-Signature, X-Timestamp");
  applySecurityHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Essayer authentification client/serveur d'abord (nouveau système)
  const hasClientKey = req.headers["x-client-key"];
  if (hasClientKey) {
    if (!checkClientAuth(req, res)) return;
  } else {
    // Sinon utiliser l'ancien système
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
    
    let result;
    let usedProvider = "";
    
    // Stratégie : Essayer Fal.ai d'abord si spécifié ou si c'est le seul, sinon OpenRouter
    const preferFal = falKey && ( (model && model.includes("fal-ai")) || (!openrouterKey) );

    try {
        if (preferFal) {
            console.log("[api/image] Tentative avec Fal.ai");
            const falProvider = require("../lib/providers/fal");
            result = await falProvider.generate({
              apiKey: falKey,
              model: (model && model.includes("fal-ai")) ? model : falProvider.DEFAULT_MODEL,
              prompt: finalPrompt,
            });
            usedProvider = "fal";
        } else if (openrouterKey) {
            console.log("[api/image] Tentative avec OpenRouter");
            const openrouterProvider = require("../lib/providers/images");
            result = await openrouterProvider.generate({
              apiKey: openrouterKey,
              model: model || "openai/dall-e-3",
              prompt: finalPrompt,
            });
            usedProvider = "openrouter";
        } else {
            throw new Error("Aucun fournisseur d'image configuré (FAL_KEY ou OPENROUTER_API_KEY manquant)");
        }
    } catch (firstErr) {
        console.warn(`[api/image] Échec du premier provider (${preferFal ? 'Fal' : 'OpenRouter'}):`, firstErr.message);
        
        // Fallback si l'autre clé est disponible
        if (preferFal && openrouterKey) {
            console.log("[api/image] Fallback sur OpenRouter...");
            const openrouterProvider = require("../lib/providers/images");
            result = await openrouterProvider.generate({
              apiKey: openrouterKey,
              model: "openai/dall-e-3",
              prompt: finalPrompt,
            });
            usedProvider = "openrouter";
        } else if (!preferFal && falKey) {
            console.log("[api/image] Fallback sur Fal.ai...");
            const falProvider = require("../lib/providers/fal");
            result = await falProvider.generate({
              apiKey: falKey,
              model: falProvider.DEFAULT_MODEL,
              prompt: finalPrompt,
            });
            usedProvider = "fal";
        } else {
            throw firstErr; // Pas de fallback possible
        }
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
