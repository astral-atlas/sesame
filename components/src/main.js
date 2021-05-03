// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { AccessOfferProof } from '@astral-atlas/sesame-models'; */
import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { toWWWMessage } from '@astral-atlas/sesame-models';

/*::
export type AuthorizerFrameProps = {|
  wwwBaseURL: URL,
  onAuthorizeOffer?: (offer: AccessOfferProof, deviceName: null | string) => mixed
|};
*/

const style = {
  border: 'none',
  borderRadius: '4px'
};

export const AuthorizerFrame = ({
  wwwBaseURL,
  onAuthorizeOffer = () => {},
}/*: AuthorizerFrameProps*/)/*: Node*/ => {
  useEffect(() => {
    const onMessage = (event/*: MessageEvent*/) => {
      try {
        const message = toWWWMessage(event.data);
        switch (message.type) {
          case 'sesame-www-offer':
            return onAuthorizeOffer(message.offer, message.deviceName);
          default:
            return;
        }
      } catch (err) {}
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
  return h('iframe', { style, src: new URL('/frame', wwwBaseURL), width: 512, height: 128 });
};