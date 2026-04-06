#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")" || exit 1

# Proxy support: ./publish.sh --proxy http://127.0.0.1:7890
while [[ $# -gt 0 ]]; do
  case "$1" in
    --proxy)
      export http_proxy="$2" https_proxy="$2" HTTP_PROXY="$2" HTTPS_PROXY="$2"
      echo "Using proxy: $2"
      shift 2
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

VERSION=$(bun -e "import pkg from './package.json'; console.log(pkg.version)")
TAG="v$VERSION"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: working directory is not clean. Commit or stash changes first."
  exit 1
fi

# Check if tag already exists
if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "Error: tag $TAG already exists. Bump version in package.json first."
  exit 1
fi

# Build
echo "Building $TAG ..."
bun install
bunx vite build --config renderer/vite.config.ts
bunx electron-builder --mac --dir

# Pack
APP_NAME=Summon
DIST_APP=$(find dist -name "$APP_NAME.app" -maxdepth 2 | head -1)
tar -czf "dist/${APP_NAME}.tar.gz" -C "$(dirname "$DIST_APP")" "${APP_NAME}.app"

# Create git tag
git tag -a "$TAG" -m "Release $TAG"
git push origin "$TAG"

# Create GitHub release
echo "Creating GitHub release $TAG ..."
gh release create "$TAG" "dist/${APP_NAME}.tar.gz" \
  --title "$TAG" \
  --notes "Release $TAG"

echo "Published $TAG"
