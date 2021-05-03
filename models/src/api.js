// @flow strict
import * as users from './api/users.js';
import * as access from './api/access.js';

export const api = {
  ...users,
  ...access,
};
