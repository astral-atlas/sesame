// @flow strict
/*:: import type { BufferStore } from './sources/buffer.js'; */
/*:: import type { CompositeTable, Table } from './sources/table.js'; */

/*:: import type {
  UserID, User,
  IdentityGrantID, IdentityGrant,
  LoginGrantID, LoginGrant,
  Service, ServiceID,
  ServiceGrant, ServiceGrantID,
  LinkGrant, LinkGrantID,
  AdminID, Admin,
} from '@astral-atlas/sesame-models'; */

import * as m from "@astral-atlas/sesame-models";
import { c } from "@lukekaalim/cast";


import { createBufferTable, createBufferCompositeTable } from './sources/table.js';
import { createMemoryBufferStore } from './sources/buffer.js';

/*::
export type SesameData = {
  users:      Table<UserID, User>,
  admins:     Table<AdminID, Admin>,
  services:   Table<ServiceID, Service>,

  secrets: Table<IdentityGrantID | LoginGrantID | ServiceGrantID | LinkGrantID, string>,

  grants: {
    identity: CompositeTable<UserID, IdentityGrantID, IdentityGrant>,
    login:    CompositeTable<UserID, LoginGrantID, LoginGrant>,
    service:  CompositeTable<ServiceID, ServiceGrantID, ServiceGrant>,
    link:     CompositeTable<UserID, LinkGrantID, LinkGrant>,
  }
};
*/

export const createBufferedSesameData = (bufferConstructor/*: (tableName: string) => BufferStore*/)/*: { data: SesameData }*/ => {
  const users =     createBufferTable(bufferConstructor('users'), m.castUser);
  const services =  createBufferTable(bufferConstructor('services'), m.castService);
  const admins =    createBufferTable(bufferConstructor('admins'), m.castAdmin);

  const secrets =   createBufferTable(bufferConstructor('secrets'), c.str);

  const grants = {
    identity:       createBufferCompositeTable(bufferConstructor('identity_grants'), m.castIdentityGrant),
    login:          createBufferCompositeTable(bufferConstructor('login_grants'), m.castLoginGrant),
    link:           createBufferCompositeTable(bufferConstructor('link_grants'), m.castLinkGrant),
    service:        createBufferCompositeTable(bufferConstructor('service_grants'), m.castServiceGrant),
  };

  const data = {
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
