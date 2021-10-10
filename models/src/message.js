// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { LinkGrant } from './grant'; */
/*:: import type { LinkProof } from './proof'; */

import { c } from "@lukekaalim/cast";
import { castLinkGrant } from "./grant.js";
import { castLinkProof } from "./proof.js";

/*::
export type WWWMessage =
  | IdentityProviderReady
  | PromptLinkGrant
  | UpdateLinkedIdentityGrant

export type IdentityProviderReady = {
  type: 'sesame:identity-provider-ready',
};

export type PromptLinkGrant = {
  type: 'sesame:prompt-link-grant',
}

export type UpdateLinkedIdentityGrant = {
  type: 'sesame:update-link-grant',
  grant: LinkGrant,
  secret: string,
  token: string,
  proof: LinkProof,
};
*/

export const castWWWMessage/*: Cast<WWWMessage>*/ = c.or('type', {
  'sesame:update-link-grant': c.obj({
    type: (c.lit('sesame:update-link-grant')/*: Cast<UpdateLinkedIdentityGrant['type']>*/),
    grant: castLinkGrant,
    secret: c.str,
    token: c.str,
    proof: castLinkProof
  }),
  'sesame:prompt-link-grant': c.obj({
    type: (c.lit('sesame:prompt-link-grant')/*: Cast<PromptLinkGrant['type']>*/),
  }),
  'sesame:identity-provider-ready': c.obj({
    type: (c.lit('sesame:identity-provider-ready')/*: Cast<IdentityProviderReady['type']>*/),
  }),
});
