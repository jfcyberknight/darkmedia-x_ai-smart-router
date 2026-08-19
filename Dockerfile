# syntax=docker/dockerfile:1
# Image de production pour l'auto-hébergement (VPS OVH).
# Note : tag de base non épinglé par digest (voir audit F5) — à figer si possible.
FROM node:22-alpine

# Métadonnées
LABEL org.opencontainers.image.title="ai-smart-router" \
      org.opencontainers.image.description="Routeur IA privé (Gemini/Groq/NVIDIA/DeepSeek/OpenRouter/Mistral/Ollama) avec fallback" \
      org.opencontainers.image.source="https://github.com/jfcyberknight/darkmedia-x_ai-smart-router"

ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0

WORKDIR /app

# 1) Dépendances (couche cache) — installe uniquement les deps de prod.
#    npm ci : build reproductible à partir du package-lock.json commité.
#    --ignore-scripts évite le hook `prepare` (install-git-hooks) hors dépôt git.
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund

# 2) Code applicatif nécessaire au serveur autonome.
COPY server.js ./
COPY api ./api
COPY lib ./lib

# Sécurité : exécution en utilisateur non-root fourni par l'image node.
USER node

EXPOSE 8080

# Sonde de disponibilité (endpoint public /api/health).
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/api/health || exit 1

CMD ["node", "server.js"]
