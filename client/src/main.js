// @flow strict
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { AccessGrantProof, AccessOfferProof, User, Admin, UserID, Access } from '@astral-atlas/sesame-models'; */
/*:: import type { AccessClient, UserClient, AdminClient } from './api'; */
import { accessGrantProofEncoder } from '@astral-atlas/sesame-models';
import { createNoneAuthorization, createBearerAuthorization, createBasicAuthorization } from '@lukekaalim/http-client';
import { createAccessClient, createUserClient, createAdminClient } from './api.js';

/*::
export type GuestArgs = {|
  baseURL: URL, 
  http: HTTPClient,
|};
export type GuestSesameClient = {|
  acceptAccess: $PropertyType<AccessClient, 'acceptAccess'>,
  authorize: (auth: AuthArgs) => UserSesameClient,
|};
*/
export const createGuestSesameClient = ({ baseURL, http }/*: GuestArgs*/)/*: GuestSesameClient*/ => {
  const authorization = createNoneAuthorization();
  const service = { baseURL, authorization };
  const accessClient = createAccessClient(http, service);
  const authorize = (auth) => {
    const { authMode } = auth;
    switch (auth.authMode) {
      case 'super':
        const { username, password } = auth;
        return createUserSesameClient({ http, baseURL, authMode: 'super', username, password });
      case 'grant':
        const { accessGrantProof } = auth;
        return createUserSesameClient({ http, baseURL, authMode: 'grant', accessGrantProof });
    }
  };
  return {
    acceptAccess: accessClient.acceptAccess,
    authorize,
  };
};

/*::

export type AuthArgs =
  | {| authMode: 'grant', accessGrantProof: AccessGrantProof |}
  | {| authMode: 'super', username: string, password: string |}
export type UserArgs = {|
  ...GuestArgs,
  ...AuthArgs,
|};
export type UserSesameClient = {|
  ...GuestSesameClient,
  getSelfUser: $PropertyType<UserClient, 'getSelf'>,
  listAccess: $PropertyType<AccessClient, 'list'>,
  revokeAccess: $PropertyType<AccessClient, 'revoke'>,
  createAccessOfferForSelf: () => Promise<{ offerProof: AccessOfferProof }>,
  getAccessForSelf: () => Promise<{ access: Access[] }>,
|};
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

export const createUserSesameClient = (args/*: UserArgs*/)/*: UserSesameClient*/ => {
  const { baseURL, http } = args;
  const authorization = getAuthorization(args);
  const service = { baseURL, authorization };
  const userClient = createUserClient(http, service);
  const accessClient = createAccessClient(http, service);
  const createAccessOfferForSelf = async () => {
    const { self } = await userClient.getSelf();
    if (!self)
      throw new Error('Must be logged in to create Access');
    return await accessClient.createOffer(self.id);
  };
  const getAccessForSelf = async () => {
    const { self } = await userClient.getSelf();
    if (!self)
      throw new Error('Must be logged in to list Access');
    const { access } = await accessClient.list(self.id);
    return { access };
  };
  return {
    ...createGuestSesameClient({ baseURL, http }),
    listAccess: accessClient.list,
    revokeAccess: accessClient.revoke,
    getSelfUser: userClient.getSelf,
    createAccessOfferForSelf,
    getAccessForSelf,
  }
};
/*::
export type AdminSesameClient = {|
  ...UserSesameClient,
  listUsers: $PropertyType<UserClient, 'list'>,
  createNewUser: $PropertyType<UserClient, 'create'>,
  createAccessOffer: $PropertyType<AccessClient, 'createOffer'>,
  createNewAdmin: $PropertyType<AdminClient, 'create'>,
|};
*/

export const createAdminSesameClient = (args/*: UserArgs*/)/*: AdminSesameClient*/ => {
  const { baseURL, http } = args;
  const authorization = getAuthorization(args);
  const service = { baseURL, authorization };
  const user = createUserClient(http, service);
  const accessClient = createAccessClient(http, service);
  const adminClient = createAdminClient(http, service);

  return {
    ...createUserSesameClient(args),
    createNewUser: user.create,
    listUsers: user.list,
    createAccessOffer: accessClient.createOffer,
    createNewAdmin: adminClient.create
  };
};