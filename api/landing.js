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

        .hero {
            text-align: center;
            z-index: 10;
            max-width: 600px;
            padding: 2rem;
        }

        .brand-logo {
            font-family: 'Cinzel', serif;
            font-size: 4.5rem;
            letter-spacing: 0.2em;
            background: linear-gradient(135deg, #fff 0%, var(--red) 50%, #8b0000 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
            filter: drop-shadow(0 0 20px var(--red-glow));
            animation: fadeInDown 1.5s ease-out;
        }

        .tagline {
            font-family: 'Rajdhani', sans-serif;
            font-size: 1.2rem;
            text-transform: uppercase;
            letter-spacing: 0.5em;
            color: var(--text-dim);
            margin-bottom: 3rem;
            animation: fadeInUp 1.5s ease-out 0.5s both;
        }

        .links-container {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            animation: fadeIn 2s ease-out 1s both;
        }

        .btn {
            text-decoration: none;
            color: var(--text);
            font-family: 'Rajdhani', sans-serif;
            font-size: 1rem;
            font-weight: 700;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            padding: 1.2rem 2.5rem;
            border: 1px solid var(--border);
            border-radius: 4px;
            background: var(--panel);
            backdrop-filter: blur(10px);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
        }

        .btn::before {
            content: '';
            position: absolute;
            top: 0; left: -100%;
            width: 100%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(196, 30, 58, 0.2), transparent);
            transition: 0.5s;
        }

        .btn:hover::before { left: 100%; }

        .btn:hover {
            border-color: var(--red);
            box-shadow: 0 0 30px var(--red-glow);
            transform: translateY(-5px) scale(1.02);
            background: rgba(196, 30, 58, 0.05);
        }

        .btn.primary {
            border-color: var(--red);
            box-shadow: 0 0 15px rgba(196, 30, 58, 0.2);
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
        <h1 class="brand-logo">DARKMEDIA</h1>
        <p class="tagline">Neural Network Gateway</p>
        
        <div class="links-container">
            <a href="https://linktr.ee/darkmedia" class="btn" target="_blank">Linktree</a>
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
