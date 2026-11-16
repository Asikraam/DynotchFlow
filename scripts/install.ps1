# DynotchFlow Flexible One-Shot Installer (Windows 10/11)
# - Preserves existing PATH + merges Machine/User Registry PATH + Node.js/Git locations.
# - Auto-installs Git (winget -> ZIP fallback) and Node.js LTS (winget -> portable nodejs.org ZIP fallback, no admin required).
# - Explicitly invokes npm.cmd to bypass PowerShell ExecutionPolicy issues on npm.ps1.

[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

function Update-SessionPath {
    $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    $existing = @($env:Path, $machinePath, $userPath) -join ";"

    $nodeReg = (Get-ItemProperty "HKLM:\SOFTWARE\Node.js" -Name "InstallPath" -ErrorAction SilentlyContinue).InstallPath
    $gitReg = (Get-ItemProperty "HKLM:\SOFTWARE\GitForWindows" -Name "InstallPath" -ErrorAction SilentlyContinue).InstallPath

    $candidates = @(
        "C:\Program Files\Git\cmd",
        "C:\Program Files (x86)\Git\cmd",
        "C:\Program Files\nodejs",
        "C:\Program Files (x86)\nodejs",
        (Join-Path $env:LOCALAPPDATA "Programs\nodejs"),
        (Join-Path $env:APPDATA "npm"),
        (Join-Path $env:USERPROFILE "scoop\shims"),
        $env:NVM_SYMLINK,
        $nodeReg,
        $(if ($gitReg) { Join-Path $gitReg "cmd" })
    )

    $parts = New-Object System.Collections.Generic.List[string]
    foreach ($entry in (($existing -split ";") + $candidates)) {
        if ($entry -and (Test-Path $entry) -and (-not $parts.Contains($entry))) {
            $parts.Add($entry)
        }
    }
    $env:Path = ($parts -join ";")

    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if ($nodeCmd) {
        $nodeDir = Split-Path $nodeCmd.Source -Parent
        if ($nodeDir -and ($env:Path -notlike "*$nodeDir*")) {
            $env:Path = "$nodeDir;$env:Path"
        }
    }
}

function Find-NpmCmd {
    Update-SessionPath
    $cmd = Get-Command npm.cmd -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }

    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if ($nodeCmd) {
        $sibling = Join-Path (Split-Path $nodeCmd.Source -Parent) "npm.cmd"
        if (Test-Path $sibling) { return $sibling }
    }
    return $null
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
    $npmPath = Find-NpmCmd
    if ($npmPath) {
        Write-Host "[OK] Node.js & npm ready ($npmPath)." -ForegroundColor Green
        return $npmPath
    }

    [void](Install-ViaWinget -WingetId "OpenJS.NodeJS.LTS" -DisplayName "Node.js LTS")
    $npmPath = Find-NpmCmd
    if ($npmPath) {
        Write-Host "[OK] Node.js & npm ready ($npmPath)." -ForegroundColor Green
        return $npmPath
    }

    Write-Host "[+] Installing portable Node.js LTS to $env:LOCALAPPDATA\Programs\nodejs (no admin needed)..." -ForegroundColor Cyan
    $idx = Invoke-RestMethod "https://nodejs.org/dist/index.json"
    $lts = ($idx | Where-Object { $_.lts -is [string] } | Select-Object -First 1).version
    if (-not $lts) { throw "Could not resolve latest Node.js LTS version." }

    $arch = if ([Environment]::Is64BitOperatingSystem) { "win-x64" } else { "win-x86" }
    $zipUrl = "https://nodejs.org/dist/$lts/node-$lts-$arch.zip"
    $zipPath = Join-Path $env:TEMP "node-$lts-$arch.zip"
    $installParent = Join-Path $env:LOCALAPPDATA "Programs"
    $nodeTarget = Join-Path $installParent "nodejs"

    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing
    if (Test-Path $nodeTarget) { Remove-Item $nodeTarget -Recurse -Force }
    Expand-Archive -Path $zipPath -DestinationPath $installParent -Force
    Move-Item (Join-Path $installParent "node-$lts-$arch") $nodeTarget -Force

    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($userPath -notlike "*$nodeTarget*") {
        $newUserPath = if ($userPath) { "$userPath;$nodeTarget" } else { $nodeTarget }
        [Environment]::SetEnvironmentVariable("Path", $newUserPath, "User")
    }

    $npmPath = Find-NpmCmd
    if (-not $npmPath) {
        throw "Failed to locate npm.cmd after Node.js setup."
    }
    Write-Host "[OK] Node.js & npm ready ($npmPath)." -ForegroundColor Green
    return $npmPath
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
$npmCmd = Ensure-NodeAndNpm
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
