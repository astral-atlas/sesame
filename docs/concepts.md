# Concepts

## Access Keys

To authenticate a human's browser for atlas service, the following process occurs:

1. An Administrator creates a User
2. An Administrator creates a LoginToken
3. The Administrator creates a URL, with the LoginToken embedded in the URL in a format the service can read. (OAuth-style)
4. The Service retrieves the LoginToken embedded in the URL, and uses it to fetch a AccessToken and redirect the user to an appropriate page.
5. The Services can then use the AccessToken to act on behalf of the User.