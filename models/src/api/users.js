// @flow strict
/*:: import type { User, Admin, UserID } from '../user.js'; */
/*:: import type { ResourceDescription } from "@lukekaalim/net-description"; */
import { castUserId, castUser } from '../user.js';
import { createObjectCaster as obj, castString as str, createConstantCaster as lit, createArrayCaster as arr } from '@lukekaalim/cast';

/*::
export type UsersAPI = {
  '/users': {|
    GET: {
      query: { userId: UserID },
      request: empty,
      response: { type: 'found', user: User },
    },
    POST: {
      query: empty,
      request: { name: string },
      response: { type: 'created', user: User },
    },
    PATCH: {
      query: { userId: UserID },
      request: { name: string },
      response: { type: 'updated', user: User },
    },
    DELETE: {
      query: { userId: UserID },
      request: empty,
      response: { type: 'deleted' },
    }
  |},
  '/users/all': {
    GET: {
      query: empty,
      request: empty,
      response: { type: 'found', users: $ReadOnlyArray<User> },
    },
  },
  '/users/self': {
    GET: {
      query: empty,
      request: empty,
      response: { type: 'found', user: User },
    },
  }
};
*/

export const usersResourceDescription/*: ResourceDescription<UsersAPI['/users']>*/ = {
  path: '/users',

  GET: {
    toQuery: obj({ userId: castUserId }),
    toResponseBody: obj({ type: lit('found'), user: castUser }),
  },
  POST: {
    toRequestBody: obj({ name: str }),
    toResponseBody: obj({ type: lit('created'), user: castUser }),
  },
  PATCH: {
    toQuery: obj({ userId: castUserId }),
    toRequestBody: obj({ name: str }),
    toResponseBody: obj({ type: lit('updated'), user: castUser }),
  },
  DELETE: {
    toQuery: obj({ userId: castUserId }),
    toResponseBody: obj({ type: lit('deleted') }),
  }
};

export const usersAllResourceDescription/*: ResourceDescription<UsersAPI['/users/all']> */ = {
  path: '/users/all',

  GET: {
    toResponseBody: obj({ type: lit('found'), users: arr(castUser) })
  }
};

export const usersSelfResourceDescription/*: ResourceDescription<UsersAPI['/users/self']> */ = {
  path: '/users/self',

  GET: {
    toResponseBody: obj({ type: lit('found'), user: castUser })
  }
};