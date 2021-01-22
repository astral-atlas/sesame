// @flow strict
/*:: import type { LoginGuestResource } from './api/guest'; */
/*:: import type { AccessTokenResource, LoginTokenResource } from './api/tokens'; */
/*:: import type { UsersResource } from './api/users'; */
const { guestLogin } = require('./api/guest');
const { tokenAccess, tokenLogin } = require('./api/tokens');
const { users } = require('./api/users');

/*::
export type API = {
  guest: {
    login: LoginGuestResource,
  },
  tokens: {
    access: AccessTokenResource,
    login: LoginTokenResource,
  },
  users: UsersResource
};
*/

const api/*: API*/ = {
  guest: {
    login: guestLogin,
  },
  tokens: {
    access: tokenAccess,
    login: tokenLogin
  },
  users,
}

module.exports = {
  api,
};
