// @flow strict
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { AccessGrantProof, AccessOfferProof, User, Admin, UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { AccessClient, UserClient } from './api'; */
const { toUser, accessGrantProofEncoder, accessOfferProofEncoder, api } = require('@astral-atlas/sesame-models');
const { stringify } = require('@lukekaalim/cast');
const { createNoneAuthorization, createBearerAuthorization } = require('@lukekaalim/http-client');
const { toBase64 } = require('./base64');
const { createAccessClient, createUserClient } = require('./api');

/*::
export type GuestArgs = {
  baseURL: URL, 
  http: HTTPClient,
};
export type GuestSesameClient = {
  acceptAccess: $PropertyType<AccessClient, 'acceptAccess'>,
};
*/
const createGuestSesameClient = ({ baseURL, http }/*: GuestArgs*/)/*: GuestSesameClient*/ => {
  const authorization = createNoneAuthorization();
  const service = { baseURL, authorization };
  const accessClient = createAccessClient(http, service);
  return {
    acceptAccess: accessClient.acceptAccess,
  };
};

/*::
export type UserArgs = GuestArgs & {
  accessGrantProof: AccessGrantProof,
};
export type UserSesameClient = GuestSesameClient & {
  getSelfUser: $PropertyType<UserClient, 'getSelf'>,
  listAccess: $PropertyType<AccessClient, 'list'>,
  revokeAccess: $PropertyType<AccessClient, 'revoke'>,
  createAccessOfferForSelf: () => Promise<{ offerProof: AccessOfferProof }>,
};
*/
const createUserSesameClient = ({ baseURL, http, accessGrantProof }/*: UserArgs*/)/*: UserSesameClient*/ => {
  const authorization = createBearerAuthorization(accessGrantProofEncoder.encode(accessGrantProof));
  const service = { baseURL, authorization };
  const userClient = createUserClient(http, service);
  const accessClient = createAccessClient(http, service);
  const createAccessOfferForSelf = async () => {
    return await accessClient.createOffer(accessGrantProof.subject);
  };
  return {
    ...createGuestSesameClient({ baseURL, http }),
    getSelfUser: userClient.getSelf,
    listAccess: accessClient.list,
    revokeAccess: accessClient.revoke,
    createAccessOfferForSelf,
  }
};
/*::
export type AdminSesameClient = UserSesameClient & {
  listUsers: $PropertyType<UserClient, 'list'>,
  createNewUser: $PropertyType<UserClient, 'create'>,
  createAccessOffer: $PropertyType<AccessClient, 'createOffer'>,
};
*/

const createAdminSesameClient = ({ baseURL, http, accessGrantProof }/*: UserArgs*/)/*: AdminSesameClient*/ => {
  const authorization = createBearerAuthorization(accessGrantProofEncoder.encode(accessGrantProof));
  const service = { baseURL, authorization };
  const user = createUserClient(http, service);
  const accessClient = createAccessClient(http, service);

  return {
    ...createUserSesameClient({ baseURL, http, accessGrantProof }),
    createNewUser: user.create,
    listUsers: user.list,
    createAccessOffer: accessClient.createOffer,
  };
};


module.exports = {
  createGuestSesameClient,
  createUserSesameClient,
  createAdminSesameClient,
};
