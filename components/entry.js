// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { IdentityGrant, IdentityProof } from '@astral-atlas/sesame-models'; */
import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { castWWWMessage, encodeProofToken, createIdentityProof } from '@astral-atlas/sesame-models';

/*::
export type AuthorizerFrameProps = {|
  identityOrigin: URL | string,
  onIdentityGrant?: ({ token: string, proof: IdentityProof, grant: IdentityGrant, secret: string }) => mixed
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
            const { grant, secret } = message;
            const proof = createIdentityProof(message.grant, message.secret);
            const token = encodeProofToken(proof);
            return onIdentityGrant({ token, grant, secret, proof });
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
