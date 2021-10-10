// @flow strict
import { render, h, } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { AuthorizerFrame } from '@astral-atlas/sesame-components';

import { createClient } from '@astral-atlas/sesame-client';
import { createWebClient } from '@lukekaalim/http-client';

const httpClient = createWebClient(fetch);
const identityURL = new URL('http://sesame.astral-atlas.com');

const TrustedApp = () => {
  const [name, setName] = useState(null);
  const [token, setToken] = useState(null);

  const [messenger, setMessenger] = useState();

  useEffect(() => {
    if (!messenger)
      return;
    const { remove } = messenger.addUpdateLinkedIdentityListener(onIdentityGrant);
    return () => {
      remove();
    };
  }, [messenger]);

  const onClick = () => {
    if (!messenger)
      return;
    messenger.send({ type: 'sesame:prompt-link-grant' });
  }

  const onIdentityGrant = async ({ grant, proof, secret, token }) => {
    const sesameClient = createClient(new URL(`http://localhost:5543`), httpClient, proof);
    const user = await sesameClient.user.get(grant.identity);
    setToken(token);
    setName(user.name);
  };

  return [
    h(AuthorizerFrame, { origin: 'http://localhost:8080', onMessengerLoad: m => setMessenger(m) }),
    (messenger || null) && h('button', { onClick }, 'Lets log in!'),
    name && h('p', {}, `You are logged in as ${name}`),
    token && h('p', {}, [`Your authorization token is: `, h('pre', {}, token)]),
  ];
};

const main = () => {
  const { body } = document;
  if (body)
    render(h(TrustedApp), body);
};

main();