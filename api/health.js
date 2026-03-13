/**
 * GET /api/health
 * Vérifie que l'API est en ligne (pour monitoring / load balancer).
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' });
  res.status(200).json({
    ok: true,
    service: 'ai-smart-router',
    providers: ['gemini', 'groq'],
  });
};
