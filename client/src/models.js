// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { User, Admin } from '@astral-atlas/sesame-models'; */
const { toObject, toArray } = require('@lukekaalim/cast');
const { toUser, toAdmin } = require('@astral-atlas/sesame-models');

/*::
export type GETSelfUserResponse = {
  self: User,
};
*/
const toGETSelfUserResponse/*: Cast<GETSelfUserResponse>*/ = (value) => {
  const object = toObject(value);
  return {
    self: toUser(object.self),
  };
};
/*::
export type POSTAdminResponse = {
  admin: Admin,
};
*/
const toPOSTAdminResponse/*: Cast<POSTAdminResponse>*/ = (value) => {
  const object = toObject(value);
  return {
    admin: toAdmin(object.admin),
  };
};
/*::
export type GETUsersResponse = {
  users: User[],
};
*/
const toGETUsersResponse/*: Cast<GETUsersResponse>*/ = (value) => {
  const object = toObject(value);
  return {
    users: toArray(object.users).map(toUser)
  };
};

module.exports = {
  toGETSelfUserResponse,
  toPOSTAdminResponse,
  toGETUsersResponse,
};