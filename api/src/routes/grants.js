// @flow strict
/*:: import type { Services } from '../services.js'; */
/*:: import type { Route } from '@lukekaalim/http-server'; */
import { createJSONResourceRoutes, statusCodes } from '@lukekaalim/http-server';
import { api } from '@astral-atlas/sesame-models';
import { routeOptions } from './meta.js';

export const createGrantRoutes = (s/*: Services*/)/*: Route[]*/ => {

  const grantsIdentityRoutes = createJSONResourceRoutes(api.grantsIdentityResource, {
    ...routeOptions,
    POST: async ({ body: { userId, granteeName }, routeRequest: { headers } }) => {
      const authority = await s.auth.getAuth(headers);
      const { grant, secret } = await s.grant.createIdentity(userId, granteeName, authority);
      return { body: { type: 'created', grant, secret }, status: statusCodes.created };
    },
    DELETE: ({ query: { grantId, userId }, body }) => {

      // a total lie!

      return { body: { type: 'revoked' }, status: statusCodes.ok };
    }
  });

  const grantsIdentityValidateRoutes = createJSONResourceRoutes(api.grantsLinkValidateResource, {
    ...routeOptions,
    POST: async ({ body: { proof }, headers }) => {
      const authority = await s.auth.getAuth(headers);
      throw new Error();
      //return { status: 200, body: { type: 'valid', grant: {} } };
    },
  });

  return [
    ...grantsIdentityValidateRoutes,
    ...grantsIdentityRoutes,
  ];
};