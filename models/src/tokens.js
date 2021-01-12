// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { UserID } from './user'; */
const { toObject, toString, toNumber, toBoolean, toEnum } = require('@lukekaalim/cast');
const { toUserId } = require('./user');

/*::
export type AccessTokenID = string;
export type AccessToken = {
  id: AccessTokenID,
  secret: string,
  userId: UserID,
  status: 'valid' | 'revoked',
  device: null | string,
  host: null | string,
};
*/
const toAccessTokenId/*: Cast<AccessTokenID>*/ = toString;
const toAccessToken/*: Cast<AccessToken>*/ = (value) => {
  const object = toObject(value);
  return {
    id: toAccessTokenId(object.id),
    secret: toString(object.secret),
    userId: toUserId(object.userId),
    status: toEnum(object.status, ['valid', 'revoked']),
    device: object.device ? toString(object.device) : null,
    host: object.host ? toString(object.host) : null,
  };
};

/*::
export type LoginTokenID = string;
export type LoginToken = {
  id: LoginTokenID,
  secret: string,
  consumed: boolean,
  userId: UserID,
};
*/
const toLoginTokenId/*: Cast<LoginTokenID>*/ = toString;
const toLoginToken/*: Cast<LoginToken>*/ = (value) => {
  const object = toObject(value);
  return {
    id: toLoginTokenId(object.id),
    secret: toString(object.secret),
    consumed: toBoolean(object.consumed),
    userId: toString(object.device),
  };
};

module.exports = {
  toLoginTokenId,
  toLoginToken,
  toAccessTokenId,
  toAccessToken
};
