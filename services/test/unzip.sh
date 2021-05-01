set -e

input=$(</dev/stdin)

zip_file=$(echo $input | jq -r '.zip_file')
output_directory=$(echo $input | jq -r '.output_directory')

mkdir -p $output_directory &> /dev/null
unzip -u $zip_file -d $output_directory &> /dev/null

echo "{ \"output_directory\": \"$output_directory\" }"