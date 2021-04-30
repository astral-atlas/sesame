set -e

input=$(</dev/stdin)

file=$(echo $input | jq -r '.file')
url=$(echo $input | jq -r '.url')

curl -L -o $file $url &> report.log

echo "{ \"file\": \"$file\" }"