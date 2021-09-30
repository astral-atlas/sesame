#!/bin/bash -e

# import some github utilities
source "${BASH_SOURCE%/*}/github.sh"

#input=$(<input.json)
input=$(</dev/stdin)

temp_workspace=$(echo $input | jq -r '.temp_workspace')
version_label_prefix=$(echo $input | jq -r '.version_label_prefix')
release_tag=$(echo $input | jq -r '.release_tag')
config=$(echo $input | jq -r '.config')

owner="astral-atlas"
repo="sesame"
asset_name="sesame-api.zip"

create_bundle() {
  (
    # Clean and Prepare
    rm -rf $temp_workspace
    mkdir -p $temp_workspace $temp_workspace/bundle $temp_workspace/version
    # Download release
    release=$(get_release "$owner" "$repo" "$release_tag")
    echo "$release" "$temp_workspace" "sesame-api.zip" >> out.log
    release_asset=$(download_release_asset "$release" "$temp_workspace" "sesame-api.zip")
    # Assemble Bundle
    unzip -o "$release_asset" -d $temp_workspace/bundle
    echo $config                                        > $temp_workspace/bundle/config.json
    echo "api: node api/src/entry.js config.json"       > $temp_workspace/bundle/Procfile
    # Zip Bundle
    (cd $temp_workspace/bundle; zip -r ../version/source_bundle.zip .)
  ) > /dev/null

  # Get Bundle hash
  hash=$(sha1sum $temp_workspace"/version/source_bundle.zip")
  application_version_label=$version_label_prefix"_"$hash
  cp -T \
    $temp_workspace"/version/source_bundle.zip" \
    $temp_workspace"/version/"$application_version_label".zip"

  echo $temp_workspace/version/$application_version_label.zip
}

bundle=$(create_bundle)

echo "{ \"application_version_source_bundle\": \"$bundle\" }"