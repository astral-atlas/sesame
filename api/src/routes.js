// @flow strict
/*:: import type { Route, RouteRequest, RouteResponse, RouteHandler } from '@lukekaalim/server'; */
/*:: import type { JSONValue } from '@lukekaalim/cast'; */
/*:: import type { Services } from './services'; */
/*:: import type { Admin, User } from './models'; */
const { api: { GETSelf } } = require('@astral-atlas/sesame-models');
const { api, toPOSTUserRequest, toPOSTLoginRequest, toPOSTAdminRequest, toPUTUserRequest } = require('./models');
const { toObject, toString, parse } = require('@lukekaalim/cast');
const { resource, readJSONBody, getContent, application, statusCodes, createGETHandler, createPOSTHandler } = require('@lukekaalim/server');
const { getAuthorization } = require('@lukekaalim/server/src/authorization');
const { createPUTHandler } = require('@lukekaalim/server/src/endpoint');

const options = {
  allowedOrigins: { type: 'wildcard' },
  authorized: true,
  cacheSeconds: 600,
};
const { ok, created, internalServerError } = statusCodes;

const createRoutes = (services/*: Services*/)/*: Route[]*/ => {
  const withRouteMiddleware = (handler/*: RouteHandler*/)/*: RouteHandler*/ => async (request) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error(error);
      return application.json(internalServerError, { error: { message: error.message, stack: error.stack } });
    }
  };
  const access = {
    origins: { type: 'wildcard' },
    headers: ['content-type', 'authorization']
  };

  const userSelf = resource({ path: api.GETSelf.path, access, methods: {
    GET: withRouteMiddleware(createGETHandler(api.GETSelf, async ({ headers }) => {
      const self = await services.auth.authorizeUser(headers);
      const access = await services.access.getAccessGrant(headers);
      if (self.adminId)
        return { status: ok, body: { self, admin: await services.user.getAdminFromUser(self.id), access } };
      return { status: ok, body: { self, admin: null, access } };
    })),
  }});
  const user = resource({ path: api.GETUserList.path, access, methods: {
    GET: withRouteMiddleware(createGETHandler(api.GETUserList, async ({ headers }) => {
      const [,] = await services.auth.authorizeAdmin(headers);
      const users = await services.user.listSomeUsers();
      return { status: ok, body: { users } };
    })),
    POST: withRouteMiddleware(createPOSTHandler(api.POSTNewUser, async ({ headers, body: { name } }) => {
      const [admin,] = await services.auth.authorizeAdmin(headers);
      const newUser = await services.user.createUser(name, admin.id);
      return { status: created, body: { newUser: newUser } };
    })),
  }});

  const accessAccept = resource({ path: api.POSTAcceptAccess.path, access, methods: {
    POST: withRouteMiddleware(createPOSTHandler(api.POSTAcceptAccess, async ({ body: { deviceName, offerProof }, headers }) => {
      const grantProof = await services.access.createNewGrant(offerProof, deviceName, headers['origin']);
      return { status: ok, body: { grantProof } };
    })),
  }});
  const accessOffer = resource({ path: api.POSTCreateAccessOffer.path, access, methods: {
    POST: withRouteMiddleware(createPOSTHandler(api.POSTCreateAccessOffer, async ({ body: { subject }, headers }) => {
      const user = await services.auth.authorizeUser(headers);
      const offerProof = await services.access.createNewOffer(user.id, subject);
      return { status: ok, body: { offerProof } };
    })),
  }});
  const accessList = resource({ path: api.GETAccessList.path, access, methods: {
    GET: withRouteMiddleware(createGETHandler(api.GETAccessList, async ({ query: { userId }, headers }) => {
      throw new Error('Unimplemented functionality')
    })),
  }});
  const accessRevoke = resource({ path: api.POSTAccessRevoke.path, access, methods: {
    POST: withRouteMiddleware(createPOSTHandler(api.POSTAccessRevoke, async ({ body: { subject }, headers }) => {
      throw new Error('Unimplemented functionality')
    })),
  }});

  return [
    ...user,
    ...userSelf,
    ...accessAccept,
    ...accessOffer,
  ];
  /*
  const users = resource({ path: '/users', methods: {
    GET: createAdminHandler(async ({}, user, admin) => {
      const users = await services.user.listSomeUsers();
      return application.json(ok, { users });
    }),
    POST: createAdminHandler(async ({ headers, incoming }, user, admin) => {
      const userRequestBody = toPOSTUserRequest(await readJSONBody(incoming, getContent(headers)));
      const newUser = await services.user.createUser(userRequestBody.name, admin.id);
      return application.json(created, { newUser });
    }),
  }});
  const admins = resource({ path: '/admins', methods: {
    POST: createAdminHandler(async ({ headers, incoming }, user, admin) => {
      const adminRequestBody = toPOSTAdminRequest(await readJSONBody(incoming, getContent(headers)));
      const newAdmin = await services.user.createAdmin(adminRequestBody.userId);
      return application.json(created, { newAdmin });
    }),
  }});
  const loginGrants = resource({ path: '/grants/login', methods: {
    POST: createUserHandler(async ({ headers, incoming }, user) => {
      const loginRequestBody = toPOSTLoginRequest(await readJSONBody(incoming, getContent(headers)));
      const loginToken = await services.access.createNewLogin(user.id, loginRequestBody.subjectId);
      return application.json(created, { loginToken });
    }),
  }});
  const accessGrants = resource({ path: '/grants/access', methods: {
    POST: createSesameHandler(async ({ headers, incoming }) => {
      const accessRequestBody = toPOSTAccessRequest(await readJSONBody(incoming, getContent(headers)));
      const accessToken = await services.access.createNewAccess(accessRequestBody.loginToken, accessRequestBody.deviceName, headers['origin'] || null);
      return application.json(created, { accessToken });
    }),
  }});
  const tables = resource({ path: '/tables', methods: {
    GET: createAdminHandler(async ({ query }, user, admin) => {
      const getTable = () => {
        switch (query.get('tableName')) {
          case 'users':
            return services.tables.users;
          case 'grants/login':
            return services.tables.loginGrants;
          case 'grants/access':
            return services.tables.accessGrants;
          default:
            throw new Error();
        }
      };
      const table = getTable();
      const { result: tableContents } = await table.scan();
      return application.json(ok, { tableContents });
    }),
  }})

  return [
    ...loginGrants,
    ...accessGrants,
    ...self,
    ...admins,
    ...users,
    ...tables,
  ];
  */
};

module.exports = {
  createRoutes,
};
