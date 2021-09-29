resource "aws_s3_bucket" "application_versions" {
  bucket_prefix = "sesame-application-versions"
}

data "aws_iam_role" "beanstalk_service" {
  name = "aws-elasticbeanstalk-service-role"
}

resource "aws_elastic_beanstalk_application" "api" {
  name        = "sesame-api"
  description = "The API behind Astral Atlas's single sign on"

  appversion_lifecycle {
    service_role          = data.aws_iam_role.beanstalk_service.arn
    max_count             = 128
    delete_source_from_s3 = true
  }
}
data "external" "create_api_bundle" {
  program = ["bash", "${path.module}/create_api_bundle.sh"]

  query = {
    "release_tag": "@astral-atlas/sesame-api@2.0.0",
    "application_version_label": "sesame-api@2.0.0",
    "temp_workspace": "temp/api",
    "config": jsonencode(local.api_config),
  }
}
locals {
  api_config = {
    "superUser": {
      "type": "static",
      "username": "super_luke",
      "password": "super_secret"
    },
    "port": 8080 // this is the default port elastic beanstalk will listen to
  }
}

resource "immutable-elastic-beanstalk_application-version" "latest" {
  application_name = aws_elastic_beanstalk_application.api.name
  source_bucket = aws_s3_bucket.application_versions.bucket
  archive_path = data.external.create_api_bundle.result.application_version_source_bundle
}

resource "aws_elastic_beanstalk_environment" "api_test" {
  name                = "sesame-api-test"
  application         = aws_elastic_beanstalk_application.api.name
  solution_stack_name = "64bit Amazon Linux 2 v5.3.2 running Node.js 14"
  version_label = immutable-elastic-beanstalk_application-version.latest.version_label

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = "aws-elasticbeanstalk-ec2-role"
  }
  setting {
    namespace = "aws:elasticbeanstalk:cloudwatch:logs"
    name      = "StreamLogs"
    value     = true
  }
  setting {
    namespace = "aws:elasticbeanstalk:cloudwatch:logs"
    name      = "DeleteOnTerminate"
    value     = true
  }
}

resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.root.zone_id
  name    = "api.sesame"
  type    = "A"

  alias {
    name                   = aws_elastic_beanstalk_environment.api_test.cname
    zone_id                = "Z2PCDNR3VC2G1N"
    evaluate_target_health = false
  }
}

output "api-origin-name" {
  value = aws_elastic_beanstalk_environment.api_test.cname
}
output "api-public-name" {
  value = "${aws_route53_record.api.name}.${data.aws_route53_zone.root.name}"
}