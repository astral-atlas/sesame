// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { APIResource } from '@lukekaalim/api-models'; */
/*:: import type { LoginToken, AccessToken } from '../tokens'; */
const { createAPIResource, toNull } = require("@lukekaalim/api-models");
const { toObject, toString, toArray, toNumber } = require("@lukekaalim/cast");
const { toLoginToken, toAccessToken } = require("../tokens");

/*::
export type LoginRequest = {|
  loginToken: LoginToken,
  deviceName: string | null,
|};
*/
const toLoginRequest/*: Cast<LoginRequest>*/ = (value) => {
  const object = toObject(value);
  return {
    loginToken: toLoginToken(object.loginToken),
    deviceName: object.deviceName ? toString(object.deviceName) : null,
  };
};

/*::
export type LoginGuestResource = APIResource<AccessToken, LoginRequest>;
*/

const guestLogin/*: LoginGuestResource*/ = createAPIResource(
  '/guest/login', 'POST',
  toNull, toLoginRequest, toAccessToken
);

module.exports = {
  guestLogin,
};
