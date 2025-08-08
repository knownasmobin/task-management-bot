$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

# Allowed markdown files (keep LICENSE legal)
$allowed = @(
  "README.md",
  "LICENSE"
)

$violations = Get-ChildItem -Recurse -File -Include *.md |
  Where-Object {
    ($_.FullName -notmatch "\\\.git\\") -and
    ($_.FullName -notmatch "\\\.github(\\|$)") -and
    ($_.FullName -notmatch "\\node_modules(\\|$)") -and
    ($_.FullName -notmatch "\\archive\\docs-legacy(\\|$)")
  } |
  ForEach-Object {
    $rel = Resolve-Path -Relative $_.FullName
    $rel = $rel -replace '^[.\\/]+',''
    if ($allowed -notcontains $rel) { $_ }
  }

if ($violations) {
  Write-Host "Found disallowed markdown docs (keep everything in README.md):" -ForegroundColor Red
  $violations | ForEach-Object { Write-Host " - " (Resolve-Path -Relative $_.FullName) }
  exit 1
} else {
  Write-Host "Docs validation passed: only README.md (and LICENSE) exist." -ForegroundColor Green
}
