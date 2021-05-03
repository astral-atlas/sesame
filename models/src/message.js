// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { AccessOfferProof } from './tokens'; */

import { castObject, toConstant, toNullable, toObject, toString } from "@lukekaalim/cast";
import { toAccessOfferProof } from "./tokens";

/*::
export type WWWMessage =
  | InitWWWMessage
  | OfferWWWMessage

export type InitWWWMessage = {|
  type: 'sesame-www-init'
|};
export type OfferWWWMessage = {|
  type: 'sesame-www-offer',
  offer: AccessOfferProof,
  deviceName: null | string,
|};
*/

export const toInitWWWMessage/*: Cast<InitWWWMessage>*/ = castObject(p => ({
  type: p('type', v => toConstant(v, 'sesame-www-init')),
}))
export const toOfferWWWMessage/*: Cast<OfferWWWMessage>*/ = castObject(p => ({
  type: p('type', v => toConstant(v, 'sesame-www-offer')),
  offer: p('offer', toAccessOfferProof),
  deviceName: p('deviceName', v => toNullable(v, toString)),
}))

export const toWWWMessage/*: Cast<WWWMessage>*/ = (value) => {
  const object = toObject(value);
  switch (object.type) {
    case 'sesame-www-init':
      return toInitWWWMessage(object);
    case 'sesame-www-offer':
      return toOfferWWWMessage(object);
    default:
      throw new TypeError();
  }
}
