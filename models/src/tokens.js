// @flow strict
/*:: import type { Cast, JSONValue } from '@lukekaalim/cast'; */
/*:: import type { UserID } from './user'; */
/*:: import type { AccessID} from './access'; */
const { toObject, toString, toNumber, toBoolean, toEnum, stringify, parse } = require('@lukekaalim/cast');
const { toUserId } = require('./user');
const { toBase64, fromBase64 } = require('./base64');
const { toAccessId } = require('./access');

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
const toAccessOfferProof/*: Cast<AccessOfferProof>*/ = (value) => {
  const object = toObject(value);
  return {
    subject: toUserId(object.subject),
    id: toAccessId(object.id),
    offerSecret: toString(object.offerSecret),
  };
};
const toAccessGrantProof/*: Cast<AccessGrantProof>*/ = (value) => {
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

const accessOfferProofEncoder/*: Encoder<AccessOfferProof>*/ = createJSONBase64Encoder(toAccessOfferProof);
const accessGrantProofEncoder/*: Encoder<AccessGrantProof>*/ = createJSONBase64Encoder(toAccessGrantProof);


module.exports = {
  toAccessOfferProof,
  toAccessGrantProof,
  accessOfferProofEncoder,
  accessGrantProofEncoder,
};
