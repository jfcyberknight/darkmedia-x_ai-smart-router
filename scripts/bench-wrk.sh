#!/usr/bin/env bash
# Benchmark wrk pour ai-smart-router — tests de charge plus poussés que bench.js.
#
# wrk est un outil multi-threaded (contrairement à bench.js qui est mono-process
# Node) : il permet de trouver le vrai point de rupture du serveur. À installer
# avant usage :
#   sudo apt-get install -y wrk     # Debian/Ubuntu
#   brew install wrk                 # macOS
#
# Usage :
#   ./scripts/bench-wrk.sh                           # défauts (127.0.0.1:8080)
#   PORT=18781 API_KEY=xxx ./scripts/bench-wrk.sh
#
# Scénarios :
#   1. GET /api/health (public) — overhead pur, 30s à 100 connexions / 4 threads.
#   2. POST /v1/chat/completions sans clé (401) — chemin auth, même charge.
#   3. POST /v1/chat/completions clé valide + body invalide (400) — validation.
#
# Les scénarios POST utilisent un body JSON fixe via -s (lua script inline).
# Le chemin réel (provider IA) n'est PAS testé ici (consomme des crédits).
set -euo pipefail

HOST="${BENCH_HOST:-127.0.0.1}"
PORT="${PORT:-8080}"
API_KEY="${API_KEY:-${AI_SMART_ROUTER_HEADER_KEY:-}}"
DURATION="${DURATION:-30s}"
CONNECTIONS="${CONNECTIONS:-100}"
THREADS="${THREADS:-4}"
BASE="http://${HOST}:${PORT}"

if ! command -v wrk >/dev/null 2>&1; then
  echo "wrk n'est pas installé. Installer : sudo apt-get install -y wrk" >&2
  exit 1
fi

echo "=== ai-smart-router — benchmark wrk (${BASE}, ${DURATION}, ${CONNECTIONS} conn / ${THREADS} threads) ==="
echo

# --- Scénario 1 : GET /api/health (public) ---
echo "--- Scénario 1 : GET /api/health (public) ---"
wrk -t"$THREADS" -c"$CONNECTIONS" -d"$DURATION" --latency "${BASE}/api/health"
echo

# --- Scénario 2 : POST /v1/chat/completions sans clé (401) ---
# Body JSON vide envoyé via lua inline (wrk ne supporte pas -d comme ab).
echo "--- Scénario 2 : POST /v1/chat/completions sans clé (401) ---"
wrk -t"$THREADS" -c"$CONNECTIONS" -d"$DURATION" --latency -s - <<EOF "${BASE}/v1/chat/completions"
wrk.method = "POST"
wrk.body   = '{"messages":[]}'
wrk.headers["Content-Type"] = "application/json"
EOF
echo

# --- Scénario 3 : POST /v1/chat/completions clé valide + body invalide (400) ---
if [ -n "$API_KEY" ]; then
  echo "--- Scénario 3 : POST /v1/chat/completions clé valide + body invalide (400) ---"
  wrk -t"$THREADS" -c"$CONNECTIONS" -d"$DURATION" --latency -s - <<EOF "${BASE}/v1/chat/completions"
wrk.method = "POST"
wrk.body   = '{"messages":[]}'
wrk.headers["Content-Type"] = "application/json"
wrk.headers["X-API-Key"]    = "${API_KEY}"
EOF
  echo
else
  echo "--- Scénario 3 : ignoré (API_KEY non définie) ---"
fi

echo "=== Fin du benchmark wrk ==="
