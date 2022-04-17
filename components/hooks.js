// @flow strict
/*:: import type { UpdateLinkedIdentityGrant, CannotGrant, LinkProof } from '@astral-atlas/sesame-models'; */
/*:: import type { ConsumerMessenger } from './message.js'; */

import { useEffect, useState } from "preact/hooks";
import { createConsumerMessenger } from "./message.js";

/*::
export type UseConsumerMessengerOptions = {
  proof?: ?LinkProof,
  onGrant?: (message: UpdateLinkedIdentityGrant) => mixed,
  onReject?: (message: CannotGrant) => mixed,
}
*/

export const useConsumerMessenger = (
  identityOrigin/*: ?string*/,
  { onGrant = () => {}, onReject = () => {}, proof }/*: UseConsumerMessengerOptions*/ = {},
)/*: null | ConsumerMessenger*/ => {
  const [messenger, setMessenger] = useState(null);

  useEffect(() => {
    if (!identityOrigin)
      return;

    const url = new URL('/frame/authorizer.html', identityOrigin);
    url.searchParams.append('service', document.location.origin);

    const iframeElement = document.createElement('iframe');
    iframeElement.setAttribute('src', url.href);
    iframeElement.style.display = 'none';

    const { body } = document;

    if (!body)
      throw new Error();

    body.appendChild(iframeElement);
    createConsumerMessenger(new URL(iframeElement.src), iframeElement.contentWindow)
      .then(messenger => setMessenger(messenger));

    return () => {
      body.removeChild(iframeElement);
    }
  }, [identityOrigin]);

  useEffect(() => {
    if (!messenger)
      return;
    const uli = messenger.addUpdateLinkedIdentityListener(onGrant);
    const cg = messenger.addCannotGrantListener(onReject);
    messenger.send({ type: 'sesame:consumer-state', proof });
    return () => {
      uli.remove();
      cg.remove();
    }
  }, [messenger])

  return messenger;
};