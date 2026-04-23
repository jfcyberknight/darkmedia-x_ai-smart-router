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
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Rajdhani:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #050505;
            --card-bg: rgba(15, 5, 5, 0.85);
            --primary: #ff0000;
            --secondary: #8b0000;
            --success: #ff3333;
            --error: #ff3366;
            --text: #ffffff;
            --text-dim: #999;
            --border: rgba(255, 0, 0, 0.15);
            --glow: 0 0 15px rgba(255, 0, 0, 0.4);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background-color: var(--bg);
            color: var(--text);
            font-family: 'Rajdhani', sans-serif;
            background-image: 
                radial-gradient(circle at 15% 15%, rgba(139, 0, 0, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 85% 85%, rgba(255, 0, 0, 0.05) 0%, transparent 40%);
            min-height: 100vh;
        }

        .container { max-width: 1100px; margin: 0 auto; padding: 4rem 2rem; }

        .header { text-align: center; margin-bottom: 4rem; position: relative; }
        .header h1 {
            font-family: 'Cinzel', serif;
            font-size: clamp(2rem, 8vw, 4.5rem);
            background: linear-gradient(to bottom, #fff 20%, #ff0000 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 4px;
            filter: drop-shadow(0 0 10px rgba(255, 0, 0, 0.3));
        }

        .user-badge {
            position: absolute;
            top: -20px;
            right: 0;
            display: flex;
            align-items: center;
            gap: 12px;
            background: var(--card-bg);
            padding: 8px 16px;
            border-radius: 4px;
            border: 1px solid var(--border);
            font-size: 0.85rem;
            backdrop-filter: blur(10px);
            box-shadow: var(--glow);
        }
        .user-badge img { width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--primary); }
        .logout-btn { color: var(--primary); text-decoration: none; font-weight: 700; margin-left: 8px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }
        .logout-btn:hover { color: #fff; text-shadow: 0 0 5px var(--primary); }

        .grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2.5rem; }
        @media (max-width: 800px) { .grid { grid-template-columns: 1fr; } .user-badge { position: relative; top: 0; margin-bottom: 2rem; justify-content: center; } }

        .section {
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--border);
            border-radius: 4px;
            padding: 2.5rem;
            margin-bottom: 2rem;
            box-shadow: inset 0 0 20px rgba(255, 0, 0, 0.05);
            transition: border-color 0.3s ease;
        }
        .section:hover { border-color: rgba(255, 0, 0, 0.4); }

        h2 { font-family: 'Cinzel', serif; font-size: 1.3rem; margin-bottom: 2rem; color: var(--primary); letter-spacing: 2px; text-transform: uppercase; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
        h3 { font-family: 'Rajdhani', sans-serif; font-weight: 700; color: #fff; }

        .tag {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 2px;
            background: rgba(255,0,0,0.05);
            border: 1px solid var(--border);
            font-size: 0.9rem;
            margin: 0 8px 8px 0;
            font-weight: 600;
            color: var(--text-dim);
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .tag.active { border-color: var(--primary); color: #fff; box-shadow: 0 0 10px rgba(255, 0, 0, 0.2); background: rgba(255,0,0,0.1); }
        .tag.inactive { opacity: 0.2; }

        .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
        .pulse { animation: pulse 2s infinite; box-shadow: 0 0 10px currentColor; }
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }

        code { font-family: 'Rajdhani', sans-serif; color: var(--primary); background: rgba(255,0,0,0.08); padding: 2px 6px; border-radius: 2px; font-weight: 600; }
        pre { background: #000; padding: 1.5rem; border-radius: 4px; border: 1px solid var(--border); overflow-x: auto; font-size: 0.9rem; margin: 1rem 0; color: #ff9999; border-left: 4px solid var(--primary); }

        .method { font-weight: 700; font-size: 0.75rem; padding: 3px 10px; border-radius: 2px; vertical-align: middle; margin-right: 10px; letter-spacing: 1px; box-shadow: 0 0 10px rgba(0,0,0,0.5); }
        .method.post { background: var(--primary); color: white; }
        .method.get { background: #fff; color: black; }

        .endpoint-card { border-bottom: 1px solid var(--border); padding: 2rem 0; }
        .endpoint-card:first-child { padding-top: 0; }
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
