// @flow strict
/*:: import type { POSTEndpoint, DELETEEndpoint, GETEndpoint } from '@lukekaalim/api-models'; */
/*:: import type { UserID } from '../user'; */
/*:: import type { AccessOfferProof, AccessGrantProof } from '../tokens'; */
/*:: import type { AccessOffer, AccessGrant, AccessRevocation } from '../access'; */
const { toString, castObject, toArray } = require('@lukekaalim/cast');
const { toAccessOffer, toAccessGrant, toAccessRevocation } = require('../access');
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
  {| grantProof: AccessGrantProof |}, null
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
  })),
};

const GETAccessList/*: GETEndpoint<
  {| offers: AccessOffer[], grants: AccessGrant[], revocations: AccessRevocation[] |},
  {| userId: UserID |}
>*/ = {
  method: 'GET',
  path: '/user/access',
  toQuery: castObject(prop => ({
    userId: prop('userId', toUserId),
  })),
  toResponseBody: castObject(prop => ({
    offers: prop('offers', toArray).map(toAccessOffer),
    grants: prop('grants', toArray).map(toAccessGrant),
    revocations: prop('revocations', toArray).map(toAccessRevocation),
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
