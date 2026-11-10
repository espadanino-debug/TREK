#!/usr/bin/env bash
# Rebuilds the 3D bundle (assets/js/scene.js) and regenerates every page.
# Needs Node.js and Python 3. Run from the site folder: bash tools/build.sh
set -euo pipefail
cd "$(dirname "$0")"
npm install --no-save --silent three@0.169.0 esbuild@0.24.0
NODE_PATH="$PWD/node_modules" ./node_modules/.bin/esbuild scene.src.js \
  --bundle --minify --format=esm --target=es2020 --outfile=../assets/js/scene.js
python3 build.py
