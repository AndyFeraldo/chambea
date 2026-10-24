#!/usr/bin/env bash
# Publica la demo en la rama gh-pages (GitHub Pages). Uso: bash scripts/publicar-pages.sh
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build:pages
TMP=$(mktemp -d)
cp -r web/dist-pages/. "$TMP"
touch "$TMP/.nojekyll"
git -C "$TMP" init -q -b gh-pages
git -C "$TMP" add -A
git -C "$TMP" -c user.name="chambea" -c user.email="chambea@users.noreply.github.com" commit -q -m "Publicar demo en GitHub Pages"
git -C "$TMP" push -q -f "$(git remote get-url origin)" gh-pages
rm -rf "$TMP"
echo "Listo: rama gh-pages actualizada."
