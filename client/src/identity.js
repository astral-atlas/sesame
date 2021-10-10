// @flow strict
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { JSONValue } from '@lukekaalim/cast'; */
/*:: import type {
  User, Admin, UserID, APIResponse, IdentityGrant,
  IdentityProof, LinkGrant, LinkProof, Proof, IdentityGrantID
} from '@astral-atlas/sesame-models'; */
import { createJSONResourceClient } from '@lukekaalim/http-client';
import { api, accessAPI } from '@astral-atlas/sesame-models';

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
  create: (userId: UserID, granteeName: string) => Promise<{ grant: IdentityGrant, secret: string }>,
  revoke: (userId: UserID, grantId: IdentityGrantID) => Promise<void> ,
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
    async revoke(userId, grantId) {
      const { body: { type } } = await identityGrantAPI.DELETE({ query: { userId, grantId }});
      return;
    }
  }
};

/*::
export type LinkClient = {
  create: (target: string) => Promise<{ grant: LinkGrant, secret: string }>
};
*/
export const createLinkClient = (httpClient/*: HTTPClient*/, baseURL/*: URL*/, proof/*: ?Proof*/)/*: LinkClient*/ => {
  const identityGrantAPI = createJSONResourceClient(accessAPI['/grants/link'], httpClient, baseURL.href);
  
  const create = async (target) => {
    const { body } = await identityGrantAPI.POST({ body: { target } });
    if (body.type !== 'created')
      throw new Error();
    const { secret, grant } = body;
    return { secret, grant };
  }

  return {
    create,
  };
}