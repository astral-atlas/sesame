// @flow strict
/*:: import type { UserID } from './user'; */
/*:: import type { Cast } from '@lukekaalim/cast'; */
const { toObject, toString, toNullable, fromObject, castObject } = require('@lukekaalim/cast');
const { toUserId } = require('./user');

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

const toAccessId/*: Cast<AccessID>*/ = toString;
const toAccess/*: Cast<Access>*/ = castObject(prop => ({
  id: prop('id', toAccessId),
  offer: prop('offer', toAccessOffer),
  grant: prop('grant', v => toNullable(v, toAccessGrant)),
  revocation: prop('revocation', v => toNullable(v, toAccessRevocation))
}));

const toAccessOffer/*: Cast<AccessOffer>*/ = (value) => {
  const object = toObject(value)
  return {
    id: toAccessId(object.id),
    subject: toUserId(object.subject),
    creator: toUserId(object.creator),
    offerSecret: toString(object.offerSecret),
  }
};

const toAccessGrant/*: Cast<AccessGrant>*/ = (value) => {
  const object = toObject(value)
  return {
    id: toAccessId(object.id),
    grantSecret: toString(object.grantSecret),
    hostName: toNullable(object.hostName, toString),
    deviceName: toString(object.deviceName),
  }
};

const toAccessRevocation/*: Cast<AccessRevocation>*/ = (value) => {
  const object = toObject(value)
  return {
    id: toAccessId(object.id),
  }
};

module.exports = {
  toAccessId,
  toAccess,
  toAccessOffer,
  toAccessGrant,
  toAccessRevocation,
}