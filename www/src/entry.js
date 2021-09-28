// @flow strict
import { h } from '@lukekaalim/act';
import { render } from '@lukekaalim/act-web';

import { createClient } from '@astral-atlas/sesame-client';
import { createWebClient } from '@lukekaalim/http-client';

import { identityStore } from './storage/identity.js';
import { useStoredValue } from './hooks/storage.js'
import { useAsync } from "./hooks/async.js";
import { loadConfigFromURL } from './config';
import { Homepage } from "./pages/homepages";

const SesameWWW = ({ config }) => {
  return h(Homepage, { config });
};

const main = async () => {
  const config = await loadConfigFromURL('/config.json5');
  const root = document.body;
  if (!root)
    return;

  render(h(SesameWWW, { config }), root)
};

main();