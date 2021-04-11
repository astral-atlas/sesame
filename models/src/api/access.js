// @flow strict
/*:: import type { POSTEndpoint, DELETEEndpoint, GETEndpoint } from '@lukekaalim/api-models'; */
/*:: import type { User, UserID } from '../user'; */
/*:: import type { AccessOfferProof, AccessGrantProof } from '../tokens'; */
/*:: import type { Access, AccessOffer, AccessGrant, AccessRevocation } from '../access'; */
const { toString, castObject, toArray } = require('@lukekaalim/cast');
const { toAccessOffer, toAccessGrant, toAccessRevocation, toAccess } = require('../access');
const { toAccessOfferProof, toAccessGrantProof } = require('../tokens');
const { toUserId, toUser } = require('../user');

const POSTCreateAccessOffer/*: POSTEndpoint<
  {| subject: UserID |},
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

const POSTAcceptAccess/*: POSTEndpoint<
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

const GETAccessList/*: GETEndpoint<
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

const POSTAccessRevoke/*: POSTEndpoint<{| subject: UserID |}, null, null>*/ = {
  method: 'POST',
  path: '/user/access/revoke',
  toQuery: () => null,
  toResponseBody: () => null,
  toRequestBody: castObject(prop => ({
    subject: prop('subject',  toUserId),
  })),
};

module.exports = {
  POSTCreateAccessOffer,
  POSTAcceptAccess,
  GETAccessList,
  POSTAccessRevoke,
};
