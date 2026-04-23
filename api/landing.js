const { applySecurityHeaders } = require("../lib/security-headers");

module.exports = async (req, res) => {
  applySecurityHeaders(res);
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DarkMedia-X | AI Smart Router</title>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Outfit:wght@300;400;600;800&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --red: #ff0000;
            --red-glow: rgba(255, 0, 0, 0.5);
            --bg: #050505;
            --panel: rgba(15, 5, 5, 0.6);
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
            background-image: 
                radial-gradient(circle at 15% 15%, rgba(139, 0, 0, 0.1) 0%, transparent 40%),
                radial-gradient(circle at 85% 85%, rgba(255, 0, 0, 0.08) 0%, transparent 40%);
        }

        .hero {
            text-align: center;
            z-index: 10;
            width: 100%;
            max-width: 900px;
            padding: 2.5rem;
            background: rgba(10, 5, 5, 0.4);
            backdrop-filter: blur(20px);
            border: 1px solid var(--border);
            border-radius: 4px;
        }

        .brand-logo {
            font-family: 'Cinzel', serif;
            font-size: clamp(2rem, 10vw, 4.5rem);
            letter-spacing: 0.2em;
            background: linear-gradient(180deg, #fff 0%, var(--red) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
            filter: drop-shadow(0 0 15px var(--red-glow));
            animation: fadeInDown 1.5s ease-out;
            text-transform: uppercase;
        }

        .tagline {
            font-size: clamp(0.8rem, 3vw, 1.1rem);
            text-transform: uppercase;
            letter-spacing: 0.5em;
            color: var(--text-dim);
            margin-bottom: 3rem;
            font-weight: 300;
            animation: fadeInUp 1.5s ease-out 0.5s both;
        }

        .links-container {
            display: flex;
            justify-content: center;
            gap: 2rem;
            animation: fadeIn 2s ease-out 1s both;
        }

        .btn {
            text-decoration: none;
            color: var(--text);
            font-size: 0.9rem;
            font-weight: 700;
            letter-spacing: 0.25em;
            text-transform: uppercase;
            padding: 1.2rem 2.8rem;
            border: 1px solid var(--border);
            border-radius: 2px;
            background: var(--panel);
            transition: all 0.4s ease;
            position: relative;
            overflow: hidden;
        }

        .btn:hover {
            border-color: var(--red);
            box-shadow: 0 0 30px var(--red-glow);
            transform: translateY(-5px);
            background: rgba(255, 0, 0, 0.1);
            color: #fff;
        }

        .btn.primary {
            background: var(--red);
            border-color: var(--red);
            color: #fff;
            box-shadow: 0 0 20px rgba(255, 0, 0, 0.3);
        }

        .btn.primary:hover {
            background: #fff;
            color: var(--red);
            border-color: #fff;
        }

        /* Animations */
        @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        /* Embers / Particles */
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
            10% { opacity: 0.3; }
            90% { opacity: 0.3; }
            100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
        }
    </style>
</head>
<body>
    <div class="particles" id="particles"></div>

    <main class="hero">
        <h1 class="brand-logo">DARKMEDIA-X</h1>
        <p class="tagline">Neural Network Gateway</p>
        
        <div class="links-container">
            <a href="https://darkmedia-x.com/linktree/" class="btn" target="_blank">Linktree</a>
            <a href="/docs" class="btn primary">Documentation API</a>
        </div>
    </main>

    <script>
        const particlesContainer = document.getElementById('particles');
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const size = Math.random() * 3 + 1;
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
