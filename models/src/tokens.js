// @flow strict
/*:: import type { Cast, JSONValue } from '@lukekaalim/cast'; */
/*:: import type { UserID } from './user'; */
/*:: import type { AccessGrantID, LoginGrantID } from './grants'; */
const { toObject, toString, toNumber, toBoolean, toEnum, stringify, parse } = require('@lukekaalim/cast');
const { toUserId } = require('./user');
const { toBase64, fromBase64 } = require('./base64');
const { toAccessGrantId, toLoginGrantId } = require('./grants');

/*::
export type AccessTokenID = string;
export type AccessToken = {|
  accessGrantId: AccessGrantID,
  secret: string,
|};

export type LoginTokenID = string;
export type LoginToken = {|
  loginGrantId: LoginGrantID,
  secret: string,
|};
*/
const toAccessTokenId/*: Cast<AccessTokenID>*/ = toString;
const toAccessToken/*: Cast<AccessToken>*/ = (value) => {
  const object = toObject(value);
  return {
    accessGrantId: toAccessGrantId(object.accessGrantId),
    secret: toString(object.secret),
  };
};
const toLoginTokenId/*: Cast<LoginTokenID>*/ = toString;
const toLoginToken/*: Cast<LoginToken>*/ = (value) => {
  const object = toObject(value);
  return {
    loginGrantId: toLoginGrantId(object.loginGrantId),
    secret: toString(object.secret),
  };
}


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
