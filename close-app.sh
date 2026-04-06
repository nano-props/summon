#!/usr/bin/env bash
set -euo pipefail

APP_NAME=Summon

if ! pgrep -x "$APP_NAME" > /dev/null; then
  exit 0
fi

echo "$APP_NAME is running, trying to close..."

kill $(pgrep -x "$APP_NAME") 2>/dev/null || true

for i in {1..10}; do
  if ! pgrep -x "$APP_NAME" > /dev/null; then
    echo "$APP_NAME closed"
    exit 0
  fi
  sleep 0.5
done

if pgrep -x "$APP_NAME" > /dev/null; then
  echo "Force killing $APP_NAME..."
  pkill -9 -x "$APP_NAME"
  sleep 1
fi

exit 0
