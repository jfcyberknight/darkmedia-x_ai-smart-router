require('dotenv').config();
const SmartRouter = require('./router');

// Simulation d'une configuration
const config = {
    apiKey: process.env.GEMINI_API_KEY || "VOTRE_CLE_ICI",
    proModel: "gemini-1.5-pro",
    flashModel: "gemini-1.5-flash",
    gemmaModel: "gemma-2-9b-it"
};

const router = new SmartRouter(config);

async function demo() {
    console.log("--- Test 1: Demande simple ---");
    const simplePrompt = "Dis bonjour !";
    // Devrait choisir Flash
    try {
        const res1 = await router.generate(simplePrompt);
        console.log("Réponse:", res1);
    } catch (e) {
        console.error("Test 1 échoué (Probablement clé API manquante)");
    }

    console.log("\n--- Test 2: Demande complexe ---");
    const complexPrompt = "Explique moi en détail l'architecture micro-services et donne moi un exemple de code Node.js pour un Gateway.";
    // Devrait choisir Pro
    try {
        const res2 = await router.generate(complexPrompt);
        console.log("Réponse:", res2);
    } catch (e) {
        console.error("Test 2 échoué");
    }
}

// demo(); // Décommentez pour tester en local avec une clé API
console.log("Plugin SmartRouter chargé. Utilisez 'router.generate(prompt)' pour déléguer intelligemment.");
