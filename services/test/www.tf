resource "aws_s3_bucket" "www_test" {
  bucket = "sesame.astral-atlas.com"

  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}

locals {
  www_objects = {
    "index.html": "text/html",
    "bundle.js": "application/javascript",
    "bundle.js.map": "application/javascript",
    "style.css": "text/css",
    "favicon.ico": "image/png",
  }
}

resource "aws_s3_bucket_object" "www_objects" {
  for_each = local.www_objects
  bucket = aws_s3_bucket.www_test.bucket

  key    = each.key
  content_type = each.value

  acl = "public-read"
  source = "../../www/dist/${each.key}"
  etag = filemd5("../../www/dist/${each.key}")
}


resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.root.zone_id
  name    = "sesame"
  type    = "A"

  alias {
    name                   = aws_s3_bucket.www_test.website_domain
    zone_id                = "Z1WCIGYICN2BYD"
    evaluate_target_health = false
  }
}

output "www-origin-name" {
  value = aws_s3_bucket.www_test.website_endpoint
}
output "www-public-name" {
  value = "${aws_route53_record.www.name}.${data.aws_route53_zone.root.name}"
}