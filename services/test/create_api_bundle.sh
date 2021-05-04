#!/bin/bash
set -e

input=$(</dev/stdin)

release_zip_file=$(echo $input | jq -r '.release_zip_file')
application_version_label=$(echo $input | jq -r '.application_version_label')
output_directory=$(echo $input | jq -r '.output_directory')
config=$(echo $input | jq -r '.config')

application_version_source_bundle="$application_version_label.zip"

(
  # Clean
  rm -rf $output_directory
  mkdir -p $output_directory
  # Write Files
  unzip -o $release_zip_file -d $output_directory
  echo $config                                > $output_directory/config.json
  echo "web: node src/main.js ./config.json"  > $output_directory/Procfile
  # Bundle
  echo ../$application_version_source_bundle
  (cd $output_directory; zip -r $application_version_source_bundle .)
) > /dev/null


echo "{ \"application_version_source_bundle\": \"$output_directory/$application_version_source_bundle\" }"