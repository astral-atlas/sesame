// @flow strict
/*:: import type { UserID, LoginGrant } from '@astral-atlas/sesame-models'; */
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */

import { api } from '@astral-atlas/sesame-models';
import { createJSONResourceClient } from '@lukekaalim/http-client';

/*::
export type LoginGrantClient = {
  create: (userId: UserID) => Promise<{ grant: LoginGrant, secret: string }>,
};
*/

export const createLoginGrantClient = (httpClient/*: HTTPClient*/, baseURL/*: URL*/)/*: LoginGrantClient*/ => {
  const grantsResource = createJSONResourceClient(api.grantsLogin, httpClient, baseURL.href);
  const create = async (userId) => {
    const { body: { grant, secret } } = await grantsResource.POST({ body: { userId }});
    return { grant, secret };
  };

  return {
    create,
  };
};
