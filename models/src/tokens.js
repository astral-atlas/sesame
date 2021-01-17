// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { UserID } from './user'; */
const { toObject, toString, toNumber, toBoolean, toEnum, stringify, parse } = require('@lukekaalim/cast');
const { toUserId } = require('./user');
const { toBase64, fromBase64 } = require('./base64');

/*::
export type AccessTokenID = string;
export type AccessToken = {|
  id: AccessTokenID,
  secret: string,
  userId: UserID,
  status: 'valid' | 'revoked',
  host: null | string,
|};
*/
const toAccessTokenId/*: Cast<AccessTokenID>*/ = toString;
const toAccessToken/*: Cast<AccessToken>*/ = (value) => {
  const object = toObject(value);
  return {
    id: toAccessTokenId(object.id),
    secret: toString(object.secret),
    userId: toUserId(object.userId),
    status: toEnum(object.status, ['valid', 'revoked']),
    host: object.host ? toString(object.host) : null,
  };
};

/*::
export type LoginTokenID = string;
export type LoginToken = {|
  id: LoginTokenID,
  secret: string,
  accessTokenId: null | AccessTokenID,
  userId: UserID,
|};
*/
const toLoginTokenId/*: Cast<LoginTokenID>*/ = toString;
const toLoginToken/*: Cast<LoginToken>*/ = (value) => {
  const object = toObject(value);
  return {
    id: toLoginTokenId(object.id),
    secret: toString(object.secret),
    accessTokenId: object.accessTokenId ? toAccessTokenId(object.accessTokenId) : null,
    userId: toString(object.device),
  };
};
const encodeAccessToken = (accessToken/*: AccessToken*/)/*: string*/ => {
  return toBase64(stringify(accessToken));
}
const decodeAccessToken = (encodedAccessToken/*: string*/)/*: AccessToken*/ => {
  return toAccessToken(parse(fromBase64(encodedAccessToken)));
}

module.exports = {
  toLoginTokenId,
  toLoginToken,
  toAccessTokenId,
  toAccessToken,

  encodeAccessToken,
  decodeAccessToken,
};
