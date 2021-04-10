// @flow strict
/*:: import type { Context, Node } from 'preact'; */
/*:: import type { GuestSesameClient, UserSesameClient, AdminSesameClient } from '@astral-atlas/sesame-client'; */
/*:: import type { AccessGrantProof, User } from '@astral-atlas/sesame-models'; */
/*:: import type { Cast } from '@lukekaalim/cast'; */
import { createWebClient } from '@lukekaalim/http-client';
import { createGuestSesameClient, createUserSesameClient, createAdminSesameClient } from '@astral-atlas/sesame-client';
import { createContext, h } from 'preact';
import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../hooks/storage';
import { castObject, toString, toObject, toNullable } from '@lukekaalim/cast';
import { toAccessGrantProof, toUser } from '@astral-atlas/sesame-models';

/*::
export type ApplicationAuthentication = 
  | {| type: 'none' |}
  | {| type: 'grant', accessGrantProof: AccessGrantProof |}
  | {| type: 'super', username: string, password: string |}
export type ApplicationState = {|
  authentication: ApplicationAuthentication,
  self: null | User,
|};
export type ApplicationEvent =
  { 'type': 'login', authentication: ApplicationAuthentication, self: null | User }
*/
const toAuthentication/*: Cast<ApplicationAuthentication>*/ = (value) => {
  const object = toObject(value);
  switch (toString(object.type)) {
    case 'none':
      return { type: 'none' };
    case 'grant':
      return { type: 'grant', accessGrantProof: toAccessGrantProof(object.accessGrantProof) };
    case 'super':
      return { type: 'super', username: toString(object.username), password: toString(object.password) };
    default:
      throw new TypeError('Unknown authentication strategy');
  }
};
const toApplicationState/*: Cast<ApplicationState>*/ = castObject(prop => ({
  authentication: prop('authentication', toAuthentication),
  self: prop('self', v => toNullable(v, toUser)),
}));

const initialState = {
  authentication: { type: 'none' },
  self: null,
};

export const applicationContext/*: Context<{ appState: ApplicationState, dispatch: ApplicationEvent => void }>*/ = createContext({
  appState: initialState,
  dispatch: () => {},
});
/*::
export type Props = {
  children: Node,
};
*/
const reducer = (state, event) => {
  switch (event.type) {
    case 'login':
      return { ...state, authentication: event.authentication, self: event.self };
    default:
      return state;
  }
};
export const ApplicationProvider = ({ children }/*: Props*/)/*: Node*/ => {
  const [appState, setAppState] = useLocalStorage('sesame_application', initialState, toApplicationState);
  const dispatch = (event) => {
    setAppState(oldState => reducer(oldState, event));
  }

  return h(applicationContext.Provider, { value: { appState, dispatch } }, children);
};