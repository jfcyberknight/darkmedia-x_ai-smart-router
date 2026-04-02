# 🔵 Standards PowerShell — Premium Edition

**Version**: 2.0 | **Édition**: Premium DARKMEDIA-X

---

## 🎯 [OVERVIEW] Principes Fondamentaux

PowerShell est un outil **puissant et professionnel**. Ce guide garantit que le code produit est :

- ✅ Robuste et maintenable
- ✅ Sécurisé et performant
- ✅ Esthétique et cohérent
- ✅ Automatable et réutilisable

---

## 📛 [NAMING] Conventions de Nommage

### Fonctions : Verb-Noun (Obligatoire)

```powershell
# ✅ BON
function Get-Configuration { }
function Set-UserPassword { }
function Install-Qdrant { }
function Test-Connection { }
function Invoke-Analysis { }

# ❌ MAUVAIS
function GetConfig { }
function get_config { }
function config { }
function doThing { }
```

Vérifier les verbes approuvés :
```powershell
Get-Verb | Sort-Object Verb
```

### Variables

```powershell
# ✅ Public — PascalCase
$ProjectRoot = "C:\Projects"
$UserCount   = 42
$IsProduction = $true

# ✅ Privé (dans une fonction) — camelCase
$tempPath   = [System.IO.Path]::GetTempPath()
$resultList = @()

# ❌ MAUVAIS
$project_root = "..."   # snake_case interdit
$proj         = "..."   # Abréviation interdite
```

---

## 📄 [ENCODING] UTF-8 with BOM (CRITIQUE ⚠️)

**TOUS les fichiers `.ps1` doivent être enregistrés en UTF-8 with BOM** pour :

- ✅ Support des caractères accentués (é, è, ç, à)
- ✅ Support des emojis dans les messages CLI
- ✅ Compatibilité Windows / Linux / macOS

### Configuration VSCode

```json
{
  "files.encoding": "utf8bom",
  "files.endOfLine": "crlf",
  "[powershell]": {
    "files.encoding": "utf8bom"
  }
}
```

### Forçage de l'Output (début de chaque script)

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding           = [System.Text.Encoding]::UTF8
```

---

## 🏗️ [ARCHITECTURE] Structure et Style

### Indentation : 4 espaces, jamais de tabulations

```powershell
# ✅ BON — OTBS (accolade sur la même ligne)
if ($condition) {
    Do-Something
}

foreach ($item in $collection) {
    Process-Item -Item $item
}

# ❌ MAUVAIS
if ($condition)
{
    Do-Something
}
```

### Pas d'Alias dans les Scripts

```powershell
# ✅ BON
Get-ChildItem -Path "C:\Temp"
Get-Content  -Path ".\config.json"
Remove-Item  -Path ".\old_file.txt"
Select-Object -Property Name, Size

# ❌ MAUVAIS
ls   "C:\Temp"
cat  ".\config.json"
rm   ".\old_file.txt"
```

### Splatting pour les Appels Complexes

```powershell
# ✅ BON — Lisible et maintenable
$params = @{
    Path        = "C:\Temp\File.txt"
    ItemType    = "File"
    Force       = $true
    ErrorAction = "Stop"
}
New-Item @params

# ❌ MAUVAIS — Ligne unique illisible
New-Item -Path "C:\Temp\File.txt" -ItemType File -Force -ErrorAction Stop
```

---

## ⚙️ [FUNCTIONS] Fonctions Avancées

### Structure Complète (Modèle à suivre)

```powershell
<#
.SYNOPSIS
    Description courte de la fonction.

.DESCRIPTION
    Description détaillée avec contexte complet.

.PARAMETER Name
    Description du paramètre Name.

.EXAMPLE
    Invoke-MyFunction -Name "Test"

.NOTES
    Auteur  : Darkmedia-X
    Version : 1.0
#>
function Invoke-MyFunction {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param(
        [Parameter(Mandatory = $true)]
        [ValidateNotNullOrEmpty()]
        [string]$Name,

        [Parameter(Mandatory = $false)]
        [ValidateSet("Dev", "Prod", "Staging")]
        [string]$Environment = "Dev",

        [Parameter(Mandatory = $false)]
        [switch]$Force
    )

    begin {
        Write-Verbose "Initialisation de Invoke-MyFunction"
        $ErrorActionPreference = "Stop"
    }

    process {
        try {
            if ($PSCmdlet.ShouldProcess($Name, "Exécuter l'opération")) {
                Write-Host "▶ Traitement de $Name..." -ForegroundColor Cyan
                # Logique principale ici
                Write-Host "✅ Terminé!" -ForegroundColor Green
            }
        }
        catch {
            Write-Error "Erreur lors du traitement de '$Name': $_"
        }
    }

    end {
        Write-Verbose "Fin de Invoke-MyFunction"
    }
}
```

### Attributs de Validation

```powershell
param(
    # Non vide
    [ValidateNotNullOrEmpty()]
    [string]$Name,

    # Ensemble de valeurs autorisées
    [ValidateSet("Dev", "Prod")]
    [string]$Environment,

    # Intervalle numérique
    [ValidateRange(1, 100)]
    [int]$Percentage,

    # Pattern regex
    [ValidatePattern("^[a-zA-Z0-9]+$")]
    [string]$Code
)
```

---

## 🔒 [SAFETY] Gestion des Erreurs et Sécurité

### Try / Catch / Finally

```powershell
try {
    $config = Get-Content -Path ".\config.json" -ErrorAction Stop | ConvertFrom-Json
}
catch [System.IO.FileNotFoundException] {
    Write-Warning "⚠️  config.json non trouvé — utilisation des valeurs par défaut"
    $config = @{ mode = "default" }
}
catch {
    Write-Error "❌ Erreur inattendue : $_"
    throw
}
finally {
    Write-Verbose "Nettoyage des ressources"
}
```

### SecureString — Jamais de Mots de Passe en Clair

```powershell
# ✅ BON
$securePassword = Read-Host -AsSecureString -Prompt "Mot de passe"
$credential     = New-Object System.Management.Automation.PSCredential -ArgumentList "user", $securePassword

