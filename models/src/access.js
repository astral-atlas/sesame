// @flow strict
/*:: import type { UserID } from './user'; */
/*:: import type { Cast } from '@lukekaalim/cast'; */
import { toObject, toString, toNullable, fromObject, castObject } from '@lukekaalim/cast';
import { toUserId } from './user.js';

/*::
export type AccessID = string;
export type Access = {|
  id: AccessID,
  offer: AccessOffer,
  grant: null | AccessGrant,
  revocation: null | AccessRevocation,
|};

export type AccessOffer = {|
  id: AccessID,
  offerSecret: string,
  subject: UserID,
  creator: UserID,
|};

export type AccessGrant = {|
  id: AccessID,
  grantSecret: string,
  hostName: null | string,
  deviceName: string, 
|};

export type AccessRevocation = {|
  id: AccessID,
|};
*/

export const toAccessId/*: Cast<AccessID>*/ = toString;
export const toAccess/*: Cast<Access>*/ = castObject(prop => ({
  id: prop('id', toAccessId),
  offer: prop('offer', toAccessOffer),
  grant: prop('grant', v => toNullable(v, toAccessGrant)),
  revocation: prop('revocation', v => toNullable(v, toAccessRevocation))
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
