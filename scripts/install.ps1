# Cookie Manager — Install / Update Script (Windows PowerShell)
# Usage: irm https://raw.githubusercontent.com/nhh0718/cache-mgt/main/scripts/install.ps1 | iex

$ErrorActionPreference = "Stop"
$installDir = "$env:USERPROFILE\cookie-manager"
$zipUrl = "https://github.com/nhh0718/cache-mgt/releases/latest/download/cookie-manager.zip"
$tempZip = "$env:TEMP\cookie-manager.zip"

Write-Host "`n  Cookie Manager — Installing...`n" -ForegroundColor Cyan

# Download latest release
Write-Host "  Downloading from GitHub Releases..." -ForegroundColor Gray
Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip -UseBasicParsing

# Remove old install if exists
if (Test-Path $installDir) {
    Remove-Item -Recurse -Force $installDir
    Write-Host "  Removed old version." -ForegroundColor Yellow
}

# Extract
Expand-Archive -Path $tempZip -DestinationPath $installDir -Force
Remove-Item $tempZip -Force

Write-Host "`n  Installed to: $installDir" -ForegroundColor Green
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor White
Write-Host "  1. Open Chrome -> chrome://extensions/" -ForegroundColor Gray
Write-Host "  2. Enable 'Developer mode' (top right)" -ForegroundColor Gray
Write-Host "  3. Click 'Load unpacked' -> select:" -ForegroundColor Gray
Write-Host "     $installDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "  To UPDATE later: run this command again, then click Reload on chrome://extensions/" -ForegroundColor Yellow
Write-Host ""
