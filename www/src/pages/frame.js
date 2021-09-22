// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { WWWMessage } from '@astral-atlas/sesame-models'; */
import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { AuthorizationForm } from '../components/authorize';

export const FramePage = ()/*: Node*/ => {
  const parent = window.parent;
  const client = useUserSesameClient();
  const onMessage = (event/*: MessageEvent*/) => {

  };
  const onAuthorizeClick = async () => {
    if (!parent)
      return;
    const { access } = await client.getSelfUser();
    const { offerProof } = await client.createAccessOfferForSelf();
    const message/*: WWWMessage*/ = {
      type: 'sesame-www-offer',
      offer: offerProof,
      deviceName: access ? access.grant ? access.grant.deviceName : null : null,
    };
    parent.postMessage(message, '*');
  };
  useEffect(() => {
    if (parent === window)
      return;
    window.addEventListener('message', onMessage);
    const message/*: WWWMessage*/ = {
      type: 'sesame-www-init',
    };
    parent.postMessage(message, '*');
    return () => window.removeEventListener(onMessage);
  }, []);
  if (parent === window)
    return null;
  return [
    h('style', {}, `body { padding: 0; margin: 0; overflow: hidden; }`),
    h(AuthorizationForm, { onAuthorizeClick }),
  ];
};