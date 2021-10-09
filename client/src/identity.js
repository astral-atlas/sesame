// @flow strict
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { JSONValue } from '@lukekaalim/cast'; */
/*:: import type { User, Admin, UserID, APIResponse, IdentityGrant, IdentityProof } from '@astral-atlas/sesame-models'; */
import { createJSONResourceClient } from '@lukekaalim/http-client';
import { api } from '@astral-atlas/sesame-models';

const assertSuccess = /*:: <T: { type: any }>*/(response/*: APIResponse<T>*/)/*: T*/ => {
  switch (response.type) {
    case 'error':
      throw new Error();
    default:
      return response;
  }
}

/*::
export type IdentityGrantClient = {
  create: (userId: UserID, service: string, granteeName: string) => Promise<{ grant: IdentityGrant, secret: string }>
};
*/
export const createIdentityGrantClient = (httpClient/*: HTTPClient*/, baseURL/*: URL*/)/*: IdentityGrantClient*/ => {
  const identityGrantAPI = createJSONResourceClient(api.grantsIdentityResource, httpClient, baseURL.href);

  return {
    async create (userId, granteeName) {
      const { body } = await identityGrantAPI.POST({ body: { userId, granteeName } });
      const { grant, secret } = assertSuccess(body);
      return { grant, secret };
    },
  }
};
