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
  | ConsumerState
  | UpdateLinkedIdentityGrant
  | CannotGrant
  | GrantRevoked

export type IdentityProviderReady = {
  type: 'sesame:identity-provider-ready',
};

export type ConsumerState = {
  type: 'sesame:consumer-state',
  proof: ?LinkProof,
}

export type PromptLinkGrant = {
  type: 'sesame:prompt-link-grant',
}

export type CannotGrant = {
  type: 'sesame:cannot-grant',
  code: 'not_logged_in' | 'origin_rejected'
}

export type GrantRevoked = {
  type: 'sesame:grant-revoked',
}

export type UpdateLinkedIdentityGrant = {
  type: 'sesame:update-link-grant',
  grant: LinkGrant,
  secret: string,
  token: string,
  proof: LinkProof,
};
*/

export const castConsumerState/*: Cast<ConsumerState>*/ = c.obj({
  type: c.lit('sesame:consumer-state'),
  proof: c.maybe(castLinkProof),
});

export const castCannotGrant/*: Cast<CannotGrant>*/ = c.obj({
  type: c.lit('sesame:cannot-grant'),
  code: c.enums(['not_logged_in', 'origin_rejected']),
})

export const castGrantRevoked/*: Cast<GrantRevoked>*/ = c.obj({
  type: c.lit('sesame:grant-revoked'),
})

export const castWWWMessage/*: Cast<WWWMessage>*/ = c.or('type', {
  'sesame:grant-revoked': castGrantRevoked,
  'sesame:cannot-grant': castCannotGrant,
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
  'sesame:consumer-state': castConsumerState
});
