// @flow strict
/*:: import type { User } from '@astral-atlas/sesame-models'; */
/*:: import type { SesameData } from './entry.js'; */
import { createMemoryTable, createCompositeKeyTable } from './table.js';

/*::
export type MemoryInit = {
  users: User[],
};
*/

export const createMemorySesameData = (init/*: MemoryInit*/ = { users: [] })/*: { data: SesameData }*/ => {
  const users = createMemoryTable(init.users.map(u => [u.id, u]));
  const identity = createCompositeKeyTable(createMemoryTable());
  const login = createCompositeKeyTable(createMemoryTable());
  const secrets = createCompositeKeyTable(createMemoryTable());

  const data =  {
    users,
    grants: {
      identity,
      secrets,
      login,
    }
  }
  return {
    data,
  };
};
