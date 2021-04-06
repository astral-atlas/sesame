// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { GETEndpoint, POSTEndpoint, PUTEndpoint, DELETEEndpoint } from '@lukekaalim/api-models'; */
/*:: import type { User, UserID, Admin } from '../user'; */
/*:: import type { AccessGrant } from '../access'; */
const { toObject, toString, toArray, toNullable } = require('@lukekaalim/cast');
const { toUser, toUserId, toAdmin } = require('../user');
const { toAccessGrant } = require('../access');

const GETSelf/*: GETEndpoint<{| self: User, admin: Admin | null, access: null | AccessGrant |}, null>*/ = {
  method: 'GET',
  path: '/users/self',
  toQuery: () => null,
  toResponseBody: (value) => {
    const object = toObject(value);
    return {
      self: toUser(object.self),
      admin: toNullable(object.admin, toAdmin),
      access: toNullable(object.access, toAccessGrant),
    };
  }, 
};
const POSTNewUser/*: POSTEndpoint<{| name: string |}, {| newUserId: UserID |}, null>*/ = {
  method: 'POST',
  path: '/users',
  toQuery: () => null,
  toRequestBody: (value) => {
    const object = toObject(value);
    return {
      name: toString(object.name),
    };
  },
  toResponseBody: (value) => {
    const object = toObject(value);
    return {
      newUserId: toUserId(object.newUserId),
    };
  },
};
const GETUserById/*: GETEndpoint<{| user: User |}, {| userId: UserID |}>*/ = {
  method: 'GET',
  path: '/users/byId',
  toQuery: (value) => {
    const object = toObject(value);
    return {
      userId: toUserId(object.userId),
    };
  },
  toResponseBody: (value) => {
    const object = toObject(value);
    return {
      user: toUser(object.user),
    };
  }
};
const GETUserList/*: GETEndpoint<{| users: User[] |}, null>*/ = {
  method: 'GET',
  path: '/users',
  toQuery: () => null,
  toResponseBody: (value) => {
    const object = toObject(value);
    return {
      users: toArray(object.users).map(toUser),
    };
  }
};

module.exports = {
  GETSelf,
  GETUserList,
  GETUserById,
  POSTNewUser,
};