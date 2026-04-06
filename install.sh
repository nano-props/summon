#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")" || exit 1

APP_NAME=Summon
DEST="$HOME/Applications"

WAS_RUNNING=false
if pgrep -f "$APP_NAME.app" > /dev/null; then
  WAS_RUNNING=true
  bash close-app.sh
fi

echo "Installing dependencies..."
bun install

echo "Building renderer..."
bunx vite build --config renderer/vite.config.ts

echo "Packaging..."
bunx electron-builder --mac --dir

echo "Installing to $DEST..."
mkdir -p "$DEST"
rm -rf "$DEST/$APP_NAME.app"
cp -R "dist/mac-arm64/$APP_NAME.app" "$DEST/" 2>/dev/null \
  || cp -R "dist/mac/$APP_NAME.app" "$DEST/"

echo "Installed: $DEST/$APP_NAME.app"

if [ "$WAS_RUNNING" = true ]; then
  echo "Restarting $APP_NAME..."
  open "$DEST/$APP_NAME.app"
fi
