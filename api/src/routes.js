// @flow strict
/*:: import type { Route } from '@lukekaalim/http-server'; */
/*:: import type { Services } from './services.js'; */
import { createGrantRoutes } from './routes/grants.js';
import { createUsersRoutes } from './routes/users.js';

const loggingMiddleware = route => {
  const loggedRoute/*: Route*/ = {
    ...route,
    handler: async (request) => {
      const requestLogEntry = {
        path: request.path,
        query: request.query,
        requestHeaders: request.headers,
        method: request.method,
        type: 'REQUEST'
      };
      console.log(requestLogEntry);
      try {
        const response = await route.handler(request);
        const responseLogEntry = {
          ...requestLogEntry,
          responseHeaders: response.headers,
          status: response.status,
          type: 'RESPONSE'
        };
        console.log(responseLogEntry);
        return response;
      } catch (error) {
        console.error(error);
        return { status: 500, body: null, headers: {} };
      }
    }
  };

  return loggedRoute;
}

export const createRoutes = (services/*: Services*/)/*: Route[]*/ => {
  return [
    ...createGrantRoutes(services),
    ...createUsersRoutes(services),
  ].map(loggingMiddleware);
};

