// @flow strict
/*:: import type { UserID, User } from '@astral-atlas/sesame-models'; */
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */

import { api } from '@astral-atlas/sesame-models';
import { createJSONResourceClient } from '@lukekaalim/http-client';

/*::
export type UserClient = {
  get: (userId: UserID) => Promise<User>,
  getSelf: () => Promise<User>,
  update: (userId: UserID, values: { name: string }) => Promise<User>,
};
*/

export const createUserClient = (httpClient/*: HTTPClient*/, baseURL/*: URL*/)/*: UserClient*/ => {
  const userResource = createJSONResourceClient(api.usersResourceDescription, httpClient, baseURL.href)
  const userSelfResource = createJSONResourceClient(api.usersSelfResourceDescription, httpClient, baseURL.href)

  const get = async (userId) => {
    const { body: response } = await userResource.GET({ query: { userId } });
    return response.user;
  };
  const update = async (userId, { name }) => {
    const { body: { user } } = await userResource.PUT({ query: { userId }, body: { name } });
    return user;
  }
  const getSelf = async () => {
    const { body: { user } } = await userSelfResource.GET();
    return user;
  }

  return {
    get,
    update,
    getSelf,
  };
};