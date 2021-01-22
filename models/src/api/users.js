// @flow strict
/*:: import type { RESTResource } from '@lukekaalim/api-models'; */
/*:: import type { User, UserID } from '../user'; */
/*:: import type { OffsetPaginationFilterQuery } from './pagination'; */
const { createRESTResource } = require('@lukekaalim/api-models');
const { toObject, toString } = require('@lukekaalim/cast');
const { toUser, toUserId } = require('../user');
const { toOffsetPaginationFilter } = require('./pagination');

/*::
export type UserCreateArgs = {|
  name: string,
|};
export type UserModifyArgs = {|
  name: null | string,
|};
export type UserIDQuery = {|
  userId: UserID,
|};
*/
const toUserCreateArgs = (value) => {
  const object = toObject(value);
  return {
    name: toString(object.name),
  }
};
const toUserModifyArgs = (value) => {
  const object = toObject(value);
  return {
    name: object.name ? toString(object.name) : null,
  }
};
const toUserIdQuery = (value) => {
  const object = toObject(value);
  return {
    userId: toUserId(object.userId)
  };
};

/*:: export type UsersResource = RESTResource<
  User,
  UserCreateArgs, 
  UserModifyArgs,
  UserIDQuery,
  OffsetPaginationFilterQuery
>*/
const users/*: UsersResource*/ = createRESTResource(
  '/users',
  toUser, 
  toUserCreateArgs, toUserModifyArgs,
  toUserIdQuery,
);

module.exports = {
  users,
};