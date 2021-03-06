#!/bin/bash
set -e

# import some github utilities
source ./github.sh

#input=$(<input.json)
input=$(</dev/stdin)

temp_workspace=$(echo $input | jq -r '.temp_workspace')
application_version_label=$(echo $input | jq -r '.application_version_label')
release_tag=$(echo $input | jq -r '.release_tag')
config=$(echo $input | jq -r '.config')

owner="astral-atlas"
repo="sesame"
asset_name="sesame-api.zip"

create_bundle() {
  (
    # Clean and Prepare
    rm -rf $temp_workspace
    mkdir -p $temp_workspace $temp_workspace/bundle
    # Download release
    release=$(get_release "$owner" "$repo" "$release_tag")
    release_asset=$(download_release_asset "$release" "$temp_workspace" 'sesame-api.zip')
    # Assemble Bundle
    unzip -o $release_asset -d $temp_workspace/bundle
    echo $config                                > $temp_workspace/bundle/config.json
    echo "web: node src/main.js ./config.json"  > $temp_workspace/bundle/Procfile
    # Zip Bundle
    (cd $temp_workspace/bundle; zip -r ../$application_version_label.zip .)
  ) > /dev/null
  echo $temp_workspace/$application_version_label.zip
}

bundle=$(create_bundle)

echo "{ \"application_version_source_bundle\": \"$bundle\" }"