$ErrorActionPreference = "Stop"

function Run($cmd) {
  Write-Host "`n> $cmd" -ForegroundColor Cyan
  Invoke-Expression $cmd
}

function Has($p) { Test-Path $p }

# Node.js project checks
if (Has "package.json") {
  Write-Host "Detected Node.js project" -ForegroundColor Green
  if (Get-Command npm -ErrorAction SilentlyContinue) {
    # Prefer CI-fast installs; gracefully fallback to npm install if lockfile is out of sync
    $installed = $false
    if (Test-Path package-lock.json) {
      Write-Host "`n> npm ci" -ForegroundColor Cyan
      & npm ci
      if ($LASTEXITCODE -eq 0) { $installed = $true } else { Write-Host "npm ci failed; falling back to 'npm install'" -ForegroundColor Yellow }
    }
    if (-not $installed) {
      Write-Host "`n> npm install" -ForegroundColor Cyan
      & npm install
    }
    if (Select-String -Path package.json -Pattern '"lint"\s*:' -Quiet) { Run "npm run lint --silent" }
    if (Test-Path "tsconfig.json") { Run "npx tsc -noEmit" }
    if (Select-String -Path package.json -Pattern '"build"\s*:' -Quiet) { Run "npm run build --silent" }
  if (Select-String -Path package.json -Pattern '"test"\s*:' -Quiet) { Run "npm test --silent" }
  } else {
    Write-Host "npm not found in PATH" -ForegroundColor Yellow
  }
  exit 0
}

Write-Host "No supported project type detected. This repo looks like Node.js but package.json missing." -ForegroundColor Yellow
exit 0
