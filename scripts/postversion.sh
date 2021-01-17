#!/usr/bin/env bash

name=$(cat package.json | jq .name -r)
version=$(cat package.json | jq .version -r)
tag="$name@$version"

git add .
git commit -m $tag
git tag -a $tag -m "Publied version $version of $name"

git push origin --follow-tags