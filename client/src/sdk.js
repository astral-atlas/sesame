// @flow strict
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { Authorization } from '@lukekaalim/net-description'; */
/*:: import type { User, Admin, UserID, Proof, ServiceProof, LinkGrant } from '@astral-atlas/sesame-models'; */

/*:: import type { LoginGrantClient } from './login.js'; */
/*:: import type { UserClient } from './user.js'; */

import { encodeProofToken, decodeProofToken, accessAPI, usersResourceDescription } from '@astral-atlas/sesame-models';
import { createAuthorizedClient } from '@lukekaalim/http-client';
import { decodeAuthorizationHeader } from '@lukekaalim/net-description';

import { createJSONResourceClient } from "@lukekaalim/http-client/resource";

/*::
export type SesameSDK = {
  authorize: (authorizationHeader: string) => Promise<{ type: 'valid', grant: LinkGrant } | { type: 'invalid', reason: string }>,
  getUser: (userId: UserID) => Promise<User>,
};
*/

export const createSesameSDK = (baseURL/*: URL*/, httpClient/*: HTTPClient*/, serviceProof/*: ServiceProof*/)/*: SesameSDK*/ => {
  const serviceToken = encodeProofToken(serviceProof);

  const authorizedClient = createAuthorizedClient(httpClient, { type: 'bearer', token: serviceToken });
  const valiateResource = createJSONResourceClient(accessAPI['/grants/link/validate'], authorizedClient, baseURL.href);
  const userResource = createJSONResourceClient(usersResourceDescription, authorizedClient, baseURL.href);

  const authorize = async (authorizationHeader) => {
    const authorization = decodeAuthorizationHeader(authorizationHeader);
    if (authorization.type !== 'bearer')
      return { type: 'invalid', reason: `Only Bearer authorization is accepted` };
    const proof = decodeProofToken(authorization.token);
    if (proof.type !== 'link')
      return { type: 'invalid', reason: `SDK can only authorize Link tokens, ${proof.type} token was provided instead` };
    
    const { body } = await valiateResource.POST({ body: { proof }})
    if (body.type !== 'valid')
      return { type: 'invalid', reason: `API said no` };

    return { type: 'valid', grant: body.grant };
  };
  const getUser = async (userId) => {
    const { body: { user } } = await userResource.GET({ query: { userId }});
    return user;
  };

  return {
    authorize,
    getUser,
  };
};