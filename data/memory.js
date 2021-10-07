// @flow strict
/*:: import type { User } from '@astral-atlas/sesame-models'; */
/*:: import type { SesameData } from './entry.js'; */
import { createMemoryTable, createCompositeKeyTable } from './table.js';


export const createMemorySesameData = ()/*: { data: SesameData }*/ => {
  const users = createMemoryTable();
  const services = createMemoryTable();
  const admins = createMemoryTable();

  const grants = {
    identity: createCompositeKeyTable(createMemoryTable()),
    login:    createCompositeKeyTable(createMemoryTable()),
    link:     createCompositeKeyTable(createMemoryTable()),
    service:  createCompositeKeyTable(createMemoryTable()),
  }

  const secrets = {
    identity: createMemoryTable(),
    login:    createMemoryTable(),
    link:     createMemoryTable(),
    service:  createMemoryTable(),
  }

  const data =  {
    users,
    services,
    admins,
    secrets,
    grants
  }
  return {
    data,
  };
};
