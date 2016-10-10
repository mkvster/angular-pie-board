#!/bin/bash
set -e 

git clone "https://github.com/mkvster/angular-pie-board.git" ./docs-out -b gh-pages --single-branch --depth=1

cd docs-out

# clear out everything
git rm -rf .
git clean -fxd

# get new content
cp ../docs-built/* . -R

git add .

# The first and only commit to this new Git repo contains all the
# files present with the commit message "Deploy to GitHub Pages".
git commit -m "docs: new deploy"

git push origin --quiet 
#> /dev/null 2>&1