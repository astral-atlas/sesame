// @flow strict
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { AccessGrantProof, AccessOfferProof, User, Admin, UserID, Access, Authorization } from '@astral-atlas/sesame-models'; */
/*:: import type { AccessClient, UserClient, AdminClient } from './api'; */
import { accessGrantProofEncoder } from '@astral-atlas/sesame-models';
import { createNoneAuthorization, createBearerAuthorization, createBasicAuthorization } from '@lukekaalim/http-client';
import { createAccessClient, createUserClient, createAdminClient } from './api.js';

const getAuthorization = (auth/*: Authorization*/) => {
  switch (auth.type) {
    case 'super':
      return createBasicAuthorization(auth.user, auth.pass);
    case 'grant':
      return createBearerAuthorization(accessGrantProofEncoder.encode(auth.proof));
    case 'none':
      return createNoneAuthorization();
    default:
      throw new Error('Unknown auth method provided');
  }
};

/*::
export type SesameClientArgs = {
  base: URL, 
  http: HTTPClient,
  auth?: Authorization
};
export type SesameClient = {
  access: AccessClient,
  user: UserClient,
  admin: AdminClient,
};
*/

export const createClient = ({ base, http, auth = { type: 'none' }}/*: SesameClientArgs*/)/*: SesameClient*/ => {
  const authorization = getAuthorization(auth);
  const service = { baseURL: base, authorization };

  const user = createUserClient(http, service);
  const access = createAccessClient(http, service);
  const admin = createAdminClient(http, service);

  return {
    user,
    access,
    admin,
  };
};