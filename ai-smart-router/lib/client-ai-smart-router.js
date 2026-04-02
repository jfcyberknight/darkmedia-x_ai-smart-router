/**
 * Client pour l'API AI Smart Router
 * Gère l'authentification client/serveur HMAC-SHA256
 *
 * Utilisation:
 *   // Avec configuration explicite
 *   const client = new AISmartRouterClient({
 *     baseURL: 'https://api.example.com',
 *     clientKey: 'cli_project_...',
 *     serverSecret: 'sec_project_...'
 *   });
 *
 *   // Avec variables d'environnement (format: <ENV>_<PROJECT>)
 *   const client = new AISmartRouterClient({
 *     baseURL: 'https://api.example.com',
 *     project: 'ai-smart-router' // charge CLIENT_KEY_AI_SMART_ROUTER et SERVER_SECRET_AI_SMART_ROUTER
 *   });
 *
 *   const response = await client.chat({
 *     messages: [{ role: 'user', content: 'Hello' }]
 *   });
 */

const crypto = require("crypto");

class AISmartRouterClient {
  constructor({ baseURL, clientKey, serverSecret, project } = {}) {
    if (!baseURL) throw new Error("baseURL requis");

    // Deux modes de configuration:
    // 1. Explicite: clientKey + serverSecret
    // 2. Par projet: project='mon-projet' charge CLIENT_KEY_MON_PROJET et SERVER_SECRET_MON_PROJET
    let key = clientKey;
    let secret = serverSecret;

    if (project && !clientKey && !serverSecret) {
      // Mode par projet: charge depuis variables d'environnement
      const envKey = `CLIENT_KEY_${project.toUpperCase().replace(/-/g, "_")}`;
      const envSecret = `SERVER_SECRET_${project.toUpperCase().replace(/-/g, "_")}`;

      key = process.env[envKey];
      secret = process.env[envSecret];

      if (!key || !secret) {
        throw new Error(
          `Variables d'environnement manquantes pour le projet '${project}':\n` +
            `  - ${envKey}\n` +
            `  - ${envSecret}`
        );
      }
    }

    if (!key) throw new Error("clientKey requis (ou utiliser project: 'nom-du-projet')");
    if (!secret) throw new Error("serverSecret requis (ou utiliser project: 'nom-du-projet')");

    this.baseURL = baseURL.replace(/\/$/, ""); // Enlever trailing slash
    this.clientKey = key;
    this.serverSecret = secret;
    this.project = project;
  }

  /**
   * Génère une signature HMAC-SHA256
   * @param {string} payload - Données à signer
   * @returns {string} Signature en hex
   */
  generateSignature(payload) {
    return crypto.createHmac("sha256", this.serverSecret).update(payload).digest("hex");
  }

  /**
   * Effectue une requête authentifiée
   * @param {string} method - GET, POST, etc.
   * @param {string} path - Chemin API (ex: /api/chat)
   * @param {object} data - Corps de la requête (pour POST)
   * @returns {Promise<object>} Réponse API
   */
  async request(method, path, data = null) {
    const url = this.baseURL + path;
    const timestamp = Date.now().toString();

    // Construire le payload
    const body = data ? JSON.stringify(data) : "";
    const payload = body ? `${body}:${timestamp}` : timestamp;

    // Générer la signature
    const signature = this.generateSignature(payload);

    // Construire les headers
    const headers = {
      "Content-Type": "application/json",
      "X-Client-Key": this.clientKey,
      "X-Signature": signature,
      "X-Timestamp": timestamp,
    };

    // Effectuer la requête
    const response = await fetch(url, {
      method,
      headers,
      body: body || undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error ${response.status}: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Appel au endpoint /api/chat
   * @param {object} options - { messages, models }
   * @returns {Promise<object>} { id, statut, donnees, message }
   */
  async chat(options) {
    return this.request("POST", "/api/chat", {
      messages: options.messages,
      ...(options.models && { models: options.models }),
    });
  }

  /**
   * Appel au endpoint /api/normalize
   * @param {string} text - Texte à normaliser
   * @returns {Promise<object>} { id, statut, donnees, message }
   */
  async normalize(text) {
    return this.request("POST", "/api/normalize", { text });
  }

  /**
   * Appel au endpoint /api/image
   * @param {object} options - { prompt, model, enhance }
   * @returns {Promise<object>} { id, statut, donnees, message }
   */
  async image(options) {
    return this.request("POST", "/api/image", {
      prompt: options.prompt,
      ...(options.model && { model: options.model }),
      ...(options.enhance && { enhance: options.enhance }),
    });
  }

  /**
   * Vérification de santé
   * @returns {Promise<object>} { ok, service, providers }
   */
  async health() {
    const response = await fetch(this.baseURL + "/api/health");
    if (!response.ok) throw new Error("Health check failed");
    return response.json();
  }
}

// Export pour Node.js et navigateur
if (typeof module !== "undefined" && module.exports) {
  module.exports = AISmartRouterClient;
}
