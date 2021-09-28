// @flow strict
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { Authorization } from '@lukekaalim/net-description'; */
/*:: import type { User, Admin, UserID, Proof } from '@astral-atlas/sesame-models'; */
/*:: import type { IdentityGrantClient } from './api.js'; */
/*:: import type { LoginGrantClient } from './login.js'; */
/*:: import type { UserClient } from './user.js'; */
import { encodeProofToken } from '@astral-atlas/sesame-models';
import { createAuthorizedClient } from '@lukekaalim/http-client';

import { createIdentityGrantClient } from './api.js';
import { createLoginGrantClient } from './login.js';
import { createUserClient } from './user.js';

/*::
export type SesameClient = {
  user: UserClient,
  grants: {
    identity: IdentityGrantClient,
    login: LoginGrantClient,
  }
};
*/

export const createClient = (baseURL/*: URL*/, httpClient/*: HTTPClient*/, proof/*: ?Proof*/ = null)/*: SesameClient*/ => {
  const auth = proof ? { type: 'bearer', token: encodeProofToken(proof) } : null;

  const authorizedHttpClient = createAuthorizedClient(httpClient, auth);

  const identity = createIdentityGrantClient(authorizedHttpClient, baseURL);
  const login = createLoginGrantClient(authorizedHttpClient, baseURL);
  const user = createUserClient(authorizedHttpClient, baseURL);

  return {
    user,
    grants: {
      identity,
      login,
    },
  };
};