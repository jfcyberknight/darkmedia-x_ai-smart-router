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
            --red: #ff0000;
            --red-glow: rgba(255, 0, 0, 0.5);
            --bg: #050505;
            --panel: rgba(10, 5, 5, 0.7);
            --border: rgba(255, 0, 0, 0.2);
            --text: #ffffff;
            --text-dim: #888;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background-color: var(--bg);
            color: var(--text);
            font-family: 'Rajdhani', sans-serif;
            overflow: hidden;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-image: radial-gradient(circle at 50% 50%, rgba(139, 0, 0, 0.15) 0%, transparent 60%);
        }

        .login-card {
            background: var(--panel);
            backdrop-filter: blur(25px);
            padding: 3.5rem;
            border-radius: 2px;
            border: 1px solid var(--border);
            text-align: center;
            box-shadow: 0 0 50px rgba(0,0,0,0.8);
            max-width: 450px;
            width: 90%;
            z-index: 10;
            animation: fadeIn 1s ease-out;
        }

        .brand-name {
            font-family: 'Cinzel', serif;
            font-size: 2.2rem;
            letter-spacing: 0.2em;
            background: linear-gradient(180deg, #fff 0%, var(--red) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 1rem;
            filter: drop-shadow(0 0 15px var(--red-glow));
            text-transform: uppercase;
        }

        h1 {
            font-size: 1.2rem;
            text-transform: uppercase;
            letter-spacing: 0.4em;
            color: var(--text);
            margin-bottom: 2.5rem;
            font-weight: 300;
        }

        .g_id_signin {
            display: flex;
            justify-content: center;
            padding: 10px;
            border-radius: 2px;
            background: rgba(255, 0, 0, 0.05);
            border: 1px solid var(--border);
            transition: all 0.3s ease;
        }
        .g_id_signin:hover {
            border-color: var(--red);
            box-shadow: 0 0 25px var(--red-glow);
            background: rgba(255, 0, 0, 0.1);
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
    <script>
        function handleCredentialResponse(response) {
            // Envoyer le credential (idToken) au callback via un formulaire POST
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/api/auth/callback';
            
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'credential';
            input.value = response.credential;
            
            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();
        }
    </script>
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
             data-callback="handleCredentialResponse"
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
