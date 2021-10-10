// @flow strict
/*:: import type { WWWMessage, PromptLinkGrant, UpdateLinkedIdentityGrant, IdentityProviderReady } from '@astral-atlas/sesame-models'; */
import * as m from '@astral-atlas/sesame-models';

/*::
export type ProviderMessenger = {
  send: (message: IdentityProviderReady | UpdateLinkedIdentityGrant) => void,
  addPromptGrantListener: (listener: (message: PromptLinkGrant) => mixed) => { remove: () => void },
};

export type ConsumerMessenger = {
  send: (message: PromptLinkGrant) => void,
  addUpdateLinkedIdentityListener: (listener: (message: UpdateLinkedIdentityGrant) => mixed) => { remove: () => void },
}
*/
export const createProviderMessenger = (origin/*: string*/, window/*: any*/)/*: ProviderMessenger*/ => {
  const promptGrantListeners = new Set();
  window.addEventListener('message', (e/*: MessageEvent*/) => {
    try {
      if (e.origin !== origin)
        return;
      const message = m.castWWWMessage(e.data);
      switch (message.type) {
        case 'sesame:prompt-link-grant':
          for (const listener of promptGrantListeners) listener(message);
          return;
      }
    } catch (error) {}
  });
  const addPromptGrantListener = (listener) => {
    promptGrantListeners.add(listener);
    return { remove() { promptGrantListeners.delete(listener) }}
  };
  const send = (message) => {
    window.parent.postMessage(message, origin);
  };

  return {
    send,
    addPromptGrantListener,
  };
}

export const createConsumerMessenger = async (iframeElement/*: HTMLIFrameElement*/)/*: Promise<ConsumerMessenger>*/ => {
  const updateLinkedIdentityListeners = new Set();
  let onReadyResolver = null;
  const url = new URL(iframeElement.src);

  window.addEventListener('message', (e/*: MessageEvent*/) => {
    try {
      if (e.origin !== url.origin)
        return;
      const message = m.castWWWMessage(e.data);
      switch (message.type) {
        case 'sesame:update-link-grant':
          for (const listener of updateLinkedIdentityListeners) listener(message);
          return;
        case 'sesame:identity-provider-ready':
          onReadyResolver && onReadyResolver();
      }
    } catch (error) {}
  });

  const addUpdateLinkedIdentityListener = (listener) => {
    updateLinkedIdentityListeners.add(listener);
    return { remove() { updateLinkedIdentityListeners.delete(listener) }}
  };
  const send = (message) => {
    iframeElement.contentWindow.postMessage(message, url.origin);
  };

  await new Promise(r => { onReadyResolver = r });

  return {
    send,
    addUpdateLinkedIdentityListener,
  };
}