#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")" || exit 1

APP_NAME=Summon
DEST="$HOME/Applications"
ARCH="$(uname -m)"

if [ "$ARCH" = "arm64" ]; then
  APP_DIR_CANDIDATES=("dist/mac-arm64" "dist/mac")
else
  APP_DIR_CANDIDATES=("dist/mac-x64" "dist/mac")
fi

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
APP_DIR=""
for candidate in "${APP_DIR_CANDIDATES[@]}"; do
  if [ -d "$candidate/$APP_NAME.app" ]; then
    APP_DIR="$candidate"
    break
  fi
done
if [ -z "$APP_DIR" ]; then
  echo "Error: packaged app not found for $ARCH"
  exit 1
fi
mkdir -p "$DEST"
rm -rf "$DEST/$APP_NAME.app"
cp -R "$APP_DIR/$APP_NAME.app" "$DEST/"

echo "Installed: $DEST/$APP_NAME.app"

echo "Cleaning build artifacts..."
rm -rf dist dist-renderer

if [ "$WAS_RUNNING" = true ]; then
  echo "Restarting $APP_NAME..."
  open "$DEST/$APP_NAME.app"
fi
