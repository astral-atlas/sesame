// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { GETEndpoint, POSTEndpoint, PUTEndpoint, DELETEEndpoint } from '@lukekaalim/api-models'; */
/*:: import type { User, UserID, Admin } from '../user'; */
const { toObject, toString, toArray, toNullable } = require('@lukekaalim/cast');
const { toUser, toUserId, toAdmin } = require('../user');

const GETSelf/*: GETEndpoint<{| self: User, admin: Admin | null |}, null>*/ = {
  method: 'GET',
  path: '/self',
  toQuery: () => null,
  toResponseBody: (value) => {
    const object = toObject(value);
    return {
      self: toUser(object.self),
      admin: toNullable(object.admin, toAdmin),
    };
  }, 
};
const POSTUser/*: POSTEndpoint<{| name: string |}, {| newUserId: UserID |}, null>*/ = {
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
const GETUsers/*: GETEndpoint<{| users: User[] |}, null>*/ = {
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
  GETUsers,
  POSTUser,
};