#!/bin/bash
set -e

if [ -z "$GITHUB_TOKEN" ]
then
  >&2 echo "GITHUB_TOKEN is not set"
  exit 1
fi

# Download the JSON response of a github release by tag
get_release() {
  set -e
  owner=$1
  repo=$2
  tag=$3
  curl -sf \
    -H "Accept: application/vnd.github.v3+json" \
    -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$owner/$repo/releases/tags/$tag"
}

# Download a release asset from github
download_release_asset() {
  set -e
  release=$1
  output_directory=$2
  file_name=$3
  
  release_asset=$(echo $release | jq -r ".assets[]  | select(.name == \"$file_name\")")
  release_asset_url=$(echo $release_asset | jq -r '.browser_download_url')
  curl -sfL -o "$output_directory/$file_name" $release_asset_url
  echo "$output_directory/$file_name";
}
