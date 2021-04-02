// @flow strict
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { LoginToken, LoginTokenID, AccessToken, AccessTokenID, User, Admin, UserID } from '@astral-atlas/sesame-models'; */
const { toLoginToken, toAccessToken, toUser, loginTokenEncoder, accessTokenEncoder, api } = require('@astral-atlas/sesame-models');
const { stringify } = require('@lukekaalim/cast');
const { createNoneAuthorization, createBearerAuthorization } = require('@lukekaalim/http-client');
const { toBase64 } = require('./base64');
const { createGrantClient, createUserClient } = require('./api');

/*::
export type GuestArgs = {
  baseURL: URL, 
  http: HTTPClient,
};
export type GuestSesameClient = {
  grantAccess: (login: LoginToken, deviceName: string) => Promise<AccessToken>,
};
*/
const createGuestSesameClient = ({ baseURL, http }/*: GuestArgs*/)/*: GuestSesameClient*/ => {
  const authorization = createNoneAuthorization();
  const service = { baseURL, authorization };
  const grantClient = createGrantClient(http, service);
  return {
    grantAccess: grantClient.grantAccess,
  };
};

/*::
export type UserArgs = GuestArgs & {
  accessToken: AccessToken,
};
export type UserSesameClient = GuestSesameClient & {
  getSelf: () => Promise<{ self: User, admin: null | Admin }>,
  createLoginGrant: (userId: UserID) => Promise<LoginToken>,
};
*/
const createUserSesameClient = ({ baseURL, http, accessToken }/*: UserArgs*/)/*: UserSesameClient*/ => {
  const authorization = createBearerAuthorization(accessTokenEncoder.encode(accessToken));
  const service = { baseURL, authorization };
  const userClient = createUserClient(http, service);
  const grantClient = createGrantClient(http, service);
  return {
    ...createGuestSesameClient({ baseURL, http }),
    getSelf: userClient.getSelf,
    createLoginGrant: grantClient.grantLogin,
  }
};
/*::
export type AdminSesameClient = UserSesameClient & {
  createUser: (userName: string) => Promise<User>,
  getUsers: () => Promise<User[]>,
};
*/

/*
const createAdminSesameClient = ({ baseURL, http, accessToken }/*: UserArgs)/*: AdminSesameClient => {
  const authorization = createBearerAuthorization(accessTokenEncoder.encode(accessToken));
  const service = { baseURL, authorization };
  const user = createUserClient(http, service);
  const getUsers = async () => {
    return await user.getSelf();
  };
  const createUser = async () => {

  }
  return {
    ...createUserSesameClient({ sesameBaseURL, httpClient, accessToken }),
    getUsers,
  };
};
*/

module.exports = {
  createGuestSesameClient,
  createUserSesameClient,
};
