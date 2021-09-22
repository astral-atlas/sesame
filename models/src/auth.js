// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { AccessGrantProof } from './tokens.js'; */
import { toObject, toString } from '@lukekaalim/cast';
import { toAccessGrantProof } from './tokens.js';

/*::
export type Authorization =
  | {| type: 'grant', proof: AccessGrantProof |}
  | {| type: 'super', user: string, pass: string |}
  | {| type: 'none' |}
*/
export const toAuthorization/*: Cast<Authorization>*/ = (value) => {
  const object = toObject(value);
  switch (toString(object.type)) {
    case 'none':
      return { type: 'none' };
    case 'grant':
      return { type: 'grant', proof: toAccessGrantProof(object.accessGrantProof) };
    case 'super':
      return { type: 'super', user: toString(object.username), pass: toString(object.password) };
    default:
      throw new TypeError('Unknown authentication strategy');
  }
};