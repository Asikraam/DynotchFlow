# DynotchFlow One-Shot Installer (Windows 10/11)
# Installs Git & Node.js LTS via winget if missing (refreshing PATH in the same session),
# clones Asikraam/DynotchFlow, installs dependencies, and launches DynotchFlow.

function Update-SessionPath {
    $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = "$machinePath;$userPath"

    foreach ($fallback in @("C:\Program Files\Git\cmd", "C:\Program Files\nodejs")) {
        if ((Test-Path $fallback) -and ($env:Path -notlike "*$fallback*")) {
            $env:Path = "$env:Path;$fallback"
        }
    }
}

function Ensure-Tool {
    param(
        [Parameter(Mandatory = $true)][string]$CommandName,
        [Parameter(Mandatory = $true)][string]$WingetId,
        [Parameter(Mandatory = $true)][string]$DisplayName
    )

    if (Get-Command $CommandName -ErrorAction SilentlyContinue) {
        Write-Host "[OK] $DisplayName already installed." -ForegroundColor Green
        return
    }

    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        throw "winget not found. Install $DisplayName manually or download the .exe installer from GitHub Releases."
    }

    Write-Host "[+] Installing $DisplayName via winget..." -ForegroundColor Cyan
    winget install --id $WingetId -e --source winget --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install $DisplayName (winget exit code $LASTEXITCODE)."
    }

    Update-SessionPath
    if (-not (Get-Command $CommandName -ErrorAction SilentlyContinue)) {
        throw "$DisplayName was installed, but '$CommandName' is still not in PATH. Reopen PowerShell and re-run."
    }

    Write-Host "[OK] $DisplayName is ready." -ForegroundColor Green
}

Ensure-Tool -CommandName "git" -WingetId "Git.Git" -DisplayName "Git"
Ensure-Tool -CommandName "node" -WingetId "OpenJS.NodeJS.LTS" -DisplayName "Node.js LTS"

$targetDir = Join-Path (Get-Location) "DynotchFlow"
if (Test-Path (Join-Path $targetDir ".git")) {
    Write-Host "[+] Updating existing DynotchFlow repo..." -ForegroundColor Cyan
    git -C $targetDir pull --ff-only
    if ($LASTEXITCODE -ne 0) {
        throw "git pull failed."
    }
} elseif (Test-Path $targetDir) {
    throw "Folder '$targetDir' already exists and is not a git repository."
} else {
    Write-Host "[+] Cloning DynotchFlow..." -ForegroundColor Cyan
    git clone https://github.com/Asikraam/DynotchFlow.git $targetDir
    if ($LASTEXITCODE -ne 0) {
        throw "git clone failed."
    }
}

Set-Location $targetDir
Write-Host "[+] Installing npm dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    throw "npm install failed."
}

Write-Host "[+] Launching DynotchFlow..." -ForegroundColor Green
npm start
