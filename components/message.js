// @flow strict
/*:: import type {
  WWWMessage, PromptLinkGrant, UpdateLinkedIdentityGrant,
  IdentityProviderReady, ConsumerState, CannotGrant, GrantRevoked,
} from '@astral-atlas/sesame-models'; */
import * as m from '@astral-atlas/sesame-models';

/*::
export type ProviderMessenger = {
  send: (message: IdentityProviderReady | UpdateLinkedIdentityGrant | CannotGrant | GrantRevoked) => void,
  addPromptGrantListener: (listener: (message: PromptLinkGrant) => mixed) => { remove: () => void },
  addStateListener: (listener: (message: ConsumerState) => mixed) => { remove: () => void },
};

export type ConsumerMessenger = {
  send: (message: PromptLinkGrant | ConsumerState) => void,
  addUpdateLinkedIdentityListener: (listener: (message: UpdateLinkedIdentityGrant) => mixed) => { remove: () => void },
  addCannotGrantListener: (listener: (message: CannotGrant) => mixed) => { remove: () => void },
}
*/
export const createProviderMessenger = (origin/*: string*/, window/*: any*/)/*: ProviderMessenger*/ => {
  const promptGrantListeners = new Set();
  const stateListeners = new Set();
  window.addEventListener('message', (e/*: MessageEvent*/) => {
    try {
      if (e.origin !== origin)
        return;
      const message = m.castWWWMessage(e.data);
      switch (message.type) {
        case 'sesame:prompt-link-grant':
          for (const listener of promptGrantListeners) listener(message);
          return;
        case 'sesame:consumer-state':
          for (const listener of stateListeners) listener(message);
          return;
      }
    } catch (error) {}
  });
  const addPromptGrantListener = (listener) => {
    promptGrantListeners.add(listener);
    return { remove() { promptGrantListeners.delete(listener) }}
  };
  const addStateListener = (listener) => {
    stateListeners.add(listener);
    return { remove() { stateListeners.delete(listener) }}
  };
  const send = (message) => {
    (window.opener || window.parent).postMessage(message, origin);
  };

  return {
    send,
    addPromptGrantListener,
    addStateListener,
  };
}

export const createConsumerMessenger = async (targetURL/*: URL*/, targetWindow/*: WindowProxy*/)/*: Promise<ConsumerMessenger>*/ => {
  const updateLinkedIdentityListeners = new Set();
  const cannotGrantListeners = new Set();

  return new Promise(resolve => {
    window.addEventListener('message', (e/*: MessageEvent*/) => {
      try {
        if (e.origin !== targetURL.origin)
          return;
        const message = m.castWWWMessage(e.data);
        switch (message.type) {
          case 'sesame:update-link-grant':
            for (const listener of updateLinkedIdentityListeners)
              listener(message);
            return;
          case 'sesame:cannot-grant':
            for (const listener of cannotGrantListeners)
              listener(message);
            return;
          case 'sesame:identity-provider-ready':
            resolve(messeger);
            return;
        }
      } catch (error) {}
    });
  
    const addUpdateLinkedIdentityListener = (listener) => {
      updateLinkedIdentityListeners.add(listener);
      return { remove() { updateLinkedIdentityListeners.delete(listener) }}
    };
    const addCannotGrantListener = (listener) => {
      cannotGrantListeners.add(listener);
      return { remove() { cannotGrantListeners.delete(listener) }}
    }
    const send = (message) => {
      targetWindow.postMessage(message, targetURL.origin);
    };

    const messeger = {
      send,
      addUpdateLinkedIdentityListener,
      addCannotGrantListener,
    }
  })
}