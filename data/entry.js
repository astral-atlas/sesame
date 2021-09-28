// @flow strict
/*:: import type { UserID, User } from '@astral-atlas/sesame-models'; */
/*:: import type { IdentityGrantID, IdentityGrant } from '@astral-atlas/sesame-models'; */
/*:: import type { LoginGrantID, LoginGrant } from '@astral-atlas/sesame-models'; */
/*:: import type { Table, CompositeTable } from './table.js'; */

/*::
export type SesameData = {
  users: Table<UserID, User>,
  grants: {
    secrets: CompositeTable<UserID, IdentityGrantID | LoginGrantID, string>,
    identity: CompositeTable<UserID, IdentityGrantID, IdentityGrant>,
    login: CompositeTable<UserID, LoginGrantID, LoginGrant>,
  }
};
*/

export * from './memory.js';
export * from './file.js';
export * from './aws.js';