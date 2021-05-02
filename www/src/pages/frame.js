// @flow strict
/*:: import type { Node } from 'preact'; */
import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { AuthorizationForm } from '../components/authorize';
import { useUserSesameClient } from '../hooks/sesameClient';

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
    parent.postMessage({ type: 'sesame_access_offer', offerProof, access }, '*');
  };
  useEffect(() => {
    if (parent === window)
      return;
    window.addEventListener('message', onMessage);
    parent.postMessage({ type: 'init' }, '*');
    return () => window.removeEventListener(onMessage);
  }, []);
  if (parent === window)
    return null;
  return [
    h(AuthorizationForm, { onAuthorizeClick }),
  ];
};