// @flow strict
/*:: import type { WWWMessage } from '@astral-atlas/sesame-models'; */
import { h } from '@lukekaalim/act';
import { render } from '@lukekaalim/act-web';

import { createClient } from '@astral-atlas/sesame-client';
import { createWebClient } from '@lukekaalim/http-client';
import {} from '@astral-atlas/sesame-models';

import { identityStore } from './storage/identity.js';
import { useStoredValue } from './hooks/storage.js'
import { useAsync } from "./hooks/async.js";
import { loadConfigFromURL } from './config';

import * as styles from './entry.module.css';


const LoginFrame = ({ config, service }) => {
  const [identity] = useStoredValue(identityStore);
  const httpClient = createWebClient(fetch);
  const sesameClient = createClient(new URL(config.api.sesame.origin), httpClient, identity && identity.proof);
  const [user, userError] = useAsync(async () => identity && sesameClient.user.get(identity.proof.userId), [identity && identity.proof.userId]);

  if (window.parent === window)
    return h(NotAFrame);

  if (!identity) {
    return [
      h('div', { class: styles.notLoggedInFrame }, [
        h('button', { disabled: true, class: styles.frameLoginButton }, `🔒 You are not logged into the identity service.`),
        h('p', { class: styles.notLoggedInInfo }, [`Visit `, h('a', { href: config.origin, target: 'blank' }, config.origin), ` to log in.`])
      ])
    ]
  }

  if (userError)
    return [
      h('h2', {}, 'Error!')
    ];

  if (!user)
    return [
      h('h2', {}, 'Loading...')
    ];

  const onFrameLoginClick = async () => {
    const { grant, secret } = await sesameClient.grants.identity.create(identity.proof.userId, 'cool-service', 'myName');
    const message/*: WWWMessage*/ = {
      type: 'sesame:new-identity-grant',
      grant,
      secret,
    };
    window.parent.postMessage(message, service.origin);
  }

  return [
    h('div', { class: styles.notLoggedInFrame }, [
      h('button', { disabled: false, onClick: onFrameLoginClick, class: styles.frameLoginButton }, [
        `Log into `,
        h('strong', {}, service.origin),
        ` as "`,
        h('strong', {}, user.name),
        `" via `,
        h('i', {}, `${config.name} (${config.origin})`),
      ]),
    ])
  ];
};

const NotAFrame = () => {
  return [
    h('h1', {}, 'This page is intended to be used as a frame'),
    h('p', {}, 'Direct access is incorrect - did you mean to embed this page as an iframe?')
  ]
};

const loginFrameEntry = async () => {
  try {
    const { body: target } = document;
    if (!target)
      throw new Error(`This document has no body!`);
    const url = new URL(document.location.href);
    const encodedService = url.searchParams.get("service");
    if (!encodedService)
      throw new Error(`Missing query param: "service"`);
    const service = new URL(decodeURI(encodedService));

    const config = await loadConfigFromURL();
    render(h(LoginFrame, { config, service }), target);
  } catch (error) {
    console.error(error);
  }
};

loginFrameEntry();