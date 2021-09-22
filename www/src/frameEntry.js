// @flow strict
import { applicationStore } from './storage/application.js';

const frameEntry = async () => {
  window.addEventListener('message', (event) => {
    console.log(event);
  });

  const originURL = new URL(document.referrer);

  const { self } = applicationStore.get();

  window.parent.postMessage(self, originURL.origin);
};

frameEntry();