// @flow strict
/*:: import type { POSTEndpoint } from '@lukekaalim/api-models'; */
/*:: import type { AccessToken, LoginToken } from '../tokens'; */
/*:: import type { UserID } from '../user'; */
const { toObject, toString } = require('@lukekaalim/cast');

const { toLoginToken, toAccessToken } = require("../tokens");
const { toUserId } = require('../user');

const POSTAccessGrant/*: POSTEndpoint<{| loginToken: LoginToken, deviceName: string |}, {| accessToken: AccessToken |}, null>*/ = {
  method: 'POST',
  path: '/grants/access',
  toQuery: () => null,
  toRequestBody: (value) => {
    const object = toObject(value);
    return {
      loginToken: toLoginToken(object.loginToken),
      deviceName: toString(object.deviceName),
    }
  },
  toResponseBody: (value) => {
    const object = toObject(value);
    return {
      accessToken: toAccessToken(object.accessToken),
    }
  },
};

const POSTLoginGrant/*: POSTEndpoint<{| subjectId: UserID |}, {| loginToken: LoginToken |}, null>*/ = {
  method: 'POST',
  path: '/grants/login',
  toQuery: () => null,
  toRequestBody: (value) => {
    const object = toObject(value);
    return {
      subjectId: toUserId(object.subjectId),
    }
  },
  toResponseBody: (value) => {
    const object = toObject(value);
    return {
      loginToken: toLoginToken(object.loginToken),
    }
  },
};

module.exports = {
  POSTAccessGrant,
  POSTLoginGrant,
}