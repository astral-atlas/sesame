// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { UserID, AdminID } from '@astral-atlas/sesame-models'; */
/*:: export type * from '@astral-atlas/sesame-models'; */
const { toUserId, toAdminId } = require('@astral-atlas/sesame-models');
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
*/
const toPOSTLoginRequest/*: Cast<POSTLoginRequest>*/ = (value) => {
  const object = toObject(value);
  return {
    subjectId: toUserId(object.subjectId),
  }
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
  toPOSTUserRequest,
  toPUTUserRequest,
  toPOSTLoginRequest,
  toPOSTAdminRequest,
}