// @flow strict
/*:: import type { Route, RouteRequest, RouteResponse, RouteHandler } from '@lukekaalim/server'; */
/*:: import type { JSONValue } from '@lukekaalim/cast'; */
/*:: import type { Services } from './services'; */
/*:: import type { Admin, User } from './models'; */
import { createHash } from 'crypto';
import { api } from '@astral-atlas/sesame-models';
import server from '@lukekaalim/server';
const { resource, application, empty, statusCodes, createGETHandler, createPOSTHandler } = server;

const { ok, created, internalServerError } = statusCodes;

const createETagFromBody = (response) => {
  const { body } = response;
  const hash = createHash('sha256');
  if (typeof body === 'string')
    hash.update(body);
  else if (body === null)
    hash.update('');
  else if (body instanceof Buffer)
    hash.update(body)
  else
    return;
  return hash.digest('hex');
}

export const createRoutes = (services/*: Services*/)/*: Route[]*/ => {
  const withRouteMiddleware = (handler/*: RouteHandler*/)/*: RouteHandler*/ => async (request) => {
    try {
      const response =  await handler(request);
      const ETag = createETagFromBody(response);
      const requestETagMatch = request.headers['if-none-match'];
      if (requestETagMatch && requestETagMatch === ETag)
        return empty(statusCodes.notModified);
      const responseWithETag = {
        ...response,
        headers: ETag ? { ...response.headers, 'ETag': ETag } : response.headers,
      }
      return responseWithETag;
    } catch (error) {
      console.error(error);
      return application.json(internalServerError, { error: { message: error.message, stack: error.stack } });
    }
  };
  const access = {
    origins: { type: 'wildcard' },
    headers: ['content-type', 'authorization', 'cache-control'],
    cache: 120,
  };
  const cache = {
    maxAge: 0
  };

  const userSelf = resource({ path: api.GETSelf.path, access, cache, methods: {
    GET: withRouteMiddleware(createGETHandler(api.GETSelf, async ({ headers }) => {
      const user = await services.auth.authorizeGuest(headers) || null;
      const access = await services.access.getAccess(headers);
      const admin = user && user.adminId ? await services.user.getAdminFromUser(user.id) : null;
      
      return { status: ok, body: { user, admin, access } };
    })),
  }});
  const user = resource({ path: api.GETUserList.path, access, cache, methods: {
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

  const accessAccept = resource({ path: api.POSTAcceptAccess.path, access, cache, methods: {
    POST: withRouteMiddleware(createPOSTHandler(api.POSTAcceptAccess, async ({ body: { deviceName, offerProof }, headers }) => {
      const grantProof = await services.access.createNewGrant(offerProof, deviceName, headers['origin']);
      const user = await services.user.getUserById(grantProof.subject);
      return { status: ok, body: { grantProof, user } };
    })),
  }});
  const accessOffer = resource({ path: api.POSTCreateAccessOffer.path, access, cache, methods: {
    POST: withRouteMiddleware(createPOSTHandler(api.POSTCreateAccessOffer, async ({ body: { subject }, headers }) => {
      const user = await services.auth.authorizeUser(headers);
      const offerProof = await services.access.createNewOffer(user.id, subject);
      return { status: ok, body: { offerProof } };
    })),
  }});
  const accessList = resource({ path: api.GETAccessList.path, access, cache, methods: {
    GET: withRouteMiddleware(createGETHandler(api.GETAccessList, async ({ query: { subject }, headers }) => {
      const self = await services.auth.authorizeUser(headers);
      const { access } = await services.access.listAccessGrants(subject, self.id);
      return { status: ok, body: { access } };
    })),
  }});
  const accessRevoke = resource({ path: api.POSTAccessRevoke.path, access, cache, methods: {
    POST: withRouteMiddleware(createPOSTHandler(api.POSTAccessRevoke, async ({ body: { subject, accessId }, headers }) => {
      const { id } = await services.auth.authorizeUser(headers);
      await services.access.revokeAccess(subject, accessId, id);
      return { status: ok, body: null };
    })),
  }});
  const admins = resource({ path: api.POSTNewAdmin.path, access, cache, methods: {
    POST: withRouteMiddleware(createPOSTHandler(api.POSTNewAdmin, async ({ body: { subject }, headers }) => {
      const self = await services.auth.authorizeAdmin(headers);
      const newAdmin = await services.user.createAdmin(subject);
      return { status: ok, body: { admin: newAdmin } };
    })),
  }});

  return [
    ...user,
    ...userSelf,
    ...accessAccept,
    ...accessOffer,
    ...accessList,
    ...accessRevoke,
    ...admins,
  ];
};
