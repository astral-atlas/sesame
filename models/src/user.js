// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
import { toObject, toString } from '@lukekaalim/cast';

/*::
export type UserID = string;
export type User = {|
  id: UserID,
  name: string,
  adminId: null | AdminID,
  creatorAdminId: null | AdminID,
|};
*/
export const toUserId/*: Cast<UserID>*/ = toString;
export const toUser/*: Cast<User>*/ = (value) => {
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
export const toAdminId/*: Cast<AdminID>*/ = toString;
export const toAdmin/*: Cast<Admin>*/ = (value) => {
  const object = toObject(value);
  return {
    id: toAdminId(object.id),
    userId: toUserId(object.userId),
  };
};