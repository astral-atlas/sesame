terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
    immutable-elastic-beanstalk = {
      source = "registry.terraform.io/lukekaalim/immutable-elastic-beanstalk"
      version = "2.0.4"
    }
  }
  backend "remote" {
    organization = "astral-atlas"

    workspaces {
      name = "sesame"
    }
  }
}

provider "immutable-elastic-beanstalk" {
  region = "ap-southeast-2"
}

provider "aws" {
  region = "ap-southeast-2"
}
