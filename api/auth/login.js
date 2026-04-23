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
    <title>Connexion | AI Smart Router</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    <style>
        :root {
            --bg: #030303;
            --primary: #00f2ff;
            --secondary: #7000ff;
            --text: #ffffff;
            --card-bg: rgba(15, 15, 15, 0.8);
            --border: rgba(255, 255, 255, 0.08);
        }
        body {
            background-color: var(--bg);
            color: var(--text);
            font-family: 'Outfit', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background-image: radial-gradient(circle at center, rgba(112, 0, 255, 0.05) 0%, transparent 70%);
        }
        .login-card {
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            padding: 3rem;
            border-radius: 32px;
            border: 1px solid var(--border);
            text-align: center;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            max-width: 400px;
            width: 100%;
        }
        h1 {
            font-size: 2rem;
            margin-bottom: 2rem;
            background: linear-gradient(to right, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .g_id_signin {
            display: flex;
            justify-content: center;
        }
    </style>
</head>
<body>
    <div class="login-card">
        <h1>Authentification</h1>
        <p style="color: #888; margin-bottom: 2rem;">Accès réservé à l'administrateur</p>
        
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
</body>
</html>
  `;

  res.status(200).send(html);
};
