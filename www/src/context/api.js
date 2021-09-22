// @flow strict
/*:: import type { Context, Node } from 'preact'; */
/*:: import type { SesameClient } from '@astral-atlas/sesame-client'; */
/*:: import type { Authorization } from '@astral-atlas/sesame-models'; */
import { createWebClient } from '@lukekaalim/http-client';
import { createClient } from '@astral-atlas/sesame-client';
import { createContext, h } from 'preact';
import { useContext } from 'preact/hooks';

export const apiContext/*: Context<?SesameClient>*/ = createContext();

/*::
export type Props = {|
  children: Node,
  base: URL,
  auth: Authorization
|};
*/

export const SesameClientProvider = ({ children, base, auth }/*: Props*/)/*: Node*/ => {
  const http = createWebClient(fetch);
  const client = createClient({ base, http, auth });

  return h(apiContext.Provider, { value: client }, children);
};

export const useAPI = ()/*: SesameClient*/ => {
  const client = useContext(apiContext);
  if (!client)
    throw new Error();
  return client;
};