variable "record_zone_id" {
  type = string
}
variable "record_full_name" {
  type = string
}

resource "aws_route53_record" "validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.record_zone_id
}

resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.validation : record.fqdn]
}

resource "aws_acm_certificate" "main" {
  domain_name       = var.record_full_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
  tags = {}
}
output "certificate_arn" {
  value = aws_acm_certificate.main.arn
}