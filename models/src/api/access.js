// @flow strict
/*:: import type { POSTEndpoint, DELETEEndpoint, GETEndpoint } from '@lukekaalim/api-models'; */
/*:: import type { JSONValue } from '@lukekaalim/cast'; */
/*:: import type { User, UserID } from '../user'; */
/*:: import type { AccessOfferProof, AccessGrantProof } from '../tokens'; */
/*:: import type { Access, AccessOffer, AccessGrant, AccessRevocation, AccessID } from '../access'; */
import { toString, castObject, toArray } from '@lukekaalim/cast';
import { toAccess, toAccessId } from '../access.js';
import { toAccessOfferProof, toAccessGrantProof } from '../tokens.js';
import { toUserId, toUser } from '../user.js';

/*::
export type AtLeast<T> = { ...T, +[string]: JSONValue };
*/

export const POSTCreateAccessOffer/*: POSTEndpoint<
  AtLeast<{ subject: UserID }>,
  {| offerProof: AccessOfferProof |}, null
>*/ = {
  method: 'POST',
  path: '/user/access/offer',
  toQuery: () => null,
  toRequestBody: castObject(prop => ({
    subject: prop('subject', toUserId),
  })),
  toResponseBody: castObject(prop => ({
    offerProof: prop('offerProof', toAccessOfferProof),
  })),
};

export const POSTAcceptAccess/*: POSTEndpoint<
  {| deviceName: string, offerProof: AccessOfferProof |},
  {| grantProof: AccessGrantProof, user: User |}, null
>*/ = {
  method: 'POST',
  path: '/user/access/accept',
  toQuery: () => null,
  toRequestBody: castObject(prop => ({
    deviceName: prop('deviceName', toString),
    offerProof: prop('offerProof', toAccessOfferProof),
  })),
  toResponseBody: castObject(prop => ({
    grantProof: prop('grantProof', toAccessGrantProof),
    user: prop('user', toUser),
  })),
};

export const GETAccessList/*: GETEndpoint<
  {| access: Access[] |},
  {| subject: UserID |}
>*/ = {
  method: 'GET',
  path: '/user/access',
  toQuery: castObject(prop => ({
    subject: prop('subject', toUserId),
  })),
  toResponseBody: castObject(prop => ({
    access: prop('access', v => toArray(v).map(toAccess)),
  })),
};

export const POSTAccessRevoke/*: POSTEndpoint<{| subject: UserID, accessId: AccessID |}, null, null>*/ = {
  method: 'POST',
  path: '/user/access/revoke',
  toQuery: () => null,
  toResponseBody: () => null,
  toRequestBody: castObject(prop => ({
    subject: prop('subject',  toUserId),
    accessId: prop('accessId', toAccessId)
  })),
};
