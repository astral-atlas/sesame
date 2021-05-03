// @flow strict
import 'preact/debug';
import { createGuestSesameClient, createUserSesameClient } from '@astral-atlas/sesame-client';
import { createWebClient } from '@lukekaalim/http-client';
import { castObject, toNullable } from '@lukekaalim/cast';
import { h, render } from 'preact';
import { useLocalStorage } from './storage';
import { toAccessGrantProof, toUser } from '@astral-atlas/sesame-models';
import { useEffect } from 'preact/hooks';
import { useAsync } from './async';

const http = createWebClient(window.fetch);

const ExampleApp = () => {
  const [{ grant }, setState] = useLocalStorage(
    'example_app',
    { grant: null },
    castObject(o => ({
      grant: o('grant', v => toNullable(v, toAccessGrantProof)) })
    )
  );
  const [self, error] = useAsync(async () => {
    if (!grant)
      return null;
    const client = createUserSesameClient({ http, authMode: 'grant', accessGrantProof: grant, baseURL: new URL('http://localhost:5543') })
    return await client.getSelfUser();
  }, [grant])

  const onOffer = async ({ offerProof, access }) => {
    const client = createGuestSesameClient({ http, baseURL: new URL('http://localhost:5543') });
    const grant = await client.acceptAccess(access.grant.deviceName, offerProof);
    setState(() => ({ grant: grant.grantProof }));
  };

  useEffect(() => {
    const onMessage = (event) => {
      switch (event.data.type) {
        case 'sesame_access_offer':
          return onOffer(event.data);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener(onMessage);
  }, []);
  return [
    h('iframe', { src: 'http://localhost:5000/frame', width: 512 }),
    (self || error || !grant) && [
      self ? [
        h('p', {}, `Logged in as ${self.self.name}`)
      ] : [
        (error && grant) ?
        h('p', {}, JSON.parse(error.response.body).error.message)
        :
        h('p', {}, 'Not logged in')
      ]
    ],
  ];
}

const main = () => {
  const body = document.body;
  if (!body)
    throw new Error(`Expecting document to have body`);
  render(h(ExampleApp), body);
};

main();