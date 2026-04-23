const { applySecurityHeaders } = require("../../lib/security-headers");

module.exports = async (req, res) => {
  applySecurityHeaders(res);
  
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).send("GOOGLE_CLIENT_ID non configuré dans les variables d'environnement.");
  }

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion | DarkMedia-X</title>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Outfit:wght@300;400;600;800&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet">
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    <style>
        :root {
            --red: #c41e3a;
            --red-glow: rgba(196, 30, 58, 0.6);
            --bg: #050505;
            --panel: rgba(255, 255, 255, 0.03);
            --border: rgba(196, 30, 58, 0.3);
            --text: #e8d5c4;
            --text-dim: #9daab8;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background-color: var(--bg);
            color: var(--text);
            font-family: 'Outfit', sans-serif;
            overflow: hidden;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Ambient Background */
        body::before {
            content: '';
            position: absolute;
            inset: 0;
            background: 
                radial-gradient(circle at 20% 20%, rgba(196, 30, 58, 0.1) 0%, transparent 40%),
                radial-gradient(circle at 80% 80%, rgba(112, 0, 255, 0.05) 0%, transparent 40%);
            z-index: -1;
        }

        .login-card {
            background: var(--panel);
            backdrop-filter: blur(25px);
            padding: 3.5rem;
            border-radius: 4px;
            border: 1px solid var(--border);
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 20px rgba(196, 30, 58, 0.1);
            max-width: 450px;
            width: 90%;
            z-index: 10;
            animation: fadeIn 1s ease-out;
        }

        .brand-name {
            font-family: 'Cinzel', serif;
            font-size: 1.8rem;
            letter-spacing: 0.15em;
            background: linear-gradient(135deg, #fff 0%, var(--red) 50%, #8b0000 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
            filter: drop-shadow(0 0 10px var(--red-glow));
        }

        h1 {
            font-family: 'Rajdhani', sans-serif;
            font-size: 1.5rem;
            text-transform: uppercase;
            letter-spacing: 0.3em;
            color: var(--text);
            margin-bottom: 2rem;
            margin-top: 1rem;
        }

        p {
            font-family: 'Rajdhani', sans-serif;
            color: var(--text-dim);
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            margin-bottom: 2.5rem;
        }

        .g_id_signin {
            display: flex;
            justify-content: center;
            padding: 4px;
            border-radius: 50px;
            background: rgba(196, 30, 58, 0.05);
            border: 1px solid var(--border);
            box-shadow: 0 0 15px rgba(196, 30, 58, 0.1);
            transition: all 0.3s ease;
        }
        .g_id_signin:hover {
            border-color: var(--red);
            box-shadow: 0 0 25px var(--red-glow);
            transform: scale(1.02);
        }

        /* Particles */
        .particles {
            position: fixed;
            inset: 0;
            z-index: 1;
            pointer-events: none;
        }
        .particle {
            position: absolute;
            background: var(--red);
            border-radius: 50%;
            filter: blur(1px);
            opacity: 0.3;
            animation: float 20s infinite linear;
        }
        @keyframes float {
            0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
            10% { opacity: 0.2; }
            90% { opacity: 0.2; }
            100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
    </style>
</head>
<body>
    <div class="particles" id="particles"></div>

    <div class="login-card">
        <div class="brand-name">DARKMEDIA-X</div>
        <h1>Authentification</h1>
        <p>Accès réservé à l'administrateur</p>
        
        <div id="g_id_onload"
             data-client_id="${GOOGLE_CLIENT_ID}"
             data-context="signin"
             data-ux_mode="redirect"
             data-login_uri="${(req.headers['x-forwarded-proto'] || 'http') + '://' + req.headers.host}/api/auth/callback"
             data-auto_prompt="false">
        </div>

        <div class="g_id_signin"
             data-type="standard"
             data-shape="pill"
             data-theme="filled_black"
             data-text="signin_with"
             data-size="large"
             data-logo_alignment="left">
        </div>
    </div>

    <script>
        const particlesContainer = document.getElementById('particles');
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const size = Math.random() * 2 + 1;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.left = Math.random() * 100 + 'vw';
            p.style.animationDuration = (Math.random() * 10 + 10) + 's';
            p.style.animationDelay = (Math.random() * 20) + 's';
            particlesContainer.appendChild(p);
        }
    </script>
</body>
</html>
  `;

  res.status(200).send(html);
};
