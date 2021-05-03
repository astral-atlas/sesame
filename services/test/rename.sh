#!/bin/bash
set -e

input=$(</dev/stdin)

input_file=$(echo $input | jq -r '.input_file')
new_name=$(echo $input | jq -r '.new_name')

cp $input_file $new_name

echo "{ \"output_file\": \"$new_name\" }"