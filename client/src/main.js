// @flow strict
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { AccessGrantProof, AccessOfferProof, User, Admin, UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { AccessClient, UserClient } from './api'; */
const { toUser, accessGrantProofEncoder, accessOfferProofEncoder, api } = require('@astral-atlas/sesame-models');
const { stringify } = require('@lukekaalim/cast');
const { createNoneAuthorization, createBearerAuthorization, createBasicAuthorization } = require('@lukekaalim/http-client');
const { toBase64 } = require('./base64');
const { createAccessClient, createUserClient } = require('./api');

/*::
export type GuestArgs = {|
  baseURL: URL, 
  http: HTTPClient,
|};
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

export type AuthArgs =
  | {| authMode: 'grant', accessGrantProof: AccessGrantProof |}
  | {| authMode: 'super', username: string, password: string |}
export type UserArgs = {|
  ...GuestArgs,
  ...AuthArgs
|};
export type UserSesameClient = GuestSesameClient & {
  getSelfUser: $PropertyType<UserClient, 'getSelf'>,
  listAccess: $PropertyType<AccessClient, 'list'>,
  revokeAccess: $PropertyType<AccessClient, 'revoke'>,
  createAccessOfferForSelf: () => Promise<{ offerProof: AccessOfferProof }>,
};
*/

const getAuthorization = (args/*: UserArgs*/) => {
  switch (args.authMode) {
    case 'super':
      return createBasicAuthorization(args.username, args.password);
    case 'grant':
      return createBearerAuthorization(accessGrantProofEncoder.encode(args.accessGrantProof));
    default:
      throw new Error();
  }
};

const createUserSesameClient = (args/*: UserArgs*/)/*: UserSesameClient*/ => {
  const { baseURL, http } = args;
  const authorization = getAuthorization(args);
  const service = { baseURL, authorization };
  const userClient = createUserClient(http, service);
  const accessClient = createAccessClient(http, service);
  const createAccessOfferForSelf = async () => {
    const { self } = await userClient.getSelf();
    return await accessClient.createOffer(self.id);
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

const createAdminSesameClient = (args/*: UserArgs*/)/*: AdminSesameClient*/ => {
  const { baseURL, http } = args;
  const authorization = getAuthorization(args);
  const service = { baseURL, authorization };
  const user = createUserClient(http, service);
  const accessClient = createAccessClient(http, service);

  return {
    ...createUserSesameClient(args),
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