# ❌ MAUVAIS
$password   = "SuperSecret123"
$credential = New-Object PSCredential -ArgumentList "user", ($password | ConvertTo-SecureString -AsPlainText -Force)
```

### Validation des Entrées Utilisateur

```powershell
function Confirm-UserInput {
    param([string]$Input)

    if ([string]::IsNullOrWhiteSpace($Input)) {
        throw "L'entrée ne peut pas être vide"
    }
    if ($Input -notmatch "^[a-zA-Z0-9_-]+$") {
        throw "Caractères non autorisés détectés"
    }
    if ($Input.Length -gt 50) {
        throw "L'entrée dépasse 50 caractères"
    }
    return $Input
}
```

---

## 🎨 [UI] Esthétique et Interface CLI

### Palette de Couleurs Darkmedia-X

```powershell
# Cyan  — Titres, headers, infos
Write-Host "=== Installation Qdrant ===" -ForegroundColor Cyan

# Green — Succès et confirmations
Write-Host "✅ Installation réussie!"    -ForegroundColor Green

# Yellow — Alertes et avertissements
Write-Host "⚠️  Fichier existant détecté" -ForegroundColor Yellow

# Red   — Erreurs critiques
Write-Host "❌ Erreur critique!"          -ForegroundColor Red

# Gray  — Texte secondaire
Write-Host "Version 1.0.0"               -ForegroundColor Gray
```

### Header / Footer Premium

```powershell
function Show-Header {
    param([string]$Title, [string]$Version = "1.0")
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  🚀  $($Title.PadRight(37))║" -ForegroundColor Cyan
    Write-Host "║  Version $($Version.PadRight(33))║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "▶ $Title" -ForegroundColor Cyan
    Write-Host "  $("─" * 40)" -ForegroundColor Gray
}

function Show-Footer {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  Opération terminée avec succès!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}
```

### Progress Bar et Verbose

```powershell
# Progress pour tâches longues
for ($i = 0; $i -le 100; $i += 5) {
    Write-Progress -Activity "Installation" -Status "$i% complété" -PercentComplete $i
    Start-Sleep -Milliseconds 50
}

# Verbose pour debug (activé avec -Verbose)
Write-Verbose "tempPath = $tempPath"
Write-Verbose "Éléments trouvés : $($items.Count)"
```

---

## 🧪 [TESTING] Qualité et Validation

### PSScriptAnalyzer (Obligatoire)

```powershell
# Installation
Install-Module -Name PSScriptAnalyzer -Force

# Analyse (doit retourner 0 erreur critique)
Invoke-ScriptAnalyzer -Path ".\MonScript.ps1" -Severity Error, Warning
```

### Pester (Tests Unitaires)

```powershell
# Installation
Install-Module -Name Pester -Force -SkipPublisherCheck

# Exemple de test
Describe "Get-Configuration" {
    It "Doit retourner un objet non vide" {
        $config = Get-Configuration
        $config | Should -Not -BeNullOrEmpty
    }
    It "Doit lever une exception si le fichier est absent" {
        { Get-Configuration -Path ".\inexistant.json" } | Should -Throw
    }
}

# Exécution
Invoke-Pester .\tests\ -Output Detailed
```

---

## 📋 Checklist de Qualité

- [ ] Encodage UTF-8 with BOM ✅
- [ ] Format Verb-Noun respecté ✅
- [ ] `[CmdletBinding()]` présent ✅
- [ ] Pas d'alias utilisés ✅
- [ ] Try/Catch sur toutes les erreurs ✅
- [ ] Pas de mots de passe en clair ✅
- [ ] Documentation Help complète ✅
- [ ] PSScriptAnalyzer : 0 erreurs ✅
- [ ] Tests Pester passants ✅
- [ ] Couleurs UI cohérentes ✅

---

**📌 Note** : Ces standards garantissent un code PowerShell professionnel, maintenable et esthétique au sein de l'écosystème Darkmedia-X.