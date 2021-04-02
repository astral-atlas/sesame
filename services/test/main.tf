terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
    immutable-elastic-beanstalk = {
      source = "lukekaalim/immutable-elastic-beanstalk"
      version = "2.0.4"
    }
  }
}

provider "immutable-elastic-beanstalk" {
  region = "ap-southeast-2"
  profile = "personal"
}

provider "aws" {
  region = "ap-southeast-2"
  profile = "personal"
}
