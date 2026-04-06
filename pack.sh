#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")" || exit 1

APP_NAME=Summon

echo "Installing dependencies..."
bun install

echo "Building renderer..."
bunx vite build --config renderer/vite.config.ts

echo "Packaging..."
bunx electron-builder --mac --dir

# Pack into tar.gz
DIST_APP=$(find dist -name "$APP_NAME.app" -maxdepth 2 | head -1)
if [ -z "$DIST_APP" ]; then
  echo "Error: $APP_NAME.app not found in dist/"
  exit 1
fi

tar -czf "dist/${APP_NAME}.tar.gz" -C "$(dirname "$DIST_APP")" "${APP_NAME}.app"
echo "Created dist/${APP_NAME}.tar.gz"
