// @flow strict
import { render, h, } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useConsumerMessenger } from '@astral-atlas/sesame-components';

import { createSesameSDK } from '@astral-atlas/sesame-client';
import { createWebClient } from '@lukekaalim/http-client';
import { requestLinkGrant } from "@astral-atlas/sesame-components";

const httpClient = createWebClient(fetch);
const identityURL = new URL('http://localhost:8080');

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

  const onLoginClick = async () => {
    const { proof, token } = await requestLinkGrant(identityURL)
    const valiatedGrant = await sdk.validateProof(proof);
    if (!valiatedGrant)
      throw new Error();
    const user = await sdk.getUser(valiatedGrant.identity);
    setToken(token);
    setName(user.name);
  }

  return [
    h('button', { onClick: onLoginClick }, 'Login'),
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