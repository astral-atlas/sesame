// @flow strict
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { LoginToken, LoginTokenID, AccessToken, AccessTokenID, User } from '@astral-atlas/sesame-models'; */
const { createRESTClient, createBearerAuthorization } = require('@lukekaalim/rest-client');
const { toLoginToken, toAccessToken, toUser } = require('@astral-atlas/sesame-models');
const { toBase64 } = require('./base64');
const { stringify } = require('@lukekaalim/cast');

/*::
export type GuestSesameClientArgs = {
  baseURL: URL, 
  httpClient: HTTPClient,
};

export type AuthenticatedSesameClientArgs = GuestSesameClientArgs & {
  id: AccessTokenID,
  secret: string
};

export type GuestSesameClient = {
  createAccessToken: (login: { id: LoginTokenID, secret: string }) => Promise<AccessToken>,
  login: (login: { id: LoginTokenID, secret: string }) => Promise<UserSesameClient>,
};

export type UserSesameClient = GuestSesameClient & {
  createLoginToken: () => Promise<LoginToken>,
  getSelf: () => Promise<User>,
};

export type AdminSesameClient = AdminSesameClient & {
  createUser: (name: string) => Promise<User>,
};
*/

class RequiresAccessTokenError extends Error {};

const createGuestSesameClient = ({
  baseURL,
  httpClient
}/*: GuestSesameClientArgs*/)/*: GuestSesameClient*/ => {
  const rest = createRESTClient({ client: httpClient, baseURL });
  
  const createAccessToken = async (login) => {
    const { body, status } = await rest.post({
      path: '/access',
      body: { id: login.id, secret: login.secret }
    });

    const newAccessToken = toAccessToken(body);
    return newAccessToken;
  };
  const login = async (login) => {
    const { id, secret } = await createAccessToken(login);
    const authenticatedClient = createUserSesameClient({ baseURL, httpClient, id, secret });
    return authenticatedClient;
  };

  return {
    createAccessToken,
    login,
  };
};

const createUserSesameClient = ({
  baseURL,
  httpClient,
  id,
  secret,
}/*: AuthenticatedSesameClientArgs*/)/*: UserSesameClient*/ => {
  const authorization = createBearerAuthorization(toBase64(stringify({ id, secret })))
  const rest = createRESTClient({ client: httpClient, baseURL, authorization });

  const createLoginToken = async () => {
    const { body } = await rest.post({ path: '/login', body: null });
    const loginToken = toLoginToken(body);
    return loginToken;
  };
  const getSelf = async () => {
    const { body } = await rest.get({ path: '/self', body: null });
    const user = toUser(body);
    return user;
  }

  return {
    ...createGuestSesameClient({ baseURL, httpClient }),
    createLoginToken,
    getSelf,
  }
};

module.exports = {
  createGuestSesameClient,
  createUserSesameClient,
};
