// @flow strict
/*:: import type { ConsumerMessenger } from './message.js'; */
/*:: import type { Node } from 'preact'; */
import { h } from 'preact';
import { useRef, useEffect } from 'preact/hooks';
import { createConsumerMessenger } from './message.js';
/*::
export type AuthorizerFrameProps = {
  origin: string,
  service?: string,
  onMessengerLoad: ConsumerMessenger => mixed,
};
*/

export const AuthorizerFrame = ({ origin, service = document.location.origin, onMessengerLoad }/*: AuthorizerFrameProps*/)/*: Node*/ => {
  const url = new URL('/frame/authorizer.html', origin);
  url.searchParams.append('service', service);
  const ref = useRef/*:: <?HTMLIFrameElement>*/();

  useEffect(() => {
    const { current: iframeElement } = ref;
    if (!iframeElement)
      return;

    createConsumerMessenger(iframeElement)
      .then(onMessengerLoad);
  }, [])

  return [
    h('iframe', { src: url.href, ref, style: { display: 'none' } })
  ]
};
