terraform {
  required_providers {
    external = {
      source = "hashicorp/external"
      version = "2.1.0"
    }

    http = {
      source = "hashicorp/http"
      version = "2.1.0"
    }

    github = {
      source = "integrations/github"
      version = "4.9.2"
    }
  }
}