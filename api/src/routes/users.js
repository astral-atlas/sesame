// @flow strict
/*:: import type { Services } from '../services.js'; */
/*:: import type { Route } from '@lukekaalim/http-server'; */
import { createJSONResourceRoutes, statusCodes } from '@lukekaalim/http-server';
import { api } from '@astral-atlas/sesame-models';
import { routeOptions } from './meta.js';

export const createUsersRoutes = (s/*: Services*/)/*: Route[]*/ => {
  const usersRoutes = createJSONResourceRoutes(api.usersResourceDescription, {
    ...routeOptions,
    GET: async ({ query: { userId }}) => {
      const user = await s.user.getByID(userId);

      return { body: { type: 'found', user }, status: statusCodes.ok };
    },
    POST: async ({ body: { name } }) => {

      const user = await s.user.create(name);

      return { body: { type: 'created', user }, status: statusCodes.created };
    },
    PUT: async ({ query: { userId }, body: { name }, headers }) => {
      const authorization = await s.auth.getAuth(headers);
      const user = await s.user.update(userId, { name }, authorization);

      return { body: { type: 'updated', user }, status: statusCodes.ok };
    },
  });
  const userSelfRoutes = createJSONResourceRoutes(api.usersSelfResourceDescription, {
    ...routeOptions,
    GET: async ({ headers }) => {
      const authorization = await s.auth.getAuth(headers);
      if (authorization.type !== 'identity')
        return { status: statusCodes.forbidden };

      const user = await s.user.getByID(authorization.grant.identity);

      return { body: { type: 'found', user }, status: statusCodes.ok };
    },
  })

  return [
    ...usersRoutes,
    ...userSelfRoutes,
  ];
};