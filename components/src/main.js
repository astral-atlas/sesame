// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { IdentityGrant } from '@astral-atlas/sesame-models'; */
import { h } from 'preact';
import { useEffect, useMemo } from 'preact/hooks';
import { castWWWMessage } from '@astral-atlas/sesame-models';

/*::
export type AuthorizerFrameProps = {|
  identityOrigin: URL,
  onIdentityGrant?: (grant: IdentityGrant, secret: string) => mixed
|};
*/
const containerStyle = {
  resize: 'both',
  overflow: 'hidden'
};

const style = {
  border: 'none',
  margin: 0,
  padding: 0,
  width: '100%',
  height: '100%'
};

export const AuthorizerFrame = ({
  identityOrigin,
  onIdentityGrant = () => {},
}/*: AuthorizerFrameProps*/)/*: Node*/ => {
  useEffect(() => {
    const onMessage = (event/*: MessageEvent*/) => {
      try {
        const message = castWWWMessage(event.data);
        switch (message.type) {
          case 'sesame:new-identity-grant':
            return onIdentityGrant(message.grant, message.secret);
          default:
            return;
        }
      } catch (err) {}
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const src = new URL('/frame/login.html', identityOrigin);
  src.searchParams.append('service', encodeURI(window.location.href));

  return h('div', { style: containerStyle },
    h('iframe', { style, src: src.href, width: 512, height: 128 })
  );
};
