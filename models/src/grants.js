// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { UserID } from './user'; */

const { toObject, toString, toNullable } = require('@lukekaalim/cast');
const { toUserId } = require('./user');

/*::
export type AccessGrantID = string;
export type AccessGrant = {|
  id: AccessGrantID,

  subject: UserID,
  secret: string,

  hostName: null | string,
  deviceName: string,

  loginGrantId: LoginGrantID,
|};

export type LoginGrantID = string;
export type LoginGrant = {|
  id: LoginGrantID,

  subject: UserID,
  secret: string,

  createdBy: UserID,

  // AccessGrantID being null indicates an unused login grant.
  accessGrantId: AccessGrantID | null,
|};
*/
const toAccessGrantId/*: Cast<AccessGrantID>*/ = toString;
const toAccessGrant/*: Cast<AccessGrant>*/ = (value) => {
  const object = toObject(value);
  return {
    id: toAccessGrantId(object.id),
    subject: toUserId(object.subject),
    secret: toString(object.secret),
    hostName: toNullable(object.hostName, toString),
    deviceName: toString(object.deviceName),
    loginGrantId: toLoginGrantId(object.loginGrantId),
  }
};

const toLoginGrantId/*: Cast<LoginGrantID>*/ = toString;
const toLoginGrant/*: Cast<LoginGrant>*/ = (value) => {
  const object = toObject(value);
  return {
    id: toAccessGrantId(object.id),
    subject: toUserId(object.subject),
    secret: toString(object.secret),
    createdBy: toUserId(object.createdBy),
    accessGrantId: toNullable(object.accessGrantId, toAccessGrantId),
  }
};

module.exports = {
  toAccessGrantId,
  toAccessGrant,
  toLoginGrantId,
  toLoginGrant,
}