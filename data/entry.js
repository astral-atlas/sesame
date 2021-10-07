// @flow strict
/*:: import type { UserID, User } from '@astral-atlas/sesame-models'; */
/*:: import type {
  IdentityGrantID, IdentityGrant,
  LoginGrantID, LoginGrant,
  Service, ServiceID,
  ServiceGrant, ServiceGrantID,
  LinkGrant, LinkGrantID,
  AdminID, Admin,
} from '@astral-atlas/sesame-models'; */

/*:: import type { Table, CompositeTable } from './table.js'; */

/*::
export type SesameData = {
  users:      Table<UserID, User>,
  admins:     Table<AdminID, Admin>,
  services:   Table<ServiceID, Service>,

  secrets: {
    login:    Table<LoginGrantID, string>,
    identity: Table<IdentityGrantID, string>,
    service:  Table<ServiceGrantID, string>,
    link:     Table<LinkGrantID, string>,
  },
  grants: {
    identity: CompositeTable<UserID, IdentityGrantID, IdentityGrant>,
    login:    CompositeTable<UserID, LoginGrantID, LoginGrant>,
    service:  CompositeTable<ServiceID, ServiceGrantID, ServiceGrant>,
    link:     CompositeTable<UserID, LinkGrantID, LinkGrant>,
  }
};
*/

export * from './memory.js';
export * from './file.js';
export * from './aws.js';