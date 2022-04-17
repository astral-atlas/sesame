// @flow strict

import { render } from "@lukekaalim/act-web";
import { h, useEffect, useState } from "@lukekaalim/act";
import { createClient, createSesameSDK } from "@astral-atlas/sesame-client";
import { createWebClient } from "@lukekaalim/http-client";

import { identityStore } from "../src/storage/identity.js";
import { loadConfigFromURL } from "../src/config.js";

const StorageAccessForm = ({ onStorageAuthorized = () => {}, origin }) => {
  const onAuthorizationSubmit = async (event) => {
    event.preventDefault();

    // $FlowFixMe
    await document.requestStorageAccess()
    const identity = identityStore.get();
    console.log({ identity })
    onStorageAuthorized()
  };

  useEffect(() => {
    // $FlowFixMe
    if (!document.hasStorageAccess) {
      console.log('No hasStorageAccess API, authorizing')
      onStorageAuthorized()
    } else {
      // $FlowFixMe
      document.hasStorageAccess()
        .then(access => {
          console.log({ access })
          if (access) {
            const identity = identityStore.get();
            console.log({ identity })
            onStorageAuthorized()
          }
        })
    }

  }, [])

  return [
    h('form', { onSubmit: onAuthorizationSubmit }, [
      h('input', { type: 'submit', value: `Grant this page access to ${origin}` })
    ]),
  ]
};

const AuthorizationForm = ({ config }) => {
  const [identity, setIdentity] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('REQUESTING IDENTITY')
    const identity = identityStore.get();
    console.log({ identity });
    console.log(document.location.href)
    setIdentity(identity);
    if (!identity)
      return;

    const httpClient = createWebClient(fetch);
    const client = createClient(new URL(config.api.sesame.origin), httpClient, identity.proof);
    client.user.getSelf()
      .then(user => setUser(user))
  }, [])

  const onAuthorizationSubmit = async (event) => {
    event.preventDefault();
  };

  if (!identity)
    return [
      h('div', {}, 'You are not logged in')
    ]

  return [
    h('form', { onSubmit: onAuthorizationSubmit }, [
      user && h('input', { type: 'submit', value: `Login to this page as ${user.name}` })
    ]),
  ]
}

const Embed = () => {
  const [config, setConfig] = useState();
  const [crossStorageAuthorized, setCrossStorageAuthorized] = useState(false);
  
  const onStorageAuthorized = () => {
    console.log('Cross Storage Authorize')
    setCrossStorageAuthorized(true);
  }
  useEffect(() => {
    loadConfigFromURL().then(config => setConfig(config));
  }, [])

  if (!config)
    return 'Loading'

  if (!crossStorageAuthorized)
    return h(StorageAccessForm, { onStorageAuthorized, origin: document.location.origin });

  return h(AuthorizationForm, { config })
};

render(h(Embed), (document.body/*: any*/))