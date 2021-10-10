// @flow strict
/*:: import type { Services } from '../services.js'; */
/*:: import type { Route } from '@lukekaalim/http-server'; */
import { createJSONResourceRoutes, statusCodes } from '@lukekaalim/http-server';
import { api, accessAPI } from '@astral-atlas/sesame-models';
import { routeOptions } from './meta.js';
import { HTTP_STATUS } from "@lukekaalim/net-description";

export const createGrantRoutes = (s/*: Services*/)/*: Route[]*/ => {

  const grantsIdentityRoutes = createJSONResourceRoutes(api.grantsIdentityResource, {
    ...routeOptions,
    POST: async ({ body: { userId, granteeName }, routeRequest: { headers } }) => {
      const authority = await s.auth.getAuth(headers);
      const { grant, secret } = await s.grant.createIdentity(userId, granteeName, authority);
      return { body: { type: 'created', grant, secret }, status: statusCodes.created };
    },
    DELETE: async ({ query: { grantId, userId }, body, headers }) => {
      const authority = await s.auth.getAuth(headers);
      await s.grant.revokeIdentity(userId, grantId, authority);
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

  const grantsLinkRoutes = createJSONResourceRoutes(accessAPI['/grants/link'], {
    ...routeOptions,
    POST: async ({ body: { target }, headers }) => {
      const authority = await s.auth.getAuth(headers);
      const { grant, secret } = await s.grant.createLink(target, authority);
      
      return { status: HTTP_STATUS.created, body: { type: 'created', grant, secret } };
    },
  });

  return [
    ...grantsLinkRoutes,
    ...grantsIdentityValidateRoutes,
    ...grantsIdentityRoutes,
  ];
};