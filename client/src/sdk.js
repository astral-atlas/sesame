// @flow strict
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { Authorization } from '@lukekaalim/net-description'; */
/*:: import type { User, Admin, UserID, Proof, ServiceProof, LinkGrant, LinkProof } from '@astral-atlas/sesame-models'; */

/*:: import type { LoginGrantClient } from './login.js'; */
/*:: import type { UserClient } from './user.js'; */

import { encodeProofToken, decodeProofToken, accessAPI, usersResourceDescription } from '@astral-atlas/sesame-models';
import { createAuthorizedClient } from '@lukekaalim/http-client';
import { decodeAuthorizationHeader } from '@lukekaalim/net-description';

import { createJSONResourceClient } from "@lukekaalim/http-client";

/*::
export type SesameSDK = {
  validateHeader: (authorizationHeader: string) => Promise<{ type: 'valid', grant: LinkGrant } | { type: 'invalid', reason: string }>,
  validateProof: (proof: LinkProof) => Promise<?LinkGrant>,
  getUser: (userId: UserID) => Promise<User>,
};
*/

export const createSesameSDK = (baseURL/*: URL*/, httpClient/*: HTTPClient*/, serviceProof/*: ServiceProof*/)/*: SesameSDK*/ => {
  const serviceToken = encodeProofToken(serviceProof);

  const authorizedClient = createAuthorizedClient(httpClient, { type: 'bearer', token: serviceToken });
  const valiateResource = createJSONResourceClient(accessAPI['/grants/link/validate'], authorizedClient, baseURL.href);
  const userResource = createJSONResourceClient(usersResourceDescription, authorizedClient, baseURL.href);

  const validateHeader = async (authorizationHeader) => {
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
  const validateProof = async (proof) => {
    const { body } = await valiateResource.POST({ body: { proof }})
    if (body.type !== 'valid')
      return null;
    return body.grant;
  };
  const getUser = async (userId) => {
    const { body: { user } } = await userResource.GET({ query: { userId }});
    return user;
  };

  return {
    validateHeader,
    validateProof,
    getUser,
  };
};