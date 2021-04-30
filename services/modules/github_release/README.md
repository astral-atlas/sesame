# Github Release (Module)

This terraform module provides access to metadata and a local file representing a particular release asset.

## Requirements
This module makes use of the "external" resource to run a bash script. The following executables must be available on the `PATH`:
 - `bash`
 - `jq`
 - `curl`

## Inputs
|Name|Type|Required|Description|
|-|-|-|-|
|`owner`|string|true|The Github "owner" of a repo, which could be a organization or user.
|`repository`|string|true|The name of the github repository|
|`release_tag`|string|true|The name of the tag that the release belong to|
|`release_asset_name`|string|true|The filename of the release asset|

## Outputs
|Name|Type|Description|
|-|-|-|
|`release_asset`|object (complex)|The Github object that represents that asset.|
|`output_file`|string|The path to the release asset locally on file|