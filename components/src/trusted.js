// @flow strict
/*:: import type { Access } from '@astral-atlas/sesame-models'; */
/*:: import type { Node } from 'preact'; */
import { h } from 'preact';
import { useEffect, useRef } from "preact/hooks";
/*::
export type TrustedFrameProps = {
  providerOrigin: string,
  onAccessChange?: (access: Access) => mixed,
};
*/

export const TrustedFrame = ({ onAccessChange, providerOrigin }/*: TrustedFrameProps*/)/*: Node*/ => {
  const iframeRef = useRef/*:: <?HTMLIFrameElement>*/();
  useEffect(() => {
    if (!iframeRef.current)
      return;
    const onMessage = (event/*: MessageEvent*/) => {
      if (event.origin !== providerOrigin)
        return;
      try {
        console.log(event);
      } catch (err) {}
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return h('iframe', {
    ref: iframeRef,
    src: new URL('/trustedFrame.html', providerOrigin)
  });
};