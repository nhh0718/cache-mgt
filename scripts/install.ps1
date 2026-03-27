# Cookie Manager — Script Cài đặt / Cập nhật (Windows PowerShell)
# Cách dùng: irm https://raw.githubusercontent.com/nhh0718/cache-mgt/main/scripts/install.ps1 | iex

$ErrorActionPreference = "Stop"
$installDir = "$env:USERPROFILE\cookie-manager"
$zipUrl = "https://github.com/nhh0718/cache-mgt/releases/latest/download/cookie-manager.zip"
$tempZip = "$env:TEMP\cookie-manager.zip"

Write-Host "`n  Cookie Manager — Đang cài đặt...`n" -ForegroundColor Cyan

# Tải bản mới nhất từ GitHub
Write-Host "  Đang tải từ GitHub Releases..." -ForegroundColor Gray
Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip -UseBasicParsing

# Xóa bản cũ nếu có
if (Test-Path $installDir) {
    Remove-Item -Recurse -Force $installDir
    Write-Host "  Đã xóa bản cũ." -ForegroundColor Yellow
}

# Giải nén
Expand-Archive -Path $tempZip -DestinationPath $installDir -Force
Remove-Item $tempZip -Force

Write-Host "`n  Cài đặt thành công tại: $installDir" -ForegroundColor Green
Write-Host ""
Write-Host "  Bước tiếp theo:" -ForegroundColor White
Write-Host "  1. Mở Chrome -> nhập chrome://extensions/" -ForegroundColor Gray
Write-Host "  2. Bật 'Chế độ nhà phát triển' (góc trên bên phải)" -ForegroundColor Gray
Write-Host "  3. Nhấn 'Tải tiện ích đã giải nén' -> chọn thư mục:" -ForegroundColor Gray
Write-Host "     $installDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "  CẬP NHẬT: Chạy lại lệnh này, rồi nhấn nút Tải lại trên chrome://extensions/" -ForegroundColor Yellow
Write-Host ""
