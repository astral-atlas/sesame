// @flow strict
/*:: import type { Node } from 'preact'; */
import { toString, toNullable } from '@lukekaalim/cast';
import { h } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';

import { useAsync } from '../hooks/async';
import { LoginForm } from '../components/login';
import { applicationContext } from '../context/application';
import { isLoggedIn } from '../selectors/authentication';
import { AccessInfo, SelfInfo } from '../components/user';
import { useAdminSesameClient, useUserSesameClient } from '../hooks/sesameClient';
import { sesameClientContext } from '../context/sesameClient';

const Homepage = ()/*: Node*/ => {
  const { appState, dispatch } = useContext(applicationContext);

  return [
    isLoggedIn(appState) ? null : h(LoginForm),
    appState.self && h(SelfInfo),
    appState.self && h(AccessInfo),
    isLoggedIn(appState) ? h('button', {
      onClick: () => dispatch({ type: 'login', authentication: { type: 'none' }, self: null })
    }, 'Logout') : null,
  ]
};

export {
  Homepage,
};
