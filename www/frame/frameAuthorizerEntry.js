// @flow strict
import { createProviderMessenger } from '@astral-atlas/sesame-components';
import { createClient } from '@astral-atlas/sesame-client';
import { createWebClient } from "@lukekaalim/http-client";
import { createLinkProof, encodeProofToken } from "@astral-atlas/sesame-models";

import { loadConfigFromURL } from "../src/config.js";
import { identityStore } from "../src/storage/identity.js";

const main = async () => {
  const url = new URL(document.location.href);
  const service = url.searchParams.get("service");

  if (!service)
    throw new Error(`Missing query param: "service"`);

  const messenger = createProviderMessenger(service, window);
  const config = await loadConfigFromURL();
  const httpClient = createWebClient(fetch);

  messenger.addPromptGrantListener(async () => {
    const identity = identityStore.get();
    const client = createClient(new URL(config.api.sesame.origin), httpClient, identity && identity.proof);

    if (identity) {
      const { grant, secret } = await client.grants.link.create(service);
      const proof = createLinkProof(grant, secret);
      const token = encodeProofToken(proof);
      messenger.send({ type: 'sesame:update-link-grant', grant, secret, proof, token });
    }
  });

  messenger.send({ type: 'sesame:identity-provider-ready' });
};

main();