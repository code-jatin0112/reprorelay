#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
for command in node npm git; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "Missing $command. Install it, then run this script again."
    exit 1
  fi
done
printf '\nNode: '; node -v
printf 'npm: '; npm -v
printf '\nInstalling project dependencies...\n'
npm install
printf '\nBuilding Chrome extension...\n'
npm run build
printf '\nDone! In Chrome, visit chrome://extensions, enable Developer mode, then Load unpacked and select:\n%s/dist\n' "$(pwd)"
