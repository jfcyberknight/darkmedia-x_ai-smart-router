/**
 * Image Generation Provider via OpenRouter.
 * Modèles suggérés : "openai/dall-e-3", "flux-1-dev", "flux-1-pro" etc.
 */
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

async function generate({ apiKey, model = "openai/dall-e-3", prompt }) {
  if (!apiKey) throw new Error("OPENROUTER_API_KEY manquant pour la génération d'images.");

  console.log(`[Images] Génération avec ${model} via OpenRouter...`);
  
  const body = { 
    model,
    messages: [
        { role: "user", content: prompt }
    ]
  };

  console.log(`[Images] Requête OpenRouter (model):`, model);

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-Title": "DarkMedia-X Smart Router",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    let detail = errText;
    try {
        const errJson = JSON.parse(errText);
        detail = errJson.error?.message || JSON.stringify(errJson);
    } catch (e) {}
    throw new Error(`OpenRouter Image API: ${res.status} ${detail}`);
  }

  const data = await res.json();
  let imageUrl = null;

  // Tentative 1: Chemin standard OpenAI (si OpenRouter le répercute ainsi)
  if (data.data && data.data[0] && data.data[0].url) {
      imageUrl = data.data[0].url;
  }

  // Tentative 2: Message content (URL brute ou Markdown)
  if (!imageUrl) {
      const content = data.choices?.[0]?.message?.content ?? "";
      const urlMatch = content.match(/https?:\/\/[^\s)]+/);
      if (urlMatch) imageUrl = urlMatch[0];
  }
  
  // Tentative 3: Cas direct dans la réponse OpenRouter (souvent vu avec certains modèles images)
  if (!imageUrl && data.url) {
      imageUrl = data.url;
  }
  
  if (!imageUrl) {
      console.error("[Images] Réponse brute OpenRouter:", JSON.stringify(data));
      throw new Error("Aucune URL d'image générée dans la réponse OpenRouter.");
  }

  return { imageUrl, provider: "openrouter", model: data.model || model };
}

module.exports = { generate };
