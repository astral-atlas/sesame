// @flow strict
/*:: import type { Context, Node } from 'preact'; */
/*:: import type { GuestSesameClient, UserSesameClient, AdminSesameClient } from '@astral-atlas/sesame-client'; */
/*:: import type { AccessGrantProof } from '@astral-atlas/sesame-models'; */
import { createWebClient } from '@lukekaalim/http-client';
import { createGuestSesameClient, createUserSesameClient, createAdminSesameClient } from '@astral-atlas/sesame-client';
import { createContext, h } from 'preact';
import { useContext, useMemo } from 'preact/hooks';
import { applicationContext } from './application';

export const sesameClientContext/*: Context<{
  guest: ?GuestSesameClient, 
  user: ?UserSesameClient,
  admin: ?AdminSesameClient
}>*/ = createContext({ guest: null, user: null, admin: null });

/*::
export type Props = {|
  children: Node,
  baseURL: URL,
|};
*/

const createClients = (authentication, baseURL) => {
  const http = createWebClient(fetch);
  const guest = createGuestSesameClient({ baseURL, http });
  switch (authentication.type) {
    default:
    case 'none':
      return { guest, user: null, admin: null };
    case 'super': {
      const { password, username } = authentication;
      const args = { baseURL, http, authMode: 'super', username, password };
      const user = createUserSesameClient(args);
      const admin = createAdminSesameClient(args);
      return { guest, user, admin };
    }
    case 'grant': {
      const { accessGrantProof } = authentication;
      const args = { baseURL, http, authMode: 'grant', accessGrantProof };
      const user = createUserSesameClient(args);
      const admin = createAdminSesameClient(args);
      return { guest, user, admin };
    }
  }
};

export const SesameClientProvider = ({ children, baseURL }/*: Props*/)/*: Node*/ => {
  const { appState: { authentication } } = useContext(applicationContext);
  const clients = createClients(authentication, baseURL );
  return h(sesameClientContext.Provider, { value: clients }, children);
};
