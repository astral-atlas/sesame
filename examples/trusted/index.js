// @flow strict
import { render, h, } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useConsumerMessenger } from '@astral-atlas/sesame-components';

import { createSesameSDK } from '@astral-atlas/sesame-client';
import { createWebClient } from '@lukekaalim/http-client';

const httpClient = createWebClient(fetch);
const identityURL = new URL('http://sesame.astral-atlas.com');

const serviceProof = {
  type: 'service',
  grantId: 'dbd1c10d-14f1-4ae7-ad1b-673c2173a1b2',
  serviceId: '179a9ebc-677b-4f0a-9d91-cbb497c199f5',
  secret: 'e3ff393be55de2031ac56f6c99f6b865'
};
const sdk = createSesameSDK(new URL(`http://localhost:5543`), httpClient, serviceProof);

const TrustedApp = () => {
  const [name, setName] = useState(null);
  const [token, setToken] = useState(null);

  const onIdentityGrant = async ({ grant, proof, secret, token }) => {
    const valiatedGrant = await sdk.validateProof(proof);
    if (!valiatedGrant)
      throw new Error();
    const user = await sdk.getUser(valiatedGrant.identity);
    setToken(token);
    setName(user.name);
  };

  const messenger = useConsumerMessenger(identityURL.href, onIdentityGrant);

  return [
    messenger && h('button', { onClick: () => messenger.send({ type: 'sesame:prompt-link-grant' }) }, 'Lets log in!'),
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