set -e

input=$(</dev/stdin)

directory=$(echo $input | jq -r '.directory')
file=$(echo $input | jq -r '.file')
url=$(echo $input | jq -r '.url')

mkdir -p $directory &> /dev/null
curl -L -o "$directory/$file" $url &> /dev/null

echo "{ \"file\": \"$directory/$file\" }"