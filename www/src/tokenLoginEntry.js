// @flow strict
import { h } from '@lukekaalim/act';
import { render } from '@lukekaalim/act-web';

import { createClient } from '@astral-atlas/sesame-client';
import { decodeProofToken, createIdentityProof } from '@astral-atlas/sesame-models';
import { createWebClient } from '@lukekaalim/http-client';

import { identityStore } from './storage/identity.js';
import { loadConfigFromURL } from './config.js';
import { useAsync } from "./hooks/async.js";
import { useStoredValue } from './hooks/storage.js';

const TokenLoginSuccess = () => {
  return [
    h('h1', {}, 'Token Login'),
    h('p', {}, `You have been logged in.`),
    h('p', {}, [`Return to the `, h('a', { href: '/' }, 'Homepage'), `.`]),
  ]
};

const TokenLogin = ({ config, token, service }) => {
  const proof = decodeProofToken(token);
  if (proof.type !== 'login')
    return [h('h1', {}, 'Wrong type of token friend')];
    
  const httpClient = createWebClient(fetch);
  const sesameClient = createClient(new URL(config.api.sesame.origin), httpClient, proof);

  const [user, userError] = useAsync(async () => sesameClient.user.get(proof.userId), [proof.userId])
  const [currentIdentity, setCurrentIdentity] = useStoredValue(identityStore);
  
  const [currentUser] = useAsync(
    async () => currentIdentity && sesameClient.user.get(currentIdentity.proof.userId),
    [currentIdentity && currentIdentity.proof.userId]
  );

  const onClick = async () => {
    const { grant, secret } = await sesameClient.grants.identity.create(proof.userId, service, 'my_device');
    const newProof = createIdentityProof(grant, secret);
    setCurrentIdentity(() => ({ proof: newProof }));
    console.log({ grant, secret });
  };

  if (currentUser && user && currentUser.id === user.id)
    return h(TokenLoginSuccess);

  return [
    h('h1', {}, 'Token Login'),
    user && h('p', {}, [`You will be logged in as "`, h('strong', {}, user.name), `".`]),
    currentUser ? h('p', {}, [`You are currently logged in as "`, h('strong', {}, currentUser.name), `". You will be logged out by logging in as a new user.`]) : null,
    userError && h('pre', {}, userError.toString()),
    user && h('button', { onClick }, [`Login as "`, h('strong', {}, user.name), `"`])
  ];
};

const tokenLoginEntry = async () => {
  try {
    const config = await loadConfigFromURL('/config.json5');
    const params = new URL(document.URL).searchParams;
    const service = config.origin;
    const encodedToken = params.get('token');
    if (!encodedToken)
      throw new Error();
    const token = decodeURI(encodedToken);
    console.log(token);
  
    const { body: target } = document;
    if (!target)
      throw new Error();
    render(h(TokenLogin, { config, token, service }), target);
  } catch (error) {
    console.error(error);
  }
};

tokenLoginEntry();