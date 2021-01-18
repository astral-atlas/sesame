// @flow strict
/*:: import type { Cast, JSONValue } from '@lukekaalim/cast'; */
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
/*::
export type Encoder<T> = {
  encode: T => string,
  decode: string => T,
};
*/
const createJSONBase64Encoder = /*:: <T: JSONValue>*/(toDecoded/*: Cast<T>*/)/*: Encoder<T>*/ => {
  const encode = (value) => {
    return toBase64(stringify(value));
  };
  const decode = (value) => {
    return toDecoded(parse(fromBase64(value)));
  };
  return {
    encode,
    decode,
  };
};

const accessTokenEncoder/*: Encoder<AccessToken>*/ = createJSONBase64Encoder(toAccessToken);
const loginTokenEncoder/*: Encoder<LoginToken>*/ = createJSONBase64Encoder(toLoginToken);


module.exports = {
  toLoginTokenId,
  toLoginToken,
  toAccessTokenId,
  toAccessToken,

  accessTokenEncoder,
  loginTokenEncoder,
};
