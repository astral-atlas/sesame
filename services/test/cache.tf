resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.root.zone_id
  name    = "sesame"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.www.domain_name
    zone_id                = aws_cloudfront_distribution.www.hosted_zone_id
    evaluate_target_health = false
  }
}
module "www_certificate" {
  source = "../modules/certificate"
  providers = {
    aws = aws.american
  }

  record_zone_id = data.aws_route53_zone.root.zone_id
  record_full_name = "sesame.astral-atlas.com"
}
resource "aws_cloudfront_distribution" "www" {
  origin {
    domain_name = aws_s3_bucket.www_test.bucket_regional_domain_name
    origin_id   = "www"
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = ["sesame.astral-atlas.com"]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "www"

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 86400

    forwarded_values {
      query_string = true

      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.www.arn
    }
  }

  price_class = "PriceClass_All"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = module.www_certificate.certificate_arn
    ssl_support_method = "sni-only"
  }
}
resource "aws_cloudfront_function" "www" {
  name    = "sesame_normalize_path"
  runtime = "cloudfront-js-1.0"
  publish = true
  code    = file("${path.module}/www_function.js")
}