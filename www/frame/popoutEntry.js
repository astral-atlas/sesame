// @flow strict
import { h, useEffect, useState } from "@lukekaalim/act";
import { render } from "@lukekaalim/act-web";

import { createProviderMessenger } from '@astral-atlas/sesame-components';
import { createClient } from '@astral-atlas/sesame-client';
import { createWebClient } from "@lukekaalim/http-client";
import { createLinkProof, encodeProofToken } from "@astral-atlas/sesame-models";

import { loadConfigFromURL } from "../src/config.js";
import { identityStore } from "../src/storage/identity.js";
import { useStoredValue } from "../src/hooks/storage";

import "./index.css";

const NotLoggedInWarning = ({ service }) => {
  return h('div', { className: 'popout_authorizer' }, [
    h('div', { className: 'popup_content' }, [
      h('h1', { className: 'popup_main_title' }, 'Grant Access to Account'),
      h('p', { className: 'service_title' }, [
        h('a', { href: service }, service),
      ]),
      h('p', {}, [
        `You don't appear to be logged into `,
        h('strong', {}, 'Sesame'),
        `.`
      ]),
      h('p', {}, [
        `If your administrator has given you a Login URL, navigating to that URL and following the login process.`,
      ]),
      h('p', {}, [
        `Sesame is current "invite-only", contact your administrator if you don't have a Login URL.`,
      ]),
      h('p', {}, [
        `You can check your login status by visiting `,
        h('a', { href: '/' }, ` the homepage.`)
      ])
    ])
  ])
}

const BadURLWarning = () => {
  return h('div', { className: 'popout_authorizer' }, [
    h('div', { className: 'popup_content' }, [
      h('h1', { className: 'popup_main_title' }, 'Grant Access to Account'),
      h('h2', { className: 'popup_error_title' }, [
        `Error: Bad URL Warning`
      ]),
      h('p', {}, [
        `The URL is malformatted - can't tell which service this request is intended for. `
      ]),
      h('p', {}, [
        `Ensure this URL was copy-pasted correctly or that the URL was not modified accidentally.`
      ])
    ])
  ])
}

const AuthorizerForm = ({ service, onGrantAccess, client }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    client.user.getSelf().then(setUser);
  }, [])

  const onAccessSubmit = (event) => {
    event.preventDefault();
    onGrantAccess();
  }

  if (!user)
    return 'loading';

  return h('div', { className: 'popout_authorizer' }, [
    h('form', { onSubmit: onAccessSubmit, className: 'popup_content' }, [
      h('h1', { className: 'popup_main_title' }, 'Grant Access to Account'),
      h('p', { className: 'service_title' }, [
        h('a', { href: service }, service),
      ]),
      h('p', {}, [
        `Grant this service access to your account. This includes your name and account ID.`,
      ] ),
      h('p', {}, [
        `This service does not have permission to change your name or details, nor see any details by any other services.`,
      ] ),
      h('ul', { className: 'account_details' }, [
        h('li', {}, [
          h('dt', {}, `name`),
          h('dd', {}, user.name),
        ]),
        h('li', {}, [
          h('dt', {}, `userId`),
          h('dd', {}, h('pre', {}, user.id)),
        ]),
      ]),
      h('input', { type: 'submit', value: `Grant Access` })
    ])
  ])
}

const PopoutAuthorizer = ({ config, service }) => {
  if (!service)
    return h(BadURLWarning);
  const [provider, setProvider] = useState(null);

  const httpClient = createWebClient(fetch);
  const [identity] = useStoredValue(identityStore);
  if (!identity)
    return h(NotLoggedInWarning, { service });

  const client = createClient(new URL(config.api.sesame.origin), httpClient, identity.proof)

  useEffect(() => {
    const provider = createProviderMessenger(service, window);
    provider.send({ type: 'sesame:identity-provider-ready' });
    setProvider(provider);
  }, [])

  if (!provider)
    return `Loading`;

  const onGrantAccess = async () => {
    const { grant, secret } = await client.grants.link.create(service);
    const proof = createLinkProof(grant, secret);
    const token = encodeProofToken(proof);
    provider.send({ type: 'sesame:update-link-grant', grant, secret, proof, token });
  }

  return h(AuthorizerForm, { service, onGrantAccess, client })
}

const main = async () => {
  const config = await loadConfigFromURL();
  const url = new URL(document.location.href);
  const service = url.searchParams.get("service");
  
  render(h(PopoutAuthorizer, { config, service }), (document.body/*: any*/))
}

main();