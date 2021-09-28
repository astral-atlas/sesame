// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { ResourceDescription } from '@lukekaalim/net-description'; */

/*:: import type { GrantTarget, IdentityProof, IdentityGrant, IdentityGrantID, LoginGrant } from '../access.js'; */
/*:: import type { User, UserID } from '../user.js'; */
/*:: import type { APIResponse } from './meta.js'; */
import { createObjectCaster as obj, createArrayCaster as arr, createConstantCaster as lit, createKeyedUnionCaster as or, castString as str } from '@lukekaalim/cast';
import { castUserId } from '../user.js';
import { castIdentityGrant, castLoginGrant, castIdentityGrantId, castIdentityProof } from '../access.js';
import { createAPIResponseCaster as res } from './meta.js';

/*::
export type AccessAPI = {
  '/grants': {|
    GET: {
      query: { userId: UserID },
      request: empty,
      response: APIResponse<{ type: 'found', identity: $ReadOnlyArray<IdentityGrant>, login: $ReadOnlyArray<LoginGrant> }>
    },
  |},
  '/grants/identity': {|
    POST: {
      query: empty,
      request: { userId: UserID, service: string, granteeName: string },
      response: APIResponse<{ type: 'created', grant: IdentityGrant, secret: string }>
    },
    DELETE: {
      query: { userId: UserID, grantId: IdentityGrantID },
      request: empty,
      response: APIResponse<{ type: 'deleted' }>
    }
  |},
  '/grants/identity/validate': {|
    POST: {
      query: empty,
      request: { proof: IdentityProof },
      response: APIResponse<
        | { type: 'valid', grant: IdentityGrant }
        | {| type: 'invalid' |}
        >
    }
  |},
  '/grants/login': {|
    POST: {
      query: empty,
      request: { userId: UserID },
      response: { grant: LoginGrant, secret: string }
    }
  |},
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
    })),
  }
};

export const grantsIdentityResource/*: ResourceDescription<AccessAPI['/grants/identity']>*/ = {
  path: '/grants/identity',

  POST: {
    toRequestBody: obj({ userId: castUserId, service: str, granteeName: str }),
    toResponseBody: res(obj({
      type: lit('created'),
      grant: castIdentityGrant,
      secret: str,
    })),
  },
  DELETE: {
    toQuery: obj({ userId: castUserId, grantId: castIdentityGrantId }),
    toResponseBody: res(obj({
      type: lit('deleted')
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

export const grantsLogin/*: ResourceDescription<AccessAPI['/grants/login']>*/ = {
  path: '/grants/login',

  POST: {
    toRequestBody: obj({ userId: castUserId }),
    toResponseBody: obj({ type: lit('created'), grant: castLoginGrant, secret: str })
  }
};