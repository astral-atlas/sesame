// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type { Config } from '../config'; */
import { h } from '@lukekaalim/act';
import * as styles from './pages.module.css';

import { createClient } from '@astral-atlas/sesame-client';
import { createWebClient } from '@lukekaalim/http-client';

import { identityStore } from '../storage/identity.js';
import { useStoredValue } from '../hooks/storage.js'
import { useAsync } from "../hooks/async.js";

const LoggedIn = ({ config, user, setIdentity }) => {
  const onLogoutClick = () => {
    setIdentity(() => null);
  }

  return [
    h('div', { class: styles.loggedInInfo }, [
      h('p', {}, [`Welcome, `, h('strong', {}, user.name), `.`]),
      h('div', {}, [
        h('button', { class: styles.logout, onClick: onLogoutClick }, `Logout of ${config.name}`)
      ]),
    ])
  ]
};

const NotLoggedIn = ({ userError, identity, config }) => {
  if (userError)
    return [
      h('p', {}, 'Something went wrong trying to log you in'),
      h('pre', {}, userError.toString())
    ]
  if (identity)
    return [
      h('p', {}, 'Loading User Data...')
    ];

  return [
    h('div', { class: styles.loggedOutInfo }, [
      h('p', {}, `You are not currently logged in.`),
      h('p', {}, `Get in touch with your ${config.name} administrator to get a login URL.`)
    ]),
  ];
};

export const Homepage/*: Component<{ config: Config }>*/ = ({ config }) => {
  const [identity, setIdentity] = useStoredValue(identityStore);
  const httpClient = createWebClient(fetch);
  const sesameClient = createClient(new URL(config.api.sesame.origin), httpClient, identity && identity.proof);
  const [user, userError] = useAsync(async () => identity && sesameClient.user.get(identity.proof.userId), [identity && identity.proof.userId]);

  return [
    h('div', { class: styles.homepage }, [
      h('h1', { class: styles.homepageTitle }, config.name),
      h('p', { class: styles.homepageSubTitle }, 'Astral Atlas Identity Service'),

      h('hr', { class: styles.titleDivdier }),
  
      user ? h(LoggedIn, { user, config, setIdentity }) : h(NotLoggedIn, { userError, identity, config }),
    ]),
  ];
};
