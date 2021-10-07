// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { ResourceDescription } from '@lukekaalim/net-description'; */

/*:: import type { IdentityGrant, IdentityGrantID, LoginGrant, LinkGrant, LinkGrantID } from '../grant.js'; */
/*:: import type { IdentityProof, LinkProof } from '../proof.js'; */
/*:: import type { User, UserID } from '../user.js'; */
/*:: import type { APIResponse } from './meta.js'; */
import { createObjectCaster as obj, createArrayCaster as arr, createConstantCaster as lit, createKeyedUnionCaster as or, castString as str } from '@lukekaalim/cast';

import { castUserId } from '../user.js';
import { castIdentityGrant, castLoginGrant, castIdentityGrantId, castLinkGrant } from '../grant.js';
import { castIdentityProof } from '../proof.js';
import { createAPIResponseCaster as res } from './meta.js';
import { castLinkGrantId } from "../grant";
import { castLinkProof } from "../proof";

/*::

type GrantResource<ID, Grant, Arguments = {}> = {|
  POST: {
    query: empty,
    request: { userId: UserID, ...Arguments },
    response: APIResponse<{ type: 'created', grant: Grant, secret: string }>
  },
  DELETE: {
    query: { userId: UserID, grantId: ID },
    request: empty,
    response: APIResponse<{ type: 'revoked' }>
  }
|}
type GrantValidateResource<Proof, Grant> = {|
  POST: {
    query: empty,
    request: { proof: Proof },
    response: APIResponse<
      | {| type: 'valid', grant: Grant |}
      | {| type: 'invalid' |}
      >
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

  '/grants/identity':           GrantResource<IdentityGrantID, IdentityGrant, {| target: string, granteeName: string |}>,
  '/grants/identity/validate':  GrantValidateResource<IdentityProof, IdentityGrant>,

  '/grants/link':               GrantResource<LinkGrantID, LinkGrant, {| target: string |}>,
  '/grants/link/validate':      GrantValidateResource<LinkProof, LinkGrant>,
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
    toRequestBody: obj({ userId: castUserId, target: str, granteeName: str }),
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
    toRequestBody: obj({ userId: castUserId, target: str }),
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

export const grantsIdentityValidateResource/*: ResourceDescription<AccessAPI['/grants/identity/validate']>*/ = {
  path: '/grants/identity/validate',

  POST: {
    toRequestBody: obj({ proof: castIdentityProof }),
    toResponseBody: res(or('type', {
      'valid': obj({
        type: lit('valid'),
        grant: castIdentityGrant
      }),
      'invalid': obj({
        type: lit('invalid')
      }),
    }))
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
  '/grants/identity/validate': grantsIdentityValidateResource,
  '/grants/link/validate': grantsLinkValidateResource,
  '/grants': grantsLogin,
}