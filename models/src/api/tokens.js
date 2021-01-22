// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { RESTResource } from '@lukekaalim/api-models'; */
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { LoginToken, AccessToken, LoginTokenID, AccessTokenID } from '../tokens'; */
/*:: import type { OffsetPaginationFilterQuery } from './pagination'; */
const { createRESTResource, toNull } = require("@lukekaalim/api-models");
const { toObject, toString, toArray, toNumber, toConstant, toEnum } = require("@lukekaalim/cast");
const { toLoginToken, toAccessToken, toLoginTokenId, toAccessTokenId } = require("../tokens");
const { toUserId } = require("../user");
const { toOffsetPaginationFilter } = require('./pagination');

/*::
export type PaginatedUserIDFilter = {|
  ...OffsetPaginationFilterQuery,
  userId: null | UserID,
|};
*/
const toPaginatedUserIdFilter/*: Cast<PaginatedUserIDFilter>*/ = (value) => {
  const object = toObject(value);
  return {
    ...toOffsetPaginationFilter(object),
    userId: object.userId ? toUserId(object.userId) : null,
  };
};

/*::
export type LoginTokenIDQuery = {|
  loginTokenId: LoginTokenID,
|};
export type LoginTokenCreateArgs = {|
  userId: UserID,
|};
export type LoginTokenModifyArgs = {|
  status: null | 'revoked'
|};
*/
const toLoginTokenIdQuery/*: Cast<LoginTokenIDQuery>*/ = (value) => {
  const object = toObject(value);
  return {
    loginTokenId: toLoginTokenId(object.loginTokenId),
  };
};
const toLoginTokenCreateArgs/*: Cast<LoginTokenCreateArgs>*/ = (value) => {
  const object = toObject(value);
  return {
    userId: toUserId(object.userId),
  };
};
const toLoginTokenModifyArgs/*: Cast<LoginTokenModifyArgs>*/ = (value) => {
  const object = toObject(value);
  return {
    status: object.userId ? toEnum(object.userId, ['revoked']) : null,
  };
};

/*:: export type LoginTokenResource = RESTResource<
  LoginToken,
  LoginTokenCreateArgs,
  LoginTokenModifyArgs,
  LoginTokenIDQuery,
  PaginatedUserIDFilter
>;*/

const tokenLogin/*: LoginTokenResource*/ = createRESTResource(
  '/tokens/login',
  toLoginToken,
  toLoginTokenCreateArgs, toLoginTokenModifyArgs,
  toLoginTokenIdQuery, toPaginatedUserIdFilter
);

/*::
export type AccessTokenIDQuery = {|
  accessTokenId: AccessTokenID,
|};
export type AccessTokenCreateArgs = {|
  userId: UserID,
  host: null | string,
  deviceName: null | string
|};
export type AccessTokenModifyArgs = {|
  host: null | string,
  deviceName: null | string
|};
export type AccessTokenFilter = {|
  ...OffsetPaginationFilterQuery,
  userId: null | UserID,
|};
*/

const toAccessTokenIdQuery/*: Cast<AccessTokenIDQuery>*/ = (value) => {
  const object = toObject(value);
  return {
    accessTokenId: toAccessTokenId(object.accessTokenId),
  };
};
const toAccessTokenCreateArgs/*: Cast<AccessTokenCreateArgs>*/ = (value) => {
  const object = toObject(value);
  return {
    userId: toUserId(object.userId),
    host: object.host ? toString(object.host) : null,
    deviceName: object.deviceName ? toString(object.deviceName) : null,
  };
};
const toAccessTokenModifyArgs/*: Cast<AccessTokenModifyArgs>*/ = (value) => {
  const object = toObject(value);
  return {
    host: object.host ? toString(object.host) : null,
    deviceName: object.deviceName ? toString(object.deviceName) : null,
  };
};

/*:: export type AccessTokenResource = RESTResource<
  AccessToken,
  AccessTokenCreateArgs,
  AccessTokenModifyArgs,
  AccessTokenIDQuery,
  PaginatedUserIDFilter
>;*/

const tokenAccess/*: AccessTokenResource*/ = createRESTResource(
  '/tokens/access',
  toAccessToken,
  toAccessTokenCreateArgs, toAccessTokenModifyArgs,
  toAccessTokenIdQuery, toPaginatedUserIdFilter
);

module.exports = {
  tokenAccess,
  tokenLogin,
};