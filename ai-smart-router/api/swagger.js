const fs = require('fs');
const path = require('path');
const { getSessionFromRequest } = require("../lib/auth-google");

module.exports = async (req, res) => {
  const session = getSessionFromRequest(req);
  if (!session) return res.redirect("/api/auth/login");

  try {
    let filePath = path.join(process.cwd(), 'openapi.json');
    if (!fs.existsSync(filePath)) filePath = path.join(process.cwd(), '..', 'openapi.json');
    
    const spec = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    res.setHeader("Content-Type", "text/html; charset=utf-8");

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>API Documentation | DarkMedia-X</title>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Outfit:wght@300;400;600&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
    <style>
        :root {
            --red: #ff0000;
            --red-glow: rgba(255, 0, 0, 0.5);
            --bg: #050505;
            --panel: rgba(15, 5, 5, 0.9);
            --border: rgba(255, 0, 0, 0.2);
        }

        body { 
            margin: 0; 
            background: var(--bg);
            font-family: 'Outfit', sans-serif;
            background-image: 
                radial-gradient(circle at 15% 15%, rgba(139, 0, 0, 0.1) 0%, transparent 40%),
                radial-gradient(circle at 85% 85%, rgba(255, 0, 0, 0.08) 0%, transparent 40%);
            min-height: 100vh;
        }

        .custom-header {
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--border);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 1000;
        }
        .brand-logo {
            font-family: 'Cinzel', serif;
            font-size: 1.5rem;
            letter-spacing: 0.1em;
            text-decoration: none;
            background: linear-gradient(180deg, #fff 0%, var(--red) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 0 5px var(--red-glow));
            text-transform: uppercase;
        }
        .user-info {
            display: flex;
            align-items: center;
            gap: 1rem;
            color: #fff;
            font-size: 0.9rem;
            font-family: 'Rajdhani', sans-serif;
        }
        .user-info img { width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--red); }

        .swagger-ui { 
            filter: invert(88%) hue-rotate(180deg) brightness(1.1);
            max-width: 1100px;
            margin: 0 auto;
            padding: 20px;
            background: transparent !important;
        }
        
        .swagger-ui .topbar, 
        .swagger-ui .info .title,
        .swagger-ui .opblock-summary-method,
        .swagger-ui .btn.authorize {
            filter: invert(1) hue-rotate(-180deg) brightness(0.9);
        }

        .swagger-ui .info .title {
            font-family: 'Cinzel', serif !important;
            color: var(--red) !important;
            text-transform: uppercase;
        }

        .swagger-ui .scheme-container {
            background: transparent !important;
            box-shadow: none !important;
            border-bottom: 1px solid rgba(0,0,0,0.1);
        }

        .swagger-ui section.models {
            border: 1px solid rgba(0,0,0,0.1);
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <header class="custom-header">
        <a href="/" class="brand-logo">DARKMEDIA-X</a>
        <div class="user-info">
            <span>${session.email}</span>
            <img src="${session.picture || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}" alt="Avatar">
        </div>
    </header>

    <div id="swagger-ui"></div>

    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                spec: ${JSON.stringify(spec)},
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                layout: "BaseLayout",
                defaultModelsExpandDepth: -1,
                requestInterceptor: (req) => {
                    req.credentials = 'include';
                    return req;
                }
            });
        };
    </script>
</body>
</html>
    `;

    res.status(200).send(html);
  } catch (error) {
    console.error('Error serving Swagger UI:', error);
    res.status(500).send('Error loading API specification');
  }
};
