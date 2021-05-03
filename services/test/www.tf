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

module "www_release" {
  source = "../modules/github_release"
  owner = "astral-atlas"
  repository = "sesame"
  release_tag = "@astral-atlas/sesame-www@1.2.0"
  release_asset_name = "sesame-www.zip"
  output_directory = "./temp"
}

data "external" "unzip" {
  program = ["bash", "${path.module}/unzip.sh"]

  query = {
    zip_file = module.www_release.output_file
    output_directory = "./temp/www"
  }
}

resource "aws_s3_bucket_object" "www_objects" {
  for_each = local.www_objects
  bucket = aws_s3_bucket.www_test.bucket

  key    = each.key
  content_type = each.value

  acl = "public-read"
  source = "${data.external.unzip.result.output_directory}/${each.key}"
  etag = filemd5("${data.external.unzip.result.output_directory}/${each.key}")
}

locals {
  www_config = {
    api: {
      sesame: {
        baseURL: "http://api.sesame.astral-atlas.com"
      }
    }
  }
}

resource "aws_s3_bucket_object" "www_config" {
  bucket = aws_s3_bucket.www_test.bucket

  key    = "config.json5"
  content_type = "application/json5"

  acl = "public-read"
  content = jsonencode(local.www_config)
  etag = md5(jsonencode(local.www_config))
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