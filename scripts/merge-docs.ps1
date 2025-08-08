param(
  [string]$Output = "README.md",
  [switch]$Archive
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$existingReadme = if (Test-Path 'README.md') { Get-Content 'README.md' -Raw } else { "# Task Management Bot (All-in-One)`n`nThis README consolidates all documentation into a single file." }

# Collect markdown docs except README.md and LICENSE
$docFiles = @()
$docFiles += Get-ChildItem -Recurse -File -Include *.md |
  Where-Object { ($_.FullName -notmatch '\\.git\\') -and ($_.FullName -notmatch '\\.github(\\|$)') -and ($_.Name -ne 'README.md') -and ($_.Name -ne 'LICENSE') } |
  Sort-Object FullName

$banner = @"
# Task Management Bot (All-in-One)

This file replaces all separate docs. Everything you need is here.

"@

$sections = foreach ($f in $docFiles) {
  "`n---`n## Source: $($f.FullName.Substring($repoRoot.Length+1))`n"
  Get-Content $f.FullName -Raw
}

$mergedPath = Join-Path $repoRoot $Output
$banner | Out-File $mergedPath -Encoding UTF8
$existingReadme | Out-File $mergedPath -Append -Encoding UTF8
($sections -join "`n") | Out-File $mergedPath -Append -Encoding UTF8

Write-Host "Merged $($docFiles.Count) docs into $Output" -ForegroundColor Green

if ($Archive -and $docFiles) {
  $archiveDir = Join-Path $repoRoot "archive\docs-legacy"
  New-Item -ItemType Directory -Force -Path $archiveDir | Out-Null
  foreach ($f in $docFiles) {
    $target = Join-Path $archiveDir ($f.FullName.Substring($repoRoot.Length+1) -replace "[:*?`"<>|]", "_")
    New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
    Move-Item -Force $f.FullName $target
  }
  if (Test-Path ".\docs") { Remove-Item -Recurse -Force ".\docs" -ErrorAction SilentlyContinue }
  Write-Host "Archived original docs to $archiveDir" -ForegroundColor Green
}
