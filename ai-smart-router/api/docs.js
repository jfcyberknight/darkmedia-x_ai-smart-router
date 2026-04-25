const fs = require('fs');
const path = require('path');

// Helper to find API.md in either current or parent directory
function findApiMd() {
  const paths = [
    path.join(process.cwd(), 'API.md'),
    path.join(process.cwd(), '..', 'API.md')
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

module.exports = async (req, res) => {
  // Try to find the security-headers lib
  let applySecurityHeaders;
  try {
    applySecurityHeaders = require("../lib/security-headers").applySecurityHeaders;
  } catch (e) {
    try {
      applySecurityHeaders = require("../../lib/security-headers").applySecurityHeaders;
    } catch (e2) {
      applySecurityHeaders = (res) => {}; // Fallback
    }
  }

  applySecurityHeaders(res);
  
  try {
    const filePath = findApiMd();
    if (!filePath) throw new Error('API.md not found');
    
    const markdown = fs.readFileSync(filePath, 'utf8');

    res.setHeader("Content-Type", "text/html; charset=utf-8");

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentation API | DarkMedia-X</title>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Outfit:wght@300;400;600&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-dark.min.css">
    <style>
        :root {
            --red: #ff0000;
            --red-glow: rgba(255, 0, 0, 0.5);
            --bg: #050505;
            --panel: rgba(15, 5, 5, 0.8);
            --border: rgba(255, 0, 0, 0.2);
            --text: #ffffff;
        }

        body {
            background-color: var(--bg);
            color: var(--text);
            font-family: 'Outfit', sans-serif;
            margin: 0;
            padding: 0;
            background-image: 
                radial-gradient(circle at 15% 15%, rgba(139, 0, 0, 0.1) 0%, transparent 40%),
                radial-gradient(circle at 85% 85%, rgba(255, 0, 0, 0.08) 0%, transparent 40%);
            min-height: 100vh;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
            position: relative;
            z-index: 10;
        }

        header {
            margin-bottom: 3rem;
            border-bottom: 1px solid var(--border);
            padding-bottom: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .brand-logo {
            font-family: 'Cinzel', serif;
            font-size: 1.5rem;
            letter-spacing: 0.1em;
            text-decoration: none;
            color: #fff;
            background: linear-gradient(180deg, #fff 0%, var(--red) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 0 5px var(--red-glow));
            text-transform: uppercase;
        }

        .back-link {
            color: var(--text);
            text-decoration: none;
            font-family: 'Rajdhani', sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-size: 0.9rem;
            border: 1px solid var(--border);
            padding: 0.5rem 1rem;
            border-radius: 2px;
            transition: all 0.3s ease;
        }

        .back-link:hover {
            border-color: var(--red);
            box-shadow: 0 0 10px var(--red-glow);
            background: rgba(255, 0, 0, 0.1);
        }

        #content {
            background: var(--panel);
            padding: 3rem;
            border: 1px solid var(--border);
            border-radius: 4px;
            backdrop-filter: blur(10px);
        }

        /* Customizing GitHub Markdown Dark for DarkMedia-X */
        .markdown-body {
            background-color: transparent !important;
            font-family: 'Outfit', sans-serif !important;
        }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
            border-bottom-color: var(--border) !important;
            font-family: 'Rajdhani', sans-serif !important;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .markdown-body code {
            background-color: rgba(255, 0, 0, 0.1) !important;
            color: #ff8888 !important;
        }
        .markdown-body pre {
            background-color: rgba(0, 0, 0, 0.5) !important;
            border: 1px solid var(--border);
        }
        .markdown-body a {
            color: #ff4444 !important;
        }
        .markdown-body table tr {
            background-color: rgba(15, 5, 5, 0.6) !important;
            border-top: 1px solid var(--border) !important;
        }
        .markdown-body table tr:nth-child(2n) {
            background-color: rgba(30, 10, 10, 0.4) !important;
        }
        .markdown-body table th, .markdown-body table td {
            border: 1px solid var(--border) !important;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <a href="/" class="brand-logo">DARKMEDIA-X</a>
            <a href="/" class="back-link">← Retour</a>
        </header>
        <div id="content" class="markdown-body">
            Chargement de la documentation...
        </div>
    </div>

    <script>
        const markdownContent = ${JSON.stringify(markdown)};
        document.getElementById('content').innerHTML = marked.parse(markdownContent);
    </script>
</body>
</html>
    `;

    res.status(200).send(html);
  } catch (error) {
    console.error('Error loading API.md:', error);
    res.status(500).send('Error loading documentation');
  }
};
