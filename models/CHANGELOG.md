# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [6.0.0]
### Removed
 - encodeAccessToken and decodeAccessToken functions
### Added
 - accessTokenEncoder and loginTokenEncoder Encoder objects

## [5.1.0]
### Added
 - encodeAccessToken and decodeAccessToken functions

## [5.0.0]
### Modified
 - creatorAdminId is optional, as the original users are not created by anyone

## [4.0.0]
### Removed
 - AccessToken device property

## [3.0.0]
### Modified
 - LoginToken now links to the created access token (or null, if not yet consumed)

## [2.0.0]
### Modified
 - once time access tokens renamed to LoginToken
 - permanent access token renamed to AccessToken 

## [1.3.0]
### Added
 - creatorAdminId to users to represent the admin that created them

## [1.2.0]
### Added
 - optional adminId field to users

## [1.1.0]
### Added
 - Project start