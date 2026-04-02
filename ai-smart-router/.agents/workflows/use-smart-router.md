---
description: Comment utiliser le SmartRouter pour optimiser les appels IA
---

# 🛠️ Workflow : Utilisation du SmartRouter 🧠

Ce workflow explique comment intégrer le router intelligent dans un nouveau service ou script.

## Étapes

1. **Importation**

   ```javascript
   const SmartRouter = require("./path/to/router");
   ```

2. **Initialisation**
   Configurez le router avec votre clé API.

   ```javascript
   const router = new SmartRouter({ apiKey: process.env.GEMINI_API_KEY });
   ```

3. **Exécution de Requête**
   Utilisez `generate(prompt)` au lieu d'appeler directement le SDK Google.

   ```javascript
   const response = await router.generate("Votre prompt ici");
   ```

4. **Validation du Routing**
   Vérifiez les logs console pour voir quel modèle a été choisi (Pro vs Flash).

## Pourquoi utiliser ce workflow ?

- **Résilience** : Bascule automatique sur un autre modèle si le quota est atteint.
- **Économie/Performance** : Ne sollicite les gros modèles que pour les tâches qui le méritent.
