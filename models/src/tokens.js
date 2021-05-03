// @flow strict
/*:: import type { Cast, JSONValue } from '@lukekaalim/cast'; */
/*:: import type { UserID } from './user'; */
/*:: import type { AccessID} from './access'; */
import { toObject, toString, toNumber, toBoolean, toEnum, stringify, parse } from '@lukekaalim/cast';
import { toUserId } from './user.js';
import { toBase64, fromBase64 } from './base64.js';
import { toAccessId } from './access.js';

/*::
export type AccessOfferProof = {|
  subject: UserID,
  id: AccessID,
  offerSecret: string,
|};
export type AccessGrantProof = {|
  subject: UserID,
  id: AccessID,
  grantSecret: string,
|};
*/
export const toAccessOfferProof/*: Cast<AccessOfferProof>*/ = (value) => {
  const object = toObject(value);
  return {
    subject: toUserId(object.subject),
    id: toAccessId(object.id),
    offerSecret: toString(object.offerSecret),
  };
};
export const toAccessGrantProof/*: Cast<AccessGrantProof>*/ = (value) => {
  const object = toObject(value);
  return {
    subject: toUserId(object.subject),
    id: toAccessId(object.id),
    grantSecret: toString(object.grantSecret),
  };
};


/*::
export type Encoder<T> = {
  encode: T => string,
  decode: string => T,
};
*/
export const createJSONBase64Encoder = /*:: <T: JSONValue>*/(toDecoded/*: Cast<T>*/)/*: Encoder<T>*/ => {
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

export const accessOfferProofEncoder/*: Encoder<AccessOfferProof>*/ = createJSONBase64Encoder(toAccessOfferProof);
export const accessGrantProofEncoder/*: Encoder<AccessGrantProof>*/ = createJSONBase64Encoder(toAccessGrantProof);

