// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { IdentityGrant, LinkGrant } from './grant'; */

import { createKeyedUnionCaster, createObjectCaster, createConstantCaster, castString } from "@lukekaalim/cast";
import { castIdentityGrant, castLinkGrant } from "./grant.js";

/*::
export type WWWMessage =
  | IdentityProviderReady
  | PromptLinkGrant
  | UpdateLinkedIdentityGrant

export type IdentityProviderReady = {|
  type: 'sesame:identity-provider-ready',
|};

export type PromptLinkGrant = {|
  type: 'sesame:prompt-link-grant',
|}

export type UpdateLinkedIdentityGrant = {|
  type: 'sesame:update-link-grant',
  grant: LinkGrant,
  secret: string,
|};
*/

export const castWWWMessage/*: Cast<WWWMessage>*/ = createKeyedUnionCaster('type', {
  'sesame:udpate-linked-identity-grant': createObjectCaster({
    type: createConstantCaster('sesame:update-link-grant'),
    grant: castLinkGrant,
    secret: castString,
  }),
  'sesame:prompt-link-grant': createObjectCaster({
    type: createConstantCaster('sesame:prompt-link-grant'),
  }),
  'sesame:identity-provider-ready': createObjectCaster({
    type: createConstantCaster('sesame:identity-provider-ready'),
  }),
});
