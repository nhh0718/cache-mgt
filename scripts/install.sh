#!/usr/bin/env bash
# Cookie Manager — Script Cài đặt / Cập nhật (Mac/Linux)
# Cách dùng: curl -sL https://raw.githubusercontent.com/nhh0718/cache-mgt/main/scripts/install.sh | bash

set -e

INSTALL_DIR="$HOME/cookie-manager"
ZIP_URL="https://github.com/nhh0718/cache-mgt/releases/latest/download/cookie-manager.zip"
TEMP_ZIP="/tmp/cookie-manager.zip"

echo ""
echo "  Cookie Manager — Đang cài đặt..."
echo ""

# Tải bản mới nhất từ GitHub
echo "  Đang tải từ GitHub Releases..."
curl -sL "$ZIP_URL" -o "$TEMP_ZIP"

# Xóa bản cũ nếu có
if [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"
    echo "  Đã xóa bản cũ."
fi

# Giải nén
mkdir -p "$INSTALL_DIR"
unzip -qo "$TEMP_ZIP" -d "$INSTALL_DIR"
rm -f "$TEMP_ZIP"

echo ""
echo "  Cài đặt thành công tại: $INSTALL_DIR"
echo ""
echo "  Bước tiếp theo:"
echo "  1. Mở Chrome -> nhập chrome://extensions/"
echo "  2. Bật 'Chế độ nhà phát triển' (góc trên bên phải)"
echo "  3. Nhấn 'Tải tiện ích đã giải nén' -> chọn thư mục:"
echo "     $INSTALL_DIR"
echo ""
echo "  CẬP NHẬT: Chạy lại lệnh này, rồi nhấn nút Tải lại trên chrome://extensions/"
echo ""
