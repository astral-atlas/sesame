// @flow strict
import { h } from '@lukekaalim/act';
import { render } from '@lukekaalim/act-three';

import styles from './home.module.css';
import { useStoredValue } from "../src/hooks/storage.js";
import { identityStore } from "../src/storage/identity.js";
import { APIProvider, useAPI } from "../hooks/api.js";
import { loadConfigFromURL } from "../src/config";

import { GateScene } from "./GateScene.js";
import { LoggedInControls } from './LoggedInControls.js';
import { NotLoggedInControls } from './NotLoggedInControls.js';
import { configContext } from "../hooks/config";

const Homepage = ({ config }) => {
  const [identity, setIdentity] = useStoredValue(identityStore);
  const onIdentityChange = (identity) => {
    setIdentity(v => identity);
  }
  
  return [
    h(APIProvider, { config, proof: identity && identity.proof }, [
      h('section', { class: styles.homepageContent }, [
        h(GateScene, { open: !!identity }),
        h('h1', { class: styles.pageTitle }, 'ASTRAL ATLAS'),
        identity ? h(LoggedInControls, { identity, onIdentityChange }) : null,
        !identity ? h(NotLoggedInControls, { onIdentityChange }) : null,
      ]),
    ]),
  ];
};

const main = async () => {
  const { body } = document;
  if (!body)
    throw new Error();

  const config = await loadConfigFromURL()

  render(h(configContext.Provider, { value: config }, h(Homepage, { config })), body);
};

main();