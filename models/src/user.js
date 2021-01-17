// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
const { toObject, toString } = require('@lukekaalim/cast');

/*::
export type UserID = string;
export type User = {|
  id: UserID,
  name: string,
  adminId: null | AdminID,
  creatorAdminId: null | AdminID,
|};
*/
const toUserId/*: Cast<UserID>*/ = toString;
const toUser/*: Cast<User>*/ = (value) => {
  const object = toObject(value);
  return {
    id: toUserId(object.id),
    name: toString(object.name),
    adminId: object.adminId ? toAdminId(object.adminId) : null,
    creatorAdminId: object.creatorAdminId ? toAdminId(object.creatorAdminId) : null,
  }
};

/*::
export type AdminID = string;
export type Admin = {|
  id: AdminID,
  userId: UserID,
|};
*/
const toAdminId/*: Cast<AdminID>*/ = toString;
const toAdmin/*: Cast<Admin>*/ = (value) => {
  const object = toObject(value);
  return {
    id: toAdminId(object.id),
    userId: toUserId(object.userId),
  };
};

module.exports = {
  toUserId,
  toUser,
  toAdminId,
  toAdmin,
};