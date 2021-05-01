variable "owner" {
  type = string
}
variable "repository" {
  type = string
}
variable "release_tag" {
  type = string
}
variable "release_asset_name" {
  type = string
}
variable "output_directory" {
  type = string
  default = "./temp"
}


data "github_release" "example" {
    repository  = var.repository
    owner       = var.owner
    retrieve_by = "tag"
    release_tag = var.release_tag
}

data "http" "example" {
  url = data.github_release.example.asserts_url
}

locals {
  release_data = jsondecode(data.http.example.body)
  release_asset = [
    for asset in local.release_data: asset
    if asset.name == var.release_asset_name
  ][0]
}

data "external" "example" {
  program = ["bash", "${path.module}/http_file.sh"]

  query = {
    directory = var.output_directory
    url = local.release_asset.browser_download_url
    file = local.release_asset.name
  }
}

output "release_asset" {
  value = local.release_asset
}
output "output_file" {
  value = abspath(data.external.example.result.file)
}