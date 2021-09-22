// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { AccessGrantProof, User, Authorization, Access, Admin } from '@astral-atlas/sesame-models'; */
/*:: import type { StoredValue } from '../lib/storage.js'; */
import { castObject, toNullable } from '@lukekaalim/cast';
import { toAuthorization, toUser, toAccess, toAdmin } from '@astral-atlas/sesame-models';

import { createStoredValue } from "../lib/storage.js";

export const initialState/*: ApplicationState*/ = {
  authentication: { type: 'none' },
  self: {
    user: null,
    access: null,
    admin: null,
  }
};

/*::
export type ApplicationState = {|
  authentication: Authorization,
  self: {|
    user: null | User,
    access: null | Access,
    admin: null | Admin,
  |},
|};
*/
export const toApplicationState/*: Cast<ApplicationState>*/ = castObject(prop => ({
  authentication: prop('authentication', toAuthorization),
  self: prop('loggedInUser', castObject(prop => ({
    user: prop('user', v => toNullable(v, toUser)),
    access: prop('access', v => toNullable(v, toAccess)),
    admin: prop('admin', v => toNullable(v, toAdmin)),
  }))),
}));

export const applicationStore/*: StoredValue<ApplicationState>*/ =
  createStoredValue('sesame_application', toApplicationState, initialState);