const { PROVIDERS } = require("../lib/router");
const { applySecurityHeaders } = require("../lib/security-headers");
const { getSessionFromRequest } = require("../lib/auth-google");

module.exports = async (req, res) => {
  applySecurityHeaders(res);

  // Vérification de l'authentification Session (Google OAuth)
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.redirect("/api/auth/login");
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  // Détection dynamique des providers actifs (Auto-documentation)
  const providersStatus = PROVIDERS.map(p => {
    const isActive = p.id === 'ollama' 
        ? !!(process.env.OLLAMA_API_KEY || process.env.OLLAMA_HOST)
        : !!process.env[p.apiKeyEnv];
    return { id: p.id, active: isActive };
  });

  const providersHtml = providersStatus.map(p => 
    `<span class="tag ${p.active ? 'active' : 'inactive'}">
        <span class="dot ${p.active ? 'pulse' : ''}"></span>
        ${p.id}
     </span>`
  ).join("");

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Smart Router | Auto-Doc</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #030303;
            --card-bg: rgba(15, 15, 15, 0.8);
            --primary: #00f2ff;
            --secondary: #7000ff;
            --success: #00ff88;
            --error: #ff3366;
            --text: #ffffff;
            --text-dim: #888;
            --border: rgba(255, 255, 255, 0.08);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background-color: var(--bg);
            color: var(--text);
            font-family: 'Inter', sans-serif;
            background-image: 
                radial-gradient(circle at 10% 10%, rgba(0, 242, 255, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 90% 90%, rgba(112, 0, 255, 0.03) 0%, transparent 50%);
            min-height: 100vh;
        }

        .container { max-width: 1000px; margin: 0 auto; padding: 4rem 2rem; }

        .header { text-align: center; margin-bottom: 4rem; position: relative; }
        .header h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 4rem;
            background: linear-gradient(to right, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 1rem;
        }

        .user-badge {
            position: absolute;
            top: 0;
            right: 0;
            display: flex;
            align-items: center;
            gap: 12px;
            background: var(--card-bg);
            padding: 8px 16px;
            border-radius: 50px;
            border: 1px solid var(--border);
            font-size: 0.85rem;
        }
        .user-badge img { width: 24px; height: 24px; border-radius: 50%; }
        .logout-btn { color: var(--error); text-decoration: none; font-weight: 600; margin-left: 8px; font-size: 0.8rem; }
        .logout-btn:hover { text-decoration: underline; }

        .grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
        @media (max-width: 800px) { .grid { grid-template-columns: 1fr; } .user-badge { position: relative; margin-bottom: 2rem; justify-content: center; } }

        .section {
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--border);
            border-radius: 32px;
            padding: 2.5rem;
            margin-bottom: 2rem;
        }

        h2 { font-family: 'Outfit', sans-serif; font-size: 1.5rem; margin-bottom: 1.5rem; color: var(--primary); }

        .tag {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 14px;
            border-radius: 12px;
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border);
            font-size: 0.9rem;
            margin: 0 8px 8px 0;
            font-weight: 600;
        }
        .tag.active { border-color: var(--success); color: var(--success); }
        .tag.inactive { opacity: 0.4; }

        .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
        .pulse { animation: pulse 2s infinite; box-shadow: 0 0 10px currentColor; }
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }

        code { font-family: 'monospace'; color: var(--primary); background: rgba(0,242,255,0.1); padding: 2px 6px; border-radius: 4px; }
        pre { background: #000; padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border); overflow-x: auto; font-size: 0.85rem; margin: 1rem 0; color: #ccc; }

        .method { font-weight: 800; font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; vertical-align: middle; margin-right: 8px; }
        .method.post { background: var(--secondary); color: white; }
        .method.get { background: var(--primary); color: black; }

        .endpoint-card { border-bottom: 1px solid var(--border); padding: 1.5rem 0; }
        .endpoint-card:last-child { border-bottom: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="user-badge">
                <img src="${session.picture}" alt="Avatar">
                <span>${session.email}</span>
                <a href="/api/auth/logout" class="logout-btn">Déconnexion</a>
            </div>
            <h1>Auto-Documentation</h1>
            <p style="color: var(--text-dim)">AI Smart Router v2.0 — DarkMedia-X Architecture</p>
        </div>

        <div class="grid">
            <div class="left">
                <section class="section">
                    <h2>Endpoints Principaux</h2>
                    
                    <div class="endpoint-card">
                        <h3><span class="method post">POST</span> /api/chat</h3>
                        <p style="color: var(--text-dim); margin: 0.5rem 0;">Conversation avec fallback intelligent.</p>
                        <pre>{
  "messages": [{"role": "user", "content": "Hello!"}],
  "models": { "gemini": "gemini-2.0-flash" }
}</pre>
                    </div>

                    <div class="endpoint-card">
                        <h3><span class="method post">POST</span> /api/image</h3>
                        <p style="color: var(--text-dim); margin: 0.5rem 0;">Génération d'images (Fal.ai / DALL-E 3).</p>
                    </div>

                    <div class="endpoint-card">
                        <h3><span class="method post">POST</span> /api/normalize</h3>
                        <p style="color: var(--text-dim); margin: 0.5rem 0;">Extraction de données structurées JSON.</p>
                    </div>
                </section>
            </div>

            <div class="right">
                <section class="section">
                    <h2>Live Status</h2>
                    <div style="margin-bottom: 1rem;">
                        <p style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 1rem;">Providers détectés sur ce noeud :</p>
                        ${providersHtml}
                    </div>
                    <div style="border-top: 1px solid var(--border); padding-top: 1rem; margin-top: 1rem;">
                        <p style="font-size: 0.8rem; color: var(--text-dim);">Auth: <code>Authorization: Bearer</code></p>
                    </div>
                </section>

                <section class="section" style="padding: 1.5rem;">
                    <h2 style="font-size: 1.1rem;">Health Check</h2>
                    <p><span class="method get" style="margin:0">GET</span> <code>/api/health</code></p>
                </section>
            </div>
        </div>
    </div>
</body>
</html>
  `;

  res.status(200).send(html);
};
