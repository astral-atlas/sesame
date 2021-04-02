// @flow strict
/*:: import type { HTTPClient, HTTPService } from '@lukekaalim/http-client'; */
/*:: import type { JSONValue } from '@lukekaalim/cast'; */
/*:: import type { LoginToken, AccessToken, User, Admin, UserID } from '@astral-atlas/sesame-models'; */
const { json: { createGETClient, createPOSTClient } } = require('@lukekaalim/http-client');
const { api } = require('@astral-atlas/sesame-models');
const { getObjectEntries } = require('./object');
const { toPOSTAccessResponse, toGETSelfUserResponse, toGETUsersResponse } = require('./models');

/*::
export type GrantClient = {
  grantAccess: (loginToken: LoginToken, deviceName: string) => Promise<AccessToken>,
  grantLogin: (subjectId: UserID) => Promise<LoginToken>,
};
*/
const createGrantClient = (http/*: HTTPClient*/, service/*: HTTPService*/)/*: GrantClient*/ => {
  const postAccessGrantClient = createPOSTClient(api.POSTAccessGrant, http, service);
  const postLoginGrantClient = createPOSTClient(api.POSTLoginGrant, http, service);
  const grantAccess = async (loginToken, deviceName) => {
    const { body: { accessToken }} = await postAccessGrantClient.post(null, { deviceName, loginToken });
    return accessToken;
  };
  const grantLogin = async (subjectId) => {
    const { body: { loginToken }} = await postLoginGrantClient.post(null, { subjectId });
    return loginToken;
  };
  return { grantAccess, grantLogin };
};

/*::
export type UserClient = {
  getSelf: () => Promise<{ self: User, admin: null | Admin }>,
};
*/
const createUserClient = (http/*: HTTPClient*/, service/*: HTTPService*/)/*: UserClient*/ => {
  const getSelfClient = createGETClient(api.GETSelf, http, service);
  const getSelf = async () => {
    const { body: { admin, self } } = await getSelfClient.get(null);
    return { admin, self };
  };
  return { getSelf };
};

module.exports = {
  createUserClient,
  createGrantClient,
};
