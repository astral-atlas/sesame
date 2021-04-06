// @flow strict
/*:: import type { HTTPClient, HTTPService } from '@lukekaalim/http-client'; */
/*:: import type { JSONValue } from '@lukekaalim/cast'; */
/*:: import type { AccessOfferProof, AccessGrantProof, AccessOffer, AccessGrant, AccessRevocation, User, Admin, UserID } from '@astral-atlas/sesame-models'; */
const { json: { createGETClient, createPOSTClient } } = require('@lukekaalim/http-client');
const { api } = require('@astral-atlas/sesame-models');
const { getObjectEntries } = require('./object');
const { toGETSelfUserResponse, toGETUsersResponse } = require('./models');

/*::
export type AccessClient = {
  createOffer: (subject: UserID) => Promise<{ offerProof: AccessOfferProof }>,
  acceptAccess: (deviceName: string, offerProof: AccessOfferProof) => Promise<{ grantProof: AccessGrantProof }>,
  list: (userId: UserID) => Promise<{ offers: AccessOffer[], grants: AccessGrant[], revocations: AccessRevocation[] }>,
  revoke: (subject: UserID) => Promise<null>,
};
*/
const createAccessClient = (http/*: HTTPClient*/, service/*: HTTPService*/)/*: AccessClient*/ => {
  const createOfferClient = createPOSTClient(api.POSTCreateAccessOffer, http, service);
  const acceptAccessClient = createPOSTClient(api.POSTAcceptAccess, http, service);
  const listClient = createGETClient(api.GETAccessList, http, service);
  const revokeClient = createPOSTClient(api.POSTAccessRevoke, http, service);
  const createOffer = async (subject) => {
    const { body: { offerProof } } = await createOfferClient.post(null, { subject });
    return { offerProof };
  };
  const acceptAccess = async (deviceName, offerProof) => {
    const { body: { grantProof } } = await acceptAccessClient.post(null, { deviceName, offerProof });
    return { grantProof };
  };
  const list = async (userId) => {
    const { body: { offers, grants, revocations } } = await listClient.get({ userId });
    return { offers, grants, revocations };
  };
  const revoke = async (subject) => {
    await revokeClient.post(null, { subject });
    return null;
  };
  return { createOffer, acceptAccess, list, revoke };
};

/*::
export type UserClient = {
  getSelf: () => Promise<{ self: User, admin: null | Admin, access: null | AccessGrant }>,
  getById: (userId: UserID) => Promise<{ user: User }>,
  list: () => Promise<{ users: User[] }>,
  create: (name: string) => Promise<{ newUser: User }>,
};
*/
const createUserClient = (http/*: HTTPClient*/, service/*: HTTPService*/)/*: UserClient*/ => {
  const getSelfClient = createGETClient(api.GETSelf, http, service);
  const postNewClient = createPOSTClient(api.POSTNewUser, http, service);
  const getByIdClient = createGETClient(api.GETUserById, http, service);
  const listClient = createGETClient(api.GETUserList, http, service);
  const getSelf = async () => {
    const { body: { admin, self, access } } = await getSelfClient.get(null);
    return { admin, self, access };
  };
  const create = async (name) => {
    const { body: { newUser } } = await postNewClient.post(null, { name });
    return { newUser };
  };
  const getById = async (userId) => {
    const { body: { user } } = await getByIdClient.get({ userId });
    return { user };
  }
  const list = async () => {
    const { body: { users } } = await listClient.get(null);
    return { users };
  };
  return { getSelf, create, getById, list };
};

module.exports = {
  createUserClient,
  createAccessClient,
};
