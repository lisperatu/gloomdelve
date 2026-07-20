#!/bin/sh
# Build and publish to GitHub Pages (gh-pages branch)
set -e
npm run build
touch dist/.nojekyll
cd dist
git init -q -b gh-pages
git add -A
git commit -qm "deploy"
git push -f "$(git -C .. remote get-url origin)" gh-pages
cd .. && rm -rf dist/.git
echo "Deployed."
