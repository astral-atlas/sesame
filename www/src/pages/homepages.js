// @flow strict
/*:: import type { Node } from 'preact'; */
import { toString, toNullable } from '@lukekaalim/cast';
import { h } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';

import { useAsync } from '../hooks/async';
import { LoginForm } from '../components/login';
import { applicationContext } from '../context/application';
import { isLoggedIn } from '../selectors/authentication';
import { SelfInfo } from '../components/user';
import { useAdminSesameClient, useUserSesameClient } from '../hooks/sesameClient';
import { sesameClientContext } from '../context/sesameClient';

const AccessList = () => {
  const { appState } = useContext(applicationContext);
  const { user } = useContext(sesameClientContext)
  if (!appState.self)
    return null;
  if (!user)
    return null;

  const [accessResult] = useAsync(async () => user.getAccessForSelf(), [user])
  if (!accessResult)
    return null;
  const { access } = accessResult;

  return [
    ...access.map(grant => h('pre', {}, JSON.stringify(grant, null, 2)))
  ];
};

const Homepage = ()/*: Node*/ => {
  const { appState, dispatch } = useContext(applicationContext);

  return [
    isLoggedIn(appState) ? null : h(LoginForm),
    appState.self && h(SelfInfo),
    appState.self && h(AccessList),
    isLoggedIn(appState) ? h('button', {
      onClick: () => dispatch({ type: 'login', authentication: { type: 'none' }, self: null })
    }, 'Logout') : null,
  ]
};

export {
  Homepage,
};
