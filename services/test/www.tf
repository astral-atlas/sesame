## The specific source code
module "www_release" {
  source = "../modules/github_release"
  owner = "astral-atlas"
  repository = "sesame"
  release_tag = "@astral-atlas/sesame-www@3.9.0"
  release_asset_name = "sesame-www.zip"
  output_directory = "./temp"
}

resource "aws_s3_bucket" "www_test" {
  bucket = "sesame.astral-atlas.com"

  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}

locals {
  mime_types = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".json5": "application/json5",
    ".ico": "image/png",
    ".png": "image/png",
    ".flac": "audio/flac",
    ".glb": "model/gltf-binary"
  }
  www_dir = data.external.unzip_www.result.output_directory
  www_objects = [for o in fileset(local.www_dir, "**") : o if o != "config.json5"]
}

data "external" "unzip_www" {
  program = ["bash", "${path.module}/unzip.sh"]

  query = {
    zip_file = module.www_release.output_file
    output_directory = "./temp/www"
  }
}

resource "aws_s3_bucket_object" "www_objects" {
  for_each = toset(local.www_objects)
  bucket = aws_s3_bucket.www_test.bucket

  key    = each.key
  content_type = lookup(local.mime_types, regex("\\.[^.]+$", each.key), null)

  acl = "public-read"
  source = join("/", [local.www_dir, each.key])
  etag = filemd5(join("/", [local.www_dir, each.key]))
}

locals {
  www_config = {
    origin: "https://${aws_route53_record.www.fqdn}",
    name: "Open Sesame",
    api: {
      sesame: {
        origin: "https://${aws_route53_record.api.fqdn}"
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


output "www-origin-name" {
  value = aws_s3_bucket.www_test.website_endpoint
}
output "www-public-name" {
  value = "${aws_route53_record.www.name}.${data.aws_route53_zone.root.name}"
}