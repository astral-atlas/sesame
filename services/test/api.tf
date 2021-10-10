resource "aws_s3_bucket" "application_versions" {
  bucket_prefix = "sesame-application-versions"
}
resource "aws_s3_bucket" "api_data" {
  bucket_prefix = "sesame-test-data"
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
    "application_version_label": "sesame-api@2.0.0-${substr(md5(jsonencode(local.api_config)), 0, 6)}",
    "temp_workspace": "temp/api",
    "config": jsonencode(local.api_config),
  }
}
locals {
  api_config = {
    "md5_breaker": 2
    "data": { "type": "awsS3", "bucket": aws_s3_bucket.api_data.bucket, "prefix": "/" },
    "port": 8080 // this is the default port elastic beanstalk will listen to
  }
}

resource "immutable-elastic-beanstalk_application-version" "latest" {
  application_name = aws_elastic_beanstalk_application.api.name
  source_bucket = aws_s3_bucket.application_versions.bucket
  archive_path = data.external.create_api_bundle.result.application_version_source_bundle
}

data "aws_iam_policy_document" "ec2_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

data "aws_iam_policy" "elastic_beanstalk_web_policy" {
  name = "AWSElasticBeanstalkWebTier"
}
data "aws_iam_policy" "elastic_beanstalk_worker_policy" {
  name = "AWSElasticBeanstalkWorkerTier"
}
data "aws_iam_policy" "elastic_beanstalk_docker_policy" {
  name = "AWSElasticBeanstalkMulticontainerDocker"
}
data "aws_iam_policy" "ec2_contanier_read_only_policy" {
  name = "AmazonEC2ContainerRegistryReadOnly"
}
data "aws_iam_policy_document" "api_role_policy" {
  // Sesame Data Access
  statement {
    sid = "DataAccess"
    actions   = ["s3:Get*", "s3:List*", "s3:PutObject"]
    resources = [
      aws_s3_bucket.api_data.arn,
      "${aws_s3_bucket.api_data.arn}/*"
    ]
    effect = "Allow"
  }
}

resource "aws_iam_role" "api_role" {
  name = "sesame_api_role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role_policy.json

  inline_policy {
    name = "api_role_policy"
    policy = data.aws_iam_policy_document.api_role_policy.json
  }

  managed_policy_arns = [
    data.aws_iam_policy.elastic_beanstalk_web_policy.arn,
    data.aws_iam_policy.elastic_beanstalk_worker_policy.arn,
    data.aws_iam_policy.elastic_beanstalk_docker_policy.arn,
    data.aws_iam_policy.ec2_contanier_read_only_policy.arn,
  ]
}
resource "aws_iam_instance_profile" "api_instance_profile" {
  name = "sesame_api_instance_profile"
  role = aws_iam_role.api_role.name
}

data "aws_elastic_beanstalk_solution_stack" "node_14_latest" {
  most_recent = true

  name_regex = "^64bit Amazon Linux 2 (.*) running Node.js 14$"
}

resource "aws_elastic_beanstalk_environment" "api_test" {
  name                = "sesame-api-test"
  application         = aws_elastic_beanstalk_application.api.name
  solution_stack_name = data.aws_elastic_beanstalk_solution_stack.node_14_latest.name
  version_label = immutable-elastic-beanstalk_application-version.latest.version_label

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.api_instance_profile.name
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

output "api-source-bucket" {
  value = aws_s3_bucket.application_versions.bucket
}
output "api-origin-name" {
  value = aws_elastic_beanstalk_environment.api_test.cname
}
output "api-public-name" {
  value = "${aws_route53_record.api.name}.${data.aws_route53_zone.root.name}"
}
output "api-data-origin" {
  value = aws_s3_bucket.api_data.bucket
}