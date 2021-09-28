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
  });

  return [
    ...usersRoutes,
  ];
};