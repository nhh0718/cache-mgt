#!/usr/bin/env bash
# Cookie Manager — Install / Update Script (Mac/Linux)
# Usage: curl -sL https://raw.githubusercontent.com/nhh0718/cache-mgt/main/scripts/install.sh | bash

set -e

INSTALL_DIR="$HOME/cookie-manager"
ZIP_URL="https://github.com/nhh0718/cache-mgt/releases/latest/download/cookie-manager.zip"
TEMP_ZIP="/tmp/cookie-manager.zip"

echo ""
echo "  Cookie Manager — Installing..."
echo ""

# Download latest release
echo "  Downloading from GitHub Releases..."
curl -sL "$ZIP_URL" -o "$TEMP_ZIP"

# Remove old install if exists
if [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"
    echo "  Removed old version."
fi

# Extract
mkdir -p "$INSTALL_DIR"
unzip -qo "$TEMP_ZIP" -d "$INSTALL_DIR"
rm -f "$TEMP_ZIP"

echo ""
echo "  Installed to: $INSTALL_DIR"
echo ""
echo "  Next steps:"
echo "  1. Open Chrome -> chrome://extensions/"
echo "  2. Enable 'Developer mode' (top right)"
echo "  3. Click 'Load unpacked' -> select:"
echo "     $INSTALL_DIR"
echo ""
echo "  To UPDATE later: run this command again, then click Reload on chrome://extensions/"
echo ""
