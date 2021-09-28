// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
import { createObjectCaster, createNullableCaster, castString } from '@lukekaalim/cast';

/*::
export type UserID = string;
export type User = {|
  id: UserID,
  name: string,
  adminId: ?AdminID,
  creatorAdminId: ?AdminID,
|};
*/
/*::
export type AdminID = string;
export type Admin = {|
  id: AdminID,
  userId: UserID,
|};
*/

export const castUserId/*: Cast<UserID>*/ = castString;
export const castAdminId/*: Cast<AdminID>*/ = castString;

export const castUser/*: Cast<User>*/ = createObjectCaster({
  id: castUserId,
  name: castString,
  adminId: createNullableCaster(castAdminId),
  creatorAdminId: createNullableCaster(castAdminId),
});
export const castAdmin/*: Cast<Admin>*/ = createObjectCaster({
  id: castAdminId,
  userId: castUserId,
});
