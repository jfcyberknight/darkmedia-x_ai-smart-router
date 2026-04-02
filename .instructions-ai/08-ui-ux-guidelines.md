# 🎨 Directives UI/UX et CLI

**Version**: 2.0 | **Philosophie**: Darkmedia-X Premium Experience

---

## 🎯 [PHILOSOPHY] Principes Esthétiques

### Darkmedia-X Color Palette
```
Cyan (#00D9FF)      → Titres, headers, infos principales
Green (#00FF41)     → Succès, confirmations, positif
Yellow (#FFD700)    → Alertes, avertissements
Red (#FF1744)       → Erreurs, critique
Gray (#666666)      → Texte secondaire, subtle
White (#FFFFFF)     → Texte principal
Black (#000000)     → Fond (terminal dark mode)
```

### Principes de Design
1. **Minimalisme** : Pas de distraction inutile
2. **Clarté** : Chaque élément doit avoir un but
3. **Cohérence** : Utiliser les mêmes patterns partout
4. **Feedback** : Utilisateur toujours informé du statut
5. **Accessibilité** : Lisible sans couleurs (pour daltoniens)

---

## 🖥️ [CLI] Interface Ligne de Commande

### Headers et Footers Professionnels

```powershell
# ✅ BON - Esthétique premium
function Show-Header {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                       ║" -ForegroundColor Cyan
    Write-Host "║   🚀 Darkmedia-X Installation       ║" -ForegroundColor Cyan
    Write-Host "║   Version 2.0 - Premium Edition      ║" -ForegroundColor Cyan
    Write-Host "║                                       ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Footer {
    Write-Host ""
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "Installation terminée avec succès!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "▶ $Title" -ForegroundColor Cyan
    Write-Host "  " + ("-" * 40) -ForegroundColor Gray
}
```

### Messages d'État

```powershell
# ✅ Succès
Write-Host "✅ Installation réussie!" -ForegroundColor Green

# ⚠️  Avertissement
Write-Host "⚠️  Attention: Ce processus peut prendre du temps" -ForegroundColor Yellow

# ❌ Erreur
Write-Host "❌ Erreur critique: Impossible de continuer" -ForegroundColor Red

# ℹ️  Information
Write-Host "ℹ️  Installation en cours..." -ForegroundColor Cyan

# 🔄 En cours
Write-Host "🔄 Téléchargement des dépendances..." -ForegroundColor Cyan
```

### Progress Bars

```powershell
# ✅ Bonne progress bar
for ($i = 0; $i -le 100; $i++) {
    $percent = [math]::Round(($i / 100) * 100)
    $filled = [math]::Round(($i / 100) * 50)
    $empty = 50 - $filled
    
    $bar = "█" * $filled + "░" * $empty
    Write-Progress -Activity "Installation" -Status "[$bar] $percent%" -PercentComplete $i
    Start-Sleep -Milliseconds 50
}
```

### Tableaux de Données

```powershell
# ✅ Format de table propre et aligné
$data = @(
    [PSCustomObject]@{Name="Service"; Status="Running"; Port=8080}
    [PSCustomObject]@{Name="Database"; Status="Running"; Port=5432}
    [PSCustomObject]@{Name="Cache"; Status="Stopped"; Port=6379}
)

Write-Host ""
Write-Host "Services Status:" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

$data | Format-Table -AutoSize -Property @(
    @{Label="Name"; Expression={$_.Name}; Width=15}
    @{Label="Status"; Expression={$_.Status}; Width=15}
    @{Label="Port"; Expression={$_.Port}; Width=10}
)
```

### Menu Interactif

```powershell
# ✅ Menu choix utilisateur
function Show-Menu {
    Write-Host ""
    Write-Host "╔═ Sélectionnez une option ═╗" -ForegroundColor Cyan
    Write-Host "║                           ║" -ForegroundColor Cyan
    Write-Host "║ 1. Installer Qdrant       ║" -ForegroundColor Cyan
    Write-Host "║ 2. Configurer Database    ║" -ForegroundColor Cyan
    Write-Host "║ 3. Exécuter Tests         ║" -ForegroundColor Cyan
    Write-Host "║ 4. Quitter                ║" -ForegroundColor Cyan
    Write-Host "║                           ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════╝" -ForegroundColor Cyan
    
    $choice = Read-Host "Entrez votre choix (1-4)"
    return $choice
}
```

---

## 🌐 [WEB] Interface Web

> [!IMPORTANT]
> **Architecture Dashboard** : Tous les dashboards doivent être implémentés comme des applications complètes (Vite/React/Vanilla App) avec une structure `/src` et `/public`, conformément à [07-architecture-patterns.md](07-architecture-patterns.md). L'utilisation de fichiers HTML uniques pour les dashboards est proscrite.

### Typography

```css
/* ✅ BON - Hiérarchie claire */
h1 { font-size: 2.5rem; font-weight: 700; color: #00D9FF; }
h2 { font-size: 2rem; font-weight: 600; color: #00D9FF; }
h3 { font-size: 1.5rem; font-weight: 500; color: #333; }

body { 
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
}

code { 
  font-family: 'Courier New', monospace;
  background: #f4f4f4;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
}
```

### Spacing et Layout

```css
/* Spacing cohérent (4px base) */
.container { padding: 2rem; }
.section { margin-bottom: 2rem; }
.card { margin: 1rem; padding: 1.5rem; }
.button { padding: 0.75rem 1.5rem; }
```

### Buttons

```html
<!-- ✅ States clairs -->
<button class="btn btn-primary">Actif</button>
<button class="btn btn-primary" disabled>Disabled</button>
<button class="btn btn-secondary">Secondaire</button>
<button class="btn btn-danger">Danger</button>
<button class="btn btn-success">Success</button>
```

### Forms

```html
<!-- ✅ Formulaire accessible -->
<form>
  <div class="form-group">
    <label for="email">Email</label>
    <input 
      type="email" 
      id="email" 
      name="email" 
      required
      placeholder="user@example.com"
      aria-describedby="email-help"
    />
    <small id="email-help">Nous ne partagerons jamais votre email</small>
  </div>
  
  <div class="form-group">
    <label for="password">Mot de passe</label>
    <input 
      type="password" 
      id="password" 
      name="password" 
      required
      minlength="8"
    />
  </div>
  
  <button type="submit" class="btn btn-primary">Se connecter</button>
</form>
```

---

## 📱 [RESPONSIVE] Responsive Design

### 🚀 Mobile First - Approche Obligatoire

> [!CRITICAL]
> **Mobile First est NON NÉGOCIABLE** - Tous les designs doivent commencer par mobile et progresser vers les écrans plus grands. Ceci garantit une meilleure UX, performance et accessibilité.

#### Principes Mobile First

1. **Commencer PETIT**: Concevoir d'abord pour mobile (320px - 480px)
2. **Progresser**: Utiliser `min-width` media queries pour les écrans plus grands
3. **Optimiser**: Chaque breakpoint doit améliorer l'expérience, pas juste adapter le layout
4. **Performance**: Mobile first force à prioriser le contenu essentiel
5. **Accessibilité**: Les petits écrans = meilleure hiérarchie de l'info

#### Breakpoints Standards

```css
/* Mobile-First Breakpoints */
/* 320px - 480px  */ /* Default (mobile petit) */
/* 480px - 768px  */ /* Mobile grand / Phablet */
/* 768px - 1024px */ /* Tablet */
/* 1024px+        */ /* Desktop */
```

#### Exemple Mobile First Correct

```css
/* ✅ BON - Commencer par mobile */

/* MOBILE (par défaut - 320px+) */
.container { 
  width: 100%; 
  padding: 1rem; 
  margin: 0 auto;
}

.grid { 
  display: grid; 
  grid-template-columns: 1fr;  /* Une colonne sur mobile */
  gap: 1rem;
}

.card {
  padding: 1rem;
  font-size: 1rem;
}

.button {
  width: 100%;  /* Boutons pleine largeur sur mobile */
  padding: 0.75rem;
  font-size: 1rem;
}

.navigation {
  display: flex;
  flex-direction: column;  /* Vertical sur mobile */
  gap: 0.5rem;
}

/* PHABLET (480px+) */
@media (min-width: 480px) {
  .container { 
    padding: 1.5rem; 
  }
  
  .button {
    width: auto;  /* Buttons can be inline now */
  }
  
  .navigation {
    flex-direction: row;
    justify-content: flex-start;
    gap: 1rem;
  }
}

/* TABLET (768px+) */
@media (min-width: 768px) {
  .container { 
    width: 90%; 
    margin: 0 auto;
    padding: 2rem;
  }
  
  .grid { 
    grid-template-columns: 1fr 1fr;  /* Deux colonnes sur tablet */
  }
  
  .navigation {
    justify-content: space-between;
  }
}

/* DESKTOP (1024px+) */
@media (min-width: 1024px) {
  .container { 
    width: 1200px; 
    margin: 0 auto;
    padding: 2.5rem;
  }
  
  .grid { 
    grid-template-columns: 1fr 1fr 1fr;  /* Trois colonnes */
  }
  
  .sidebar {
    display: block;  /* Sidebar caché sur mobile, visible ici */
  }
}

/* LARGE DESKTOP (1400px+) */
@media (min-width: 1400px) {
  .container { 
    width: 1400px;
  }
  
  .grid { 
    grid-template-columns: repeat(4, 1fr);
  }
}
```

#### Ce qu'il FAUT FAIRE

✅ **Mobile First Checklist**:
- [ ] Commencer le CSS SANS media queries (mobile par défaut)
- [ ] Utiliser UNIQUEMENT `min-width` (jamais `max-width` en mobile-first)
- [ ] Tester sur vrais appareils mobiles (pas juste Chrome DevTools)
- [ ] Priorité au contenu esssentiel sur mobile
- [ ] Boutons assez grands pour tactile (min 44x44px)
- [ ] Texte lisible sans zoom (min 16px)
- [ ] Images responsives avec srcset
- [ ] Touch targets espacés (min 8px d'espace)
- [ ] Performance optimisée (lazy loading, critères de Cumulative Layout Shift)
- [ ] Tester en conditions réseau 4G/3G lent

#### Ce qu'il NE FAUT PAS FAIRE

❌ **Anti-patterns Mobile First**:
- [ ] ❌ Cacher du contenu crucial sur mobile avec `display: none`
- [ ] ❌ Utiliser `max-width` media queries (c'est desktop-first)
- [ ] ❌ Ignorer le responsive design "on va le faire après"
- [ ] ❌ Mettre des images haute-res sur mobile sans optimisation
- [ ] ❌ Oublier le viewport meta tag
- [ ] ❌ Boutons trop petits (< 44x44px)
- [ ] ❌ Texte trop petit sans possibilité de zoom
- [ ] ❌ Hamburger menus complexes sans raison
- [ ] ❌ Scroller horizontal
- [ ] ❌ Pédanterie avec les media queries (keep it simple)

#### Viewport Meta Tag (OBLIGATOIRE)

```html
<!-- ✅ À ajouter dans TOUS les <head> -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
```

#### Images Responsives

```html
<!-- ✅ Images adaptatives -->
<img 
  src="image-mobile.webp"
  srcset="
    image-small.webp 480w,
    image-medium.webp 768w,
    image-large.webp 1024w
  "
  alt="Description pour accessibilité"
  sizes="(max-width: 480px) 100vw,
         (max-width: 768px) 90vw,
         1200px"
/>

<!-- ✅ Picture element pour format différents -->
<picture>
  <source media="(min-width: 1024px)" srcset="desktop.webp">
  <source media="(min-width: 768px)" srcset="tablet.webp">
  <img src="mobile.webp" alt="Description">
</picture>
```

#### Flex/Grid Mobile First

```css
/* ✅ Mobile first avec flexbox */
.flex-container {
  display: flex;
  flex-direction: column;  /* Vertical par défaut */
  gap: 1rem;
}

@media (min-width: 768px) {
  .flex-container {
    flex-direction: row;  /* Horizontal sur tablet+ */
    justify-content: space-between;
  }
}

/* ✅ Mobile first avec CSS Grid */
.grid-container {
  display: grid;
  grid-template-columns: 1fr;  /* 1 colonne par défaut */
  gap: 1rem;
  grid-auto-rows: auto;
}

@media (min-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);  /* 2 colonnes */
  }
}

@media (min-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(3, 1fr);  /* 3 colonnes */
  }
}
```

---

## ♿ [ACCESSIBILITY] Accessibilité

### Colors (Daltonisme)

```
❌ Ne pas utiliser UNIQUEMENT la couleur pour communiquer
✅ Ajouter des symboles ou du texte en complément

❌ Mauvais: "✅ Réussi" (vert) vs "❌ Échec" (rouge)
✅ Bon: "✅ Réussi" (vert + ✅) vs "❌ Échec" (rouge + ❌)
```

### Text Contrast

```
WCAG AA minimum: Ratio de contraste 4.5:1 pour le texte
WCAG AAA: Ratio de contraste 7:1

✅ Noir (#000) sur blanc (#FFF): 21:1 ✓
✅ Cyan (#00D9FF) sur noir: 8.6:1 ✓
❌ Gris clair sur blanc: 1.1:1 ✗
```

### Keyboard Navigation

```html
<!-- ✅ Tous les éléments interactifs doivent être accessibles au clavier -->
<button>Click me</button>        <!-- ✅ Accessible par défaut -->
<a href="#">Link</a>             <!-- ✅ Accessible par défaut -->
<div role="button" tabindex="0">Click</div>  <!-- ✅ Accessible avec tabindex -->

<!-- ❌ NON accessible -->
<div onclick="doSomething()">Click</div>  <!-- ❌ Pas au clavier -->
```

### ARIA Labels

```html
<!-- ✅ Labels descriptifs pour lecteurs d'écran -->
<button aria-label="Fermer le menu">×</button>
<input type="search" aria-label="Chercher utilisateurs" />
<div role="alert">Erreur: Email invalide</div>
<form aria-describedby="form-help">
  <p id="form-help">Tous les champs sont obligatoires</p>
</form>
```

---

## 📊 [FEEDBACK] User Feedback

### Loading States

```typescript
// ✅ Indiquer que quelque chose se charge
<div *ngIf="loading" class="spinner">
  <div class="spin-animation"></div>
  <p>Chargement en cours...</p>
</div>
```

### Notifications

```typescript
// ✅ Toast notifications
showNotification(message: string, type: 'success' | 'error' | 'warning') {
  const toast = {
    message,
    type,
    duration: 3000
  };
  this.notificationService.show(toast);
}

// Utilisation
this.showNotification('Utilisateur créé!', 'success');
this.showNotification('Erreur lors de la sauvegarde', 'error');
```

### Error Messages

```
❌ MAUVAIS: "Error 500"
✅ BON: "Impossible de se connecter à la base de données. Veuillez réessayer."

❌ MAUVAIS: "Invalid input"
✅ BON: "L'email doit être au format user@example.com"

❌ MAUVAIS: "Operation failed"
✅ BON: "La création de l'utilisateur a échoué. Cet email est déjà utilisé."
```

---

## ✅ Checklist UI/UX

- [ ] Palette de couleurs Darkmedia-X ✅
- [ ] Headers/footers esthétiques ✅
- [ ] Messages clairs et utiles ✅
- [ ] Progress bars pour tâches longues ✅
- [ ] Formulaires accessibles ✅
- [ ] **MOBILE FIRST - Commence par mobile (320px)** ✅ 🚀
- [ ] **Utilise UNIQUEMENT min-width media queries** ✅
- [ ] **Viewport meta tag configuré** ✅
- [ ] **Boutons tactiles (min 44x44px, 8px spacing)** ✅
- [ ] **Texte lisible (min 16px, contraste 4.5:1)** ✅
- [ ] **Images responsives (srcset, sizes)** ✅
- [ ] **Testé sur vrais appareils mobiles** ✅
- [ ] **Pas de display: none abus (contenu caché)** ✅
- [ ] **Performance optimisée (lazy loading, CLS)** ✅
- [ ] Contraste couleur suffisant ✅
- [ ] Navigation au clavier ✅
- [ ] Pas de couleur seule pour info ✅
- [ ] Feedback utilisateur immédiat ✅

---

## 🎯 Résumé Final

**Philosophie Darkmedia-X UI/UX**:
- 🚀 **Mobile First OBLIGATOIRE** - Chaque design commence sur mobile
- 🎨 **Palette cohérente** - Cyan, Green, Yellow, Red
- ♿ **Accessibilité d'abord** - WCAG AA minimum
- ⚡ **Performance** - Les utilisateurs mobiles d'abord
- 💬 **Feedback clair** - L'utilisateur sait TOUJOURS ce qui se passe
- 🎯 **Une expérience WOW** - Professionnelle, moderne et accessible

**Le Mobile First n'est pas une option - c'est notre norme.**