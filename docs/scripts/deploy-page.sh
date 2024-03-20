#!/usr/bin/env sh

set -e

mkdir gh-pages-branch
cd gh-pages-branch

git init
githubUrl="https://${OWNER}:${ACCESS_TOKEN}@github.com/ihengshuai/mini-ci"
git checkout -b gh-pages

BUNDLE_DIST=docs/dist

cp -a ../$BUNDLE_DIST/* .
# 删除本地使用的图片
echo ${DOMAIN} > CNAME

# 添加readme
cp ../docs/README.md README.md
cp ../LICENSE LICENSE

git config --global user.email $EMAIL
git config --global user.name $OWNER
git add . -A
git commit -m 'update page'
# git push -f origin -q gh-pages
git push -f $githubUrl -q gh-pages
# git config pull.ff only
# git pull $githubUrl gh-pages
# git push $githubUrl -q gh-pages
cd ..
rm -rf gh-pages-branch
echo deploy successfully
