// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { UserID, AdminID, LoginToken } from '@astral-atlas/sesame-models'; */
/*:: export type * from '@astral-atlas/sesame-models'; */
const { toUserId, toAdminId, toLoginToken } = require('@astral-atlas/sesame-models');
const { toObject, toString, stringify } = require('@lukekaalim/cast');

/*::
export type SuperUser = {
  userId: UserID,
  adminId: AdminID,
  password: string,
};
*/

const toSuperUser/*: Cast<SuperUser>*/ = (value) => {
  const object = toObject(value);
  return {
    userId: toUserId(object.userId),
    adminId: toAdminId(object.adminId),
    password: toString(object.password),
  }
};

/*::
export type LoginRequest = {
  accessTokenName: string,
  loginToken: LoginToken,
};
*/

const toLoginRequest/*: Cast<LoginRequest>*/ = (value) => {
  const object = toObject(value);
  return {
    accessTokenName: toString(object.accessTokenName),
    loginToken: toLoginToken(object.loginToken),
  }
};

/*::
export type POSTUserRequest = {
  name: string,
};
export type PUTUserRequest = {
  name: string,
};
*/
const toPOSTUserRequest/*: Cast<POSTUserRequest>*/ = (value) => {
  const object = toObject(value);
  return {
    name: toString(object.name),
  }
};
const toPUTUserRequest/*: Cast<PUTUserRequest>*/ = toPOSTUserRequest;

/*::
export type POSTLoginRequest = {
  subjectId: UserID,
};
export type POSTAccessRequest = {
  loginToken: LoginToken,
  deviceName: string,
};
*/
const toPOSTLoginRequest/*: Cast<POSTLoginRequest>*/ = (value) => {
  const object = toObject(value);
  return {
    subjectId: toUserId(object.subjectId),
  }
};
const toPOSTAccessRequest/*: Cast<POSTAccessRequest>*/ = (value) => {
  const object = toObject(value);
  return {
    loginToken: toLoginToken(object.loginToken),
    deviceName: toString(object.deviceName),
  };
};
/*::
export type POSTAdminRequest = {
  userId: UserID,
};
*/
const toPOSTAdminRequest/*: Cast<POSTAdminRequest>*/ = (value) => {
  const object = toObject(value);
  return {
    userId: toUserId(object.userId),
  };
};

module.exports = {
  ...require('@astral-atlas/sesame-models'),
  toSuperUser,
  toLoginRequest,
  toPOSTUserRequest,
  toPUTUserRequest,
  toPOSTLoginRequest,
  toPOSTAccessRequest,
  toPOSTAdminRequest,
}