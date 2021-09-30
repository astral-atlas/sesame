#!/bin/bash -e

# Download the JSON response of a github release by tag
get_release() {
  owner=$1
  repo=$2
  tag=$3
  url="https://api.github.com/repos/$owner/$repo/releases/tags/$tag"
  curl -sf \
    -H "Accept: application/vnd.github.v3+json" \
    $url
}

# Download a release asset from github
download_release_asset() {
  echo $1 $2 $3 $4 $5 $6 >> out.log
  release=$1
  output_directory=$2
  file_name=$3
  
  release_asset=$(echo $release | jq -r ".assets[]  | select(.name == \"$file_name\")")
  release_asset_url=$(echo $release_asset | jq -r '.browser_download_url')
  curl -sfL -o "$output_directory/$file_name" $release_asset_url
  echo $output_directory >> out.log
  echo $release_asset_url >> out.log
  echo "$output_directory/$file_name";
}
