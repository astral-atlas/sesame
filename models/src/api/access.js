// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { ResourceDescription } from '@lukekaalim/net-description'; */

/*:: import type { IdentityGrant, IdentityGrantID, LoginGrant, LinkGrant, LinkGrantID } from '../grant.js'; */
/*:: import type { IdentityProof, LinkProof } from '../proof.js'; */
/*:: import type { User, UserID } from '../user.js'; */
/*:: import type { APIResponse } from './meta.js'; */
import { createObjectCaster as obj, createArrayCaster as arr, createConstantCaster as lit, createKeyedUnionCaster as or, castString as str } from '@lukekaalim/cast';

import { castUserId } from '../user.js';
import { castIdentityGrant, castLoginGrant, castIdentityGrantId, castLinkGrant, castLinkGrantId } from '../grant.js';
import { castLinkProof } from '../proof.js';
import { createAPIResponseCaster as res } from './meta.js';

/*::

type GrantResource<ID, Grant, Arguments = {}> = {|
  POST: {
    query: empty,
    request: Arguments,
    response: APIResponse<{ type: 'created', grant: Grant, secret: string }>
  },
  DELETE: {
    query: { userId: UserID, grantId: ID },
    request: empty,
    response: APIResponse<{ type: 'revoked' }>
  }
|}

export type AccessAPI = {
  '/grants': {|
    GET: {
      query: { userId: UserID },
      request: empty,
      response: APIResponse<{
        type: 'found',
        identity: $ReadOnlyArray<IdentityGrant>,
        login: $ReadOnlyArray<LoginGrant>,
        links: $ReadOnlyArray<LinkGrant>
      }>
    },
  |},
  '/grants/login': {|
    POST: {
      query: empty,
      request: { userId: UserID },
      response: { grant: LoginGrant, secret: string }
    }
  |},

  '/grants/identity': GrantResource<IdentityGrantID, IdentityGrant, {| userId: UserID, granteeName: string |}>,

  '/grants/link': GrantResource<LinkGrantID, LinkGrant, {| target: string |}>,
  '/grants/link/validate': {|
    POST: {
      query: empty,
      request: { proof: LinkProof },
      response: APIResponse<
        | {| type: 'valid', grant: LinkGrant |}
        | {| type: 'invalid' |}
        >
    }
  |}
};
*/

export const grantsResource/*: ResourceDescription<AccessAPI['/grants']>*/ = {
  path: '/grants',

  GET: {
    toQuery: obj({ userId: castUserId }),
    toResponseBody: res(obj({
      type: lit('found'),
      identity: arr(castIdentityGrant),
      login: arr(castLoginGrant),
      links: arr(castLinkGrant)
    })),
  }
};

export const grantsIdentityResource/*: ResourceDescription<AccessAPI['/grants/identity']>*/ = {
  path: '/grants/identity',

  POST: {
    toRequestBody: obj({ userId: castUserId, granteeName: str }),
    toResponseBody: res(obj({
      type: lit('created'),
      grant: castIdentityGrant,
      secret: str,
    })),
  },
  DELETE: {
    toQuery: obj({ userId: castUserId, grantId: castIdentityGrantId }),
    toResponseBody: res(obj({
      type: lit('revoked')
    })),
  }
};
export const grantsLinkResource/*: ResourceDescription<AccessAPI['/grants/link']>*/ = {
  path: '/grants/link',

  POST: {
    toRequestBody: obj({ target: str }),
    toResponseBody: res(obj({
      type: lit('created'),
      grant: castLinkGrant,
      secret: str,
    })),
  },
  DELETE: {
    toQuery: obj({ userId: castUserId, grantId: castLinkGrantId }),
    toResponseBody: res(obj({
      type: lit('revoked')
    })),
  }
};

export const grantsLinkValidateResource/*: ResourceDescription<AccessAPI['/grants/link/validate']>*/ = {
  path: '/grants/link/validate',

  POST: {
    toRequestBody: obj({ proof: castLinkProof }),
    toResponseBody: res(or('type', {
      'valid': obj({
        type: lit('valid'),
        grant: castLinkGrant
      }),
      'invalid': obj({
        type: lit('invalid')
      }),
    }))
  }
};

export const grantsLogin/*: ResourceDescription<AccessAPI['/grants/login']>*/ = {
  path: '/grants/login',

  POST: {
    toRequestBody: obj({ userId: castUserId }),
    toResponseBody: obj({ type: lit('created'), grant: castLoginGrant, secret: str })
  }
};

export const accessAPI = {
  '/grants': grantsResource,
  '/grants/identity': grantsIdentityResource,
  '/grants/link': grantsLinkResource,
  '/grants/link/validate': grantsLinkValidateResource,
  '/grants/login': grantsLogin,
}