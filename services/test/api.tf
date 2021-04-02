resource "aws_s3_bucket" "application_versions" {
  bucket_prefix = "sesame-application-versions"
}

data "aws_iam_role" "beanstalk_service" {
  name = "aws-elasticbeanstalk-service-role"
}
data "aws_iam_instance_profile" "elastic_beanstalk_default" {
  name = "aws-elasticbeanstalk-ec2-role"
}

resource "immutable-elastic-beanstalk_application-version" "latest_version" {
  application_name = aws_elastic_beanstalk_application.sesame-api.name
  source_bucket = aws_s3_bucket.application_versions.bucket
  archive_path = "1.0.4.zip"
}

resource "aws_elastic_beanstalk_application" "sesame-api" {
  name        = "sesame-api"
  description = "The API behind Astral Atlas's single sign on"

  appversion_lifecycle {
    service_role          = data.aws_iam_role.beanstalk_service.arn
    max_count             = 128
    delete_source_from_s3 = true
  }
}

data "aws_elastic_beanstalk_solution_stack" "node" {
  most_recent = true

  name_regex = "^64bit Amazon Linux 2 v(.*) running Node.js 12$"
}

resource "aws_elastic_beanstalk_environment" "tfenvtest" {
  name                = "tf-test-name"
  application         = aws_elastic_beanstalk_application.sesame-api.name
  solution_stack_name = data.aws_elastic_beanstalk_solution_stack.node.name
  version_label       = immutable-elastic-beanstalk_application-version.latest_version.version_label

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = data.aws_iam_instance_profile.elastic_beanstalk_default.arn
  }
}

output "api-cname" {
  value = aws_elastic_beanstalk_environment.tfenvtest.cname
}