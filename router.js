const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * SmartRouter - Un plugin pour router intelligemment les requêtes vers différents modèles AI.
 * Basé sur la complexité de la requête et la gestion des quotas (429).
 */
class SmartRouter {
    constructor(config) {
        if (!config.apiKey) {
            throw new Error("Une clé API est requise pour SmartRouter.");
        }
        this.genAI = new GoogleGenerativeAI(config.apiKey);
        this.models = {
            pro: config.proModel || "gemini-1.5-pro",         // Pour les tâches complexes
            flash: config.flashModel || "gemini-1.5-flash",   // Pour la rapidité/simplicité
            gemma: config.gemmaModel || "gemma-2-9b-it"       // Fallback stable (Tier gratuit)
        };
    }

    /**
     * Analyse le prompt pour déterminer quel modèle est le plus approprié.
     * @param {string} prompt 
     * @returns {'pro' | 'flash'}
     */
    classify(prompt) {
        const complexKeywords = ['analyse', 'code', 'architecture', 'résume', 'explique en détail', 'réécris'];
        const isLong = prompt.length > 800;
        const hasComplexKeyword = complexKeywords.some(kw => prompt.toLowerCase().includes(kw));
        
        if (isLong || hasComplexKeyword) {
            return 'pro';
        }
        return 'flash';
    }

    /**
     * Génère du contenu en utilisant le meilleur modèle disponible avec gestion des erreurs.
     * @param {string} prompt 
     * @param {object} options 
     */
    async generate(prompt, options = {}) {
        let strategy = this.classify(prompt);
        let modelName = this.models[strategy];
        
        console.log(`[SmartRouter] Stratégie choisie : ${strategy} (${modelName})`);
        
        try {
            return await this._callModel(modelName, prompt, options);
        } catch (error) {
            // Gestion du Quota (429) ou Surcharge (500)
            if (error.status === 429 || error.status === 500 || error.message.includes('quota')) {
                console.warn(`[SmartRouter] ${modelName} indisponible (Quota/Error). Tentative de fallback...`);
                
                if (strategy === 'pro') {
                    // Si Pro échoue, on tente Flash
                    return await this._callModel(this.models.flash, prompt, options);
                } else {
                    // Si Flash échoue (ou si on était déjà sur Flash), on tente Gemma (souvent plus stable en free tier)
                    return await this._callModel(this.models.gemma, prompt, options);
                }
            }
            throw error; // Erreur fatale autre que quota
        }
    }

    async _callModel(name, prompt, options) {
        const model = this.genAI.getGenerativeModel({ model: name, ...options });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }
}

module.exports = SmartRouter;
