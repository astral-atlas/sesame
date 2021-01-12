// @flow strict
/*:: import type { Route } from '@lukekaalim/server'; */
/*:: import type { Services } from './services'; */
const { toLoginTokenId } = require('@astral-atlas/sesame-models');
const { toObject, toString } = require('@lukekaalim/cast');
const { resource, json: { ok, notFound, forbidden } } = require('@lukekaalim/server');

const options = {

};

const toLoginParams = (v) => {
  const object = toObject(v);
  return {
    id: toLoginTokenId(object.id),
    secret: toString(object.secret),
  };
}

const createRoutes = (services/*: Services*/)/*: Route[]*/ => {
  const loginRoutes = resource('/login', {
    async post({ query: { userId }, auth, headers }) {
      const host = headers['host'];
      const user = await services.auth.getUser(auth, host);
      if (!user)
        return forbidden();
      const admin = await services.user.getAdminFromUser(user.id);
      if (user.id !== userId && !admin)
        return forbidden();

      return ok(await services.tokens.createLoginToken(userId));
    }
  });
  const accessRoutes = resource('/access', {
    async post({ validateJSON, headers }) {
      const host = headers['host'];
      const { id, secret } = await validateJSON(toLoginParams);

      const accessToken = await services.tokens.consumeLoginToken(id, secret, { host });

      return ok(accessToken);
    },
  }, options);
  const selfRoutes = resource('/self', {
    async get({ headers, auth }) {
      const host = headers['host'];
      const user = await services.auth.getUser(auth, host);
      if (!user)
        return notFound();
      return ok(user);
    }
  }, options);
  const userRoutes = resource('/user', {
    async post({ validateJSON, headers, auth }) {
      const host = headers['host'];
      const user = await services.auth.getUser(auth, host);
      if (!user)
        return forbidden();
      const admin = await services.user.getAdminFromUser(user.id);
      if (!admin)
        return forbidden();
      const { name } = await validateJSON(v => {
        const object = toObject(v);
        return {
          name: toString(object.name),
        };
      });
      
      const newUser = await services.user.createUser(name, admin.id);
      return ok(newUser);
    },
    async patch({ }) {
      return ok();
    },
    async delete({  }) {
      return ok();
    }
  }, options);

  return [
    ...loginRoutes,
    ...accessRoutes,
    ...selfRoutes,
    ...userRoutes,
  ];
};

module.exports = {
  createRoutes,
};
