// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { UpdateLinkedIdentityGrant, CannotGrant, LinkProof, LinkGrant } from '@astral-atlas/sesame-models'; */
import { h } from 'preact';
import { createConsumerMessenger } from "./message";

/*::
export type MultistrategyLoginButtonProps = {
  sesameURL: URL,
  onLinkGrantUpdate?: (update: UpdateLinkedIdentityGrant) => mixed,
};
*/

/**
 * Opens a popup window requesting a link identity grant
 * @param {URL} sesameURL 
 * @returns Promise<UpdateLinkedIdentityGrant>
 */
export const requestLinkGrant = async (
  sesameURL/*: URL*/
)/*: Promise<UpdateLinkedIdentityGrant>*/ => {
  const requestingService = new URL(document.location.href);
  const popoutURL = new URL('/frame/popoutAuth.html', sesameURL);
  popoutURL.searchParams.append('service', requestingService.origin);

  const sesamePopoutWindow = window.open(popoutURL, "_blank", "popup,width=700,height=700");
  
  const messeger = await createConsumerMessenger(popoutURL, sesamePopoutWindow);

  return new Promise(resolve => {
    messeger.addUpdateLinkedIdentityListener((update) => {
      sesamePopoutWindow.close();
      resolve(update)
    })
  })
};
