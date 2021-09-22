// @flow strict
/*:: import type { UserID } from './user'; */
/*:: import type { Cast, JSONValue } from '@lukekaalim/cast'; */
import { toObject, toString, toNullable, fromObject, castObject } from '@lukekaalim/cast';
import { toUserId } from './user.js';
import { toUser } from "./user";

/*::
export type AccessDescription = {
  user: UserID,
  grants: {
    identity: IdentityGrant[],
    login: LoginGrant[]
  }
};
*/

// An "Identity Grant" allows the bearer to act as if
// they had the contained identity
/*::
export type IdentityGrantID = string;
export type IdentityGrant = {|
  id: IdentityGrantID,
  type: 'identity',
  user: UserID,
  targetOrigin: string,

  granteeName: null | string
|};
*/

export const castIdentityGrantId/*: Cast<IdentityGrantID>*/ = toString;
export const castIdentityGrant/*: Cast<IdentityGrant>*/ = castObject(prop => ({
  id: prop('id', castIdentityGrantId),
  type: prop('')
}));


// A "Login Grant" allows the bearer to create an "Identity Grant"
// for themselves
/*::
export type LoginGrantID = string;
export type LoginGrant = {|
  id: LoginGrantID,
  type: 'login',
  user: UserID,

  identityGrantId: null | IdentityGrantID,
|};
*/

export const PROOF_TYPE_IDS = {
  login: 0,
  identity: 1,
};
/*::
export type Secret = string;

export type LoginGrantProof = {|
  type: 'login',
  id: LoginGrantID,
  user: UserID,
  secret: Secret,
|};

export type IdentityGrantProof = {|
  type: 'identity',
  id: IdentityGrantID,
  user: UserID,
  secret: Secret,
|};
*/



export const toAccessId/*: Cast<AccessID>*/ = toString;
export const toAccess/*: Cast<Access>*/ = castObject(prop => ({
  id: prop('id', toAccessId),
  subject: prop('subject', toUserId),
  origin: prop('origin', toString),

  //grant: prop('grant', v => toNullable(v, toAccessGrant)),
  //revocation: prop('revocation', v => toNullable(v, toAccessRevocation))
}));

export const toAccessOffer/*: Cast<AccessOffer>*/ = (value) => {
  const object = toObject(value)
  return {
    id: toAccessId(object.id),
    subject: toUserId(object.subject),
    creator: toUserId(object.creator),
    offerSecret: toString(object.offerSecret),
  }
};

export const toAccessGrant/*: Cast<AccessGrant>*/ = (value) => {
  const object = toObject(value)
  return {
    id: toAccessId(object.id),
    grantSecret: toString(object.grantSecret),
    hostName: toNullable(object.hostName, toString),
    deviceName: toString(object.deviceName),
  }
};

export const toAccessRevocation/*: Cast<AccessRevocation>*/ = (value) => {
  const object = toObject(value)
  return {
    id: toAccessId(object.id),
  }
};
