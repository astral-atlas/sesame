// @flow strict
/*:: import type { Context, Node } from 'preact'; */
/*:: import type { AccessGrantProof, User, Authorization, Access, Admin } from '@astral-atlas/sesame-models'; */
/*:: import type { Cast } from '@lukekaalim/cast'; */
import { createContext, h } from 'preact';
import { useEffect } from "preact/hooks";
import { createWebClient } from '@lukekaalim/http-client';
import { useLocalStorage } from '../hooks/storage';
import { apiContext } from './api.js';

import { createClient } from '@astral-atlas/sesame-client';
import { castObject, toString, toObject, toNullable } from '@lukekaalim/cast';
import { toAuthorization, toUser, toAccess, toAdmin } from '@astral-atlas/sesame-models';

import { LocationProvider } from './location.js';

/*::
export type ApplicationEvent =
  | { type: 'login', authentication: Authorization, self: null | User }
*/

export const applicationContext/*: Context<[ApplicationState, ApplicationEvent => void]>*/ = createContext(
  [initialState, () => {}]
);

const reducer = (state/*: ApplicationState*/, event)/*: ApplicationState*/ => {
  switch (event.type) {
    case 'login':
      return { ...state, authentication: event.authentication };
    default:
      return state;
  }
};

/*::
export type Props = {
  children: Node,
  base: URL,
};
*/
export const ApplicationProvider = ({ children, base }/*: Props*/)/*: Node*/ => {
  const [appState, setAppState] = useLocalStorage/*:: <ApplicationState>*/('sesame_application', initialState, toApplicationState);
  const dispatch = (event) => {
    setAppState(oldState => reducer(oldState, event));
  }
  const http = createWebClient(fetch);
  const client = createClient({ base, http, auth: appState.authentication });
  useEffect(() => {
    client.user.getSelf()
      .then((self) => setAppState(state => ({ ...state, self })))
  }, [appState.authentication])

  return h(applicationContext.Provider, { value: [appState, dispatch] },
    h(apiContext.Provider, { value: client },
      h(LocationProvider, {}, children)));
};