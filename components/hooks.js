// @flow strict
/*:: import type { UpdateLinkedIdentityGrant } from '@astral-atlas/sesame-models'; */
/*:: import type { ConsumerMessenger } from './message.js'; */

import { useEffect, useState } from "preact/hooks";
import { createConsumerMessenger } from "./message.js";

export const useConsumerMessenger = (
  identityOrigin/*: string*/,
  onMessage/*: (message: UpdateLinkedIdentityGrant) => mixed*/ = () => {}
)/*: null | ConsumerMessenger*/ => {
  const [messenger, setMessenger] = useState(null);

  useEffect(() => {
    const url = new URL('/frame/authorizer.html', identityOrigin);
    url.searchParams.append('service', document.location.origin);

    const iframeElement = document.createElement('iframe');
    iframeElement.setAttribute('src', url.href);
    iframeElement.style.display = 'none';

    const { body } = document;

    if (!body)
      throw new Error();

    body.appendChild(iframeElement);
    createConsumerMessenger(iframeElement)
      .then(messenger => setMessenger(messenger));

    return () => {
      body.removeChild(iframeElement);
    }
  }, [identityOrigin]);

  useEffect(() => {
    if (!messenger)
      return;
    const { remove } = messenger.addUpdateLinkedIdentityListener(onMessage);
    return () => remove();
  }, [messenger])

  return messenger;
};