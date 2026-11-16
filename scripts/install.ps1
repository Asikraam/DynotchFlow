# DynotchFlow Flexible One-Shot Installer (Windows 10/11)
# - Ensures Git is installed (winget), or falls back to GitHub ZIP download if winget/Git is unavailable.
# - Ensures Node.js LTS & npm are installed (winget -> official nodejs.org .msi fallback) and refreshes PATH in-session.
# - Clones/updates Asikraam/DynotchFlow, runs npm install, and launches DynotchFlow.

function Update-SessionPath {
    $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = "$machinePath;$userPath"

    $candidates = @(
        "C:\Program Files\Git\cmd",
        "C:\Program Files (x86)\Git\cmd",
        "C:\Program Files\nodejs",
        "C:\Program Files (x86)\nodejs",
        (Join-Path $env:LOCALAPPDATA "Programs\nodejs"),
        (Join-Path $env:APPDATA "npm"),
        (Join-Path $env:USERPROFILE "scoop\shims")
    )
    foreach ($dir in $candidates) {
        if ((Test-Path $dir) -and ($env:Path -notlike "*$dir*")) {
            $env:Path = "$env:Path;$dir"
        }
    }
}

function Install-ViaWinget {
    param(
        [Parameter(Mandatory = $true)][string]$WingetId,
        [Parameter(Mandatory = $true)][string]$DisplayName
    )
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        return $false
    }
    Write-Host "[+] Installing $DisplayName via winget..." -ForegroundColor Cyan
    winget install --id $WingetId -e --source winget --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -ne 0) {
        return $false
    }
    Update-SessionPath
    return $true
}

function Ensure-NodeAndNpm {
    Update-SessionPath
    if ((Get-Command node -ErrorAction SilentlyContinue) -and (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
        Write-Host "[OK] Node.js & npm already installed." -ForegroundColor Green
        return
    }

    $installed = Install-ViaWinget -WingetId "OpenJS.NodeJS.LTS" -DisplayName "Node.js LTS"
    if (-not ($installed -and (Get-Command npm.cmd -ErrorAction SilentlyContinue))) {
        Write-Host "[+] Falling back to official nodejs.org LTS MSI installer..." -ForegroundColor Cyan
        $idx = Invoke-RestMethod "https://nodejs.org/dist/index.json"
        $lts = ($idx | Where-Object { $_.lts -is [string] } | Select-Object -First 1).version
        if (-not $lts) { throw "Could not resolve latest Node.js LTS version." }
        $msiUrl = "https://nodejs.org/dist/$lts/node-$lts-x64.msi"
        $msiPath = Join-Path $env:TEMP "node-$lts-x64.msi"
        Invoke-WebRequest -Uri $msiUrl -OutFile $msiPath -UseBasicParsing
        $proc = Start-Process msiexec.exe -ArgumentList "/i `"$msiPath`" /qn /norestart" -Wait -PassThru
        if ($proc.ExitCode -ne 0) {
            throw "Node.js MSI install failed (exit code $($proc.ExitCode))."
        }
        Update-SessionPath
    }

    if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
        throw "Node.js installed, but npm.cmd is still not in PATH. Reopen PowerShell and re-run."
    }
    Write-Host "[OK] Node.js & npm ready." -ForegroundColor Green
}

function Ensure-Git {
    Update-SessionPath
    if (Get-Command git -ErrorAction SilentlyContinue) {
        Write-Host "[OK] Git already installed." -ForegroundColor Green
        return $true
    }
    $ok = Install-ViaWinget -WingetId "Git.Git" -DisplayName "Git"
    if ($ok -and (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "[OK] Git ready." -ForegroundColor Green
        return $true
    }
    Write-Host "[!] Git/winget unavailable; will download source ZIP instead." -ForegroundColor Yellow
    return $false
}

$hasGit = Ensure-Git
Ensure-NodeAndNpm

$npmCmd = (Get-Command npm.cmd -ErrorAction Stop).Source
$targetDir = Join-Path (Get-Location) "DynotchFlow"

if ($hasGit) {
    if (Test-Path (Join-Path $targetDir ".git")) {
        Write-Host "[+] Updating existing DynotchFlow repo..." -ForegroundColor Cyan
        git -C $targetDir pull --ff-only
        if ($LASTEXITCODE -ne 0) { throw "git pull failed." }
    } elseif (Test-Path $targetDir) {
        throw "Folder '$targetDir' already exists and is not a git repository."
    } else {
        Write-Host "[+] Cloning DynotchFlow..." -ForegroundColor Cyan
        git clone https://github.com/Asikraam/DynotchFlow.git $targetDir
        if ($LASTEXITCODE -ne 0) { throw "git clone failed." }
    }
} else {
    $zipPath = Join-Path $env:TEMP "DynotchFlow-main.zip"
    $extractRoot = Join-Path $env:TEMP "DynotchFlow-extract"
    if (Test-Path $extractRoot) { Remove-Item $extractRoot -Recurse -Force }
    Write-Host "[+] Downloading DynotchFlow source ZIP..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri "https://github.com/Asikraam/DynotchFlow/archive/refs/heads/main.zip" -OutFile $zipPath -UseBasicParsing
    Expand-Archive -Path $zipPath -DestinationPath $extractRoot -Force
    if (-not (Test-Path $targetDir)) {
        Move-Item (Join-Path $extractRoot "DynotchFlow-main") $targetDir
    }
}

Set-Location $targetDir
Write-Host "[+] Installing npm dependencies..." -ForegroundColor Cyan
& $npmCmd install
if ($LASTEXITCODE -ne 0) { throw "npm install failed." }

Write-Host "[+] Launching DynotchFlow..." -ForegroundColor Green
& $npmCmd start
