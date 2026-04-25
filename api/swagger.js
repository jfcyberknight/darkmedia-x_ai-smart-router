const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'openapi.json');
    const spec = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    res.setHeader("Content-Type", "text/html; charset=utf-8");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Swagger UI - DarkMedia-X</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin: 0; background: #050505; }
        .swagger-ui { filter: invert(0.9) hue-rotate(180deg); background: #fff; padding: 20px; border-radius: 8px; }
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { color: #ff0000 !important; }
    </style>
</head>
<body>
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
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "BaseLayout"
            });
            window.ui = ui;
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
