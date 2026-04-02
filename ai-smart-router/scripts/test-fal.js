/**
 * Script de test pour la génération d'images via Fal.ai
 */
const fal = require("../lib/providers/fal");
require("dotenv").config({ path: require("path").resolve(__dirname, "../../../../env") });

async function testFal() {
  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    console.error("❌ FAL_KEY manquante dans env");
    return;
  }

  try {
    console.log("🚀 Test Fal.ai...");
    const result = await fal.generate({
      apiKey: falKey,
      prompt: "A dark cinematic horror scene with a wendigo in a snowy forest, 9:16 aspect ratio, dark academia aesthetic",
    });
    console.log("✅ Succès !");
    console.log(`URL de l'image: ${result.imageUrl}`);
    console.log(`Provider: ${result.provider}`);
    console.log(`Modèle: ${result.model}`);
  } catch (err) {
    console.error("❌ Échec du test Fal.ai:", err.message);
  }
}

testFal();
