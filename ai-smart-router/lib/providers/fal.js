/**
 * Provider Fal.ai – Génération d'images haute performance (Flux, SDXL, etc.)
 * URL: https://fal.run/fal-ai/flux/schnell
 */
const DEFAULT_MODEL = "fal-ai/flux/schnell";

async function generate({ apiKey, model = DEFAULT_MODEL, prompt }) {
  if (!apiKey) throw new Error("FAL_KEY manquante");

  console.log(`[Fal.ai] Génération avec ${model}...`);

  const res = await fetch(`https://fal.run/${model}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${apiKey}`,
    },
    body: JSON.stringify({
      prompt,
      image_size: "landscape_4_3", // Par défaut, ou selon le besoin
      num_inference_steps: 4,
      enable_safety_checker: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Fal.ai API: ${res.status} ${err}`);
  }

  const data = await res.json();
  const imageUrl = data.images?.[0]?.url || data.image?.url;

  if (!imageUrl) {
    throw new Error("Aucune URL d'image générée dans la réponse Fal.ai.");
  }

  return { imageUrl, provider: "fal", model: model };
}

module.exports = { generate, DEFAULT_MODEL };
