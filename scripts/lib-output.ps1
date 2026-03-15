<#
.SYNOPSIS
    lib-output.ps1
.DESCRIPTION
    Helpers d'affichage pour les scripts PowerShell (separateurs, sections, statuts).
#>

$Script:OutputWidth = 58

function Write-Separator {
    param([string]$Char = "-", [int]$Length = $Script:OutputWidth)
    Write-Host ("  " + ($Char * [Math]::Min($Length, 80))) -ForegroundColor DarkGray
}

function Write-SectionHeader {
    param([string]$Title, [string]$Why = "")
    Write-Host ""
    Write-Separator "="
    Write-Host "  $($Title.ToUpperInvariant())" -ForegroundColor Cyan
    if ($Why) { Write-Host "  Pourquoi: " -NoNewline -ForegroundColor DarkCyan; Write-Host $Why -ForegroundColor Gray }
    Write-Separator "-"
}

function Write-Step {
    param([string]$Message)
    Write-Host "  > " -NoNewline -ForegroundColor DarkGray
    Write-Host $Message -ForegroundColor White
}

function Write-Success {
    param([string]$Message)
    Write-Host "  OK " -NoNewline -ForegroundColor Green
    Write-Host $Message -ForegroundColor Gray
}

function Write-Fail {
    param([string]$Message)
    Write-Host "  !! " -NoNewline -ForegroundColor Red
    Write-Host $Message -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "  " $Message -ForegroundColor DarkGray
}

function Write-Banner {
    param([string]$Message)
    $Line = "  " + ("=" * [Math]::Min($Message.Length + 4, 80))
    Write-Host ""
    Write-Host $Line -ForegroundColor DarkCyan
    Write-Host "  " $Message -ForegroundColor Cyan
    Write-Host $Line -ForegroundColor DarkCyan
}

function Write-EtapeHeader {
    param([int]$Numero, [string]$Titre, [string]$Pourquoi = "")
    Write-Host ""
    Write-Host "  [Etape $Numero] " -NoNewline -ForegroundColor Cyan
    Write-Host $Titre -ForegroundColor White
    if ($Pourquoi) { Write-Host "  Pourquoi : " -NoNewline -ForegroundColor DarkGray; Write-Host $Pourquoi -ForegroundColor Gray }
}

function Write-DashLine {
    param([int]$Length = 60)
    Write-Host ("  " + ("-" * [Math]::Min($Length, 80))) -ForegroundColor DarkGray
}
