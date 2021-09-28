// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { IdentityGrant } from './access'; */

import { createKeyedUnionCaster, createObjectCaster, createConstantCaster, castString } from "@lukekaalim/cast";
import { castIdentityGrant } from "./access.js";

/*::
export type WWWMessage =
  | NewIdentityGrant

export type NewIdentityGrant = {|
  type: 'sesame:new-identity-grant',
  grant: IdentityGrant,
  secret: string,
|};
*/

export const castWWWMessage/*: Cast<WWWMessage>*/ = createKeyedUnionCaster('type', {
  'sesame:new-identity-grant': createObjectCaster({
    type: createConstantCaster('sesame:new-identity-grant'),
    grant: castIdentityGrant,
    secret: castString,
  })
});
