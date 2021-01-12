// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { UserID } from './user'; */
const { toObject, toString, toNumber, toBoolean, toEnum } = require('@lukekaalim/cast');
const { toUserId } = require('./user');

/*::
export type PermanentAccessTokenID = string;
export type PermanentAccessToken = {
  id: string,
  secret: string,
  userId: UserID,
  status: 'valid' | 'revoked',
  device: null | string,
  host: null | string,
};
*/
const toPermanentAccessTokenId/*: Cast<PermanentAccessTokenID>*/ = toString;
const toPermanentAccessToken/*: Cast<PermanentAccessToken>*/ = (value) => {
  const object = toObject(value);
  return {
    id: toPermanentAccessTokenId(object.id),
    secret: toString(object.secret),
    userId: toUserId(object.userId),
    status: toEnum(object.status, ['valid', 'revoked']),
    device: object.device ? toString(object.device) : null,
    host: object.host ? toString(object.host) : null,
  };
};

/*::
export type OneTimeAccessTokenID = string;
export type OneTimeAccessToken = {
  id: string,
  secret: string,
  consumed: boolean,
  userId: UserID,
};
*/
const toOneTimeAccessTokenId/*: Cast<OneTimeAccessTokenID>*/ = toString;
const toOneTimeAccessToken/*: Cast<OneTimeAccessToken>*/ = (value) => {
  const object = toObject(value);
  return {
    id: toOneTimeAccessTokenId(object.id),
    secret: toString(object.secret),
    consumed: toBoolean(object.consumed),
    userId: toString(object.device),
  };
};

module.exports = {
  toPermanentAccessTokenId,
  toPermanentAccessToken,
  toOneTimeAccessTokenId,
  toOneTimeAccessToken
};
