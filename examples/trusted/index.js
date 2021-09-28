// @flow strict
import { render, h, } from 'preact';
import { useState } from 'preact/hooks';
import { AuthorizerFrame } from '@astral-atlas/sesame-components';

import { createIdentityProof, encodeProofToken } from '@astral-atlas/sesame-models';
import { createClient } from '@astral-atlas/sesame-client';
import { createWebClient } from '@lukekaalim/http-client';

const httpClient = createWebClient(fetch);
const identityURL = new URL('http://localhost:8080');

const TrustedApp = () => {
  const [name, setName] = useState(null);
  const [token, setToken] = useState(null);

  const onIdentityGrant = async (grant, secret) => {
    const proof = createIdentityProof(grant, secret);
    const sesameClient = createClient(new URL(`http://localhost:5543`), httpClient, proof);
    const user = await sesameClient.user.get(grant.identity);
    const token = encodeProofToken(proof)
    setToken(token);
    setName(user.name);
  };

  return [
    h(AuthorizerFrame, { identityOrigin: identityURL, onIdentityGrant }),
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