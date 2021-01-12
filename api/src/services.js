// @flow strict
/*:: import type {
  Admin, AdminID,
  User, UserID,
  AccessToken, AccessTokenID,
  LoginToken, LoginTokenID
} from '@astral-atlas/sesame-models'; */
/*:: import type { Authorization } from '@lukekaalim/server'; */
const { v4: uuid } = require('uuid');
const { async: asyncCryptoString } = require('crypto-random-string');
const { toObject, toString } = require('@lukekaalim/cast');
const { toAccessTokenId } = require('@astral-atlas/sesame-models');

/*::
export type Table<Key, Row> = {
  get: (key: Key) => Promise<?Row>,
  set: (key: Key, value: ?Row) => Promise<void>
};
*/
const createTable = /*::<K, R>*/()/*: Table<K, R>*/ => {
  const data = new Map/*::<K, R>*/();
  const get = async (key) => {
    return data.get(key);
  };
  const set = async (key, value) => {
    if (!value)
      data.delete(key);
    else
      data.set(key, value);
  };
  return {
    get,
    set,
  };
};

/*::
export type TableServices = {
  admins: Table<AdminID, Admin>,
  users: Table<UserID, User>,
  loginTokens: Table<LoginTokenID, LoginToken>,
  accessTokens: Table<AccessTokenID, AccessToken>,
};
*/
const createTableServices = async ()/*: Promise<TableServices>*/ => {
  const admins = createTable();
  const users = createTable();
  const loginTokens = createTable();
  const accessTokens = createTable();
  return {
    admins,
    users,
    loginTokens,
    accessTokens,
  };
};

/*::
export type UserService = {
  createAdmin(userId: UserID): Promise<?Admin>,
  createUser(name: string, creatorAdminId: ?AdminID): Promise<User>,
  getAdminFromUser(id: UserID): Promise<?Admin>,
};
*/

const createUserService = (tables/*: TableServices*/)/*: UserService*/ => {
  const getAdminFromUser = async (id) => {
    const user = await tables.users.get(id);
    if (!user || !user.adminId)
      return null;
    const admin = await tables.admins.get(user.adminId);
    if (!admin)
      return null;
    return admin;
  };
  const createUser = async (name, creatorAdminId = null) => {
    const newUser = {
      id: uuid(),
      name,
      creatorAdminId,
      adminId: null,
    };
    await tables.users.set(newUser.id, newUser);
    return newUser;
  }
  const createAdmin = async (userId) => {
    const user = await tables.users.get(userId);
    if (!user)
      return null;
    if (user.adminId)
      return null;

    const newAdmin = {
      id: uuid(),
      userId: user.id,
    };
    const updatedUser = {
      ...user,
      adminId: newAdmin.id,
    };
    await tables.admins.set(newAdmin.id, newAdmin);
    await tables.users.set(updatedUser.id, updatedUser);
    return newAdmin;
  }

  return {
    getAdminFromUser,
    createUser,
    createAdmin,
  }
}

/*::
export type TokenService = {
  createLoginToken(userId: UserID): Promise<LoginToken>,
  consumeLoginToken(id: LoginTokenID, secret: string, { host?: ?string }): Promise<?AccessToken>,
  consumeAccessToken(id: AccessTokenID, secret: string, { host?: ?string }): Promise<?User>,
};
*/

const createTokenService = (tables/*: TableServices*/)/*: TokenService*/ => {
  const createLoginToken = async (userId) => {
    const newLoginToken = {
      id: uuid(),
      secret: await asyncCryptoString({ length: 32, type: 'url-safe' }),
      accessTokenId: null,
      userId,
    };
    await tables.loginTokens.set(newLoginToken.id, newLoginToken);
    return newLoginToken;
  };
  const consumeLoginToken = async (id, secret, { host = null }) => {
    const loginToken = await tables.loginTokens.get(id);
    if (!loginToken || loginToken.secret !== secret || loginToken.accessTokenId)
      return null;
      
    const newAccessToken = {
      id: uuid(),
      secret: await asyncCryptoString({ length: 32, type: 'url-safe' }),
      host,
      userId: loginToken.userId,
      status: 'valid',
    };
    const updatedLoginToken = {
      ...loginToken,
      accessTokenId: newAccessToken.id,
    };
    await tables.accessTokens.set(newAccessToken.id, newAccessToken);
    await tables.loginTokens.set(updatedLoginToken.id, updatedLoginToken);

    return newAccessToken;
  };
  const consumeAccessToken = async (id, secret, { host }) => {
    const accessToken = await tables.accessTokens.get(id);
    if (!accessToken || accessToken.secret !== secret)
      return null;
    if (accessToken.host !== host)
      return null;
    
    const user = await tables.users.get(accessToken.userId);
    if (!user)
      return null;
    
    return user;
  };

  return {
    createLoginToken,
    consumeLoginToken,
    consumeAccessToken,
  }
};

/*::
export type AuthorizationService = {
  getUser(authorization: Authorization, host: ?string): Promise<?User>,
};
*/

const toDecodedAuthorization = (v) => {
  const object = toObject(v);
  return {
    id: toAccessTokenId(object.id),
    secret: toString(object.secret),
  };
}

const createAuthorizationService = (tokens/*: TokenService*/)/*: AuthorizationService*/ => {
  const getUser = async (authorization, host = null) => {
    switch (authorization.type) {
      case 'bearer': {
        const bearerToken = Buffer.from(authorization.token, 'base64').toString('utf8');
        const { id, secret } = toDecodedAuthorization(JSON.parse(bearerToken));
        return await tokens.consumeAccessToken(id, secret, { host })
      }
      default:
        return null;
    }
  };

  return {
    getUser,
  };
};

/*::
export type Services = {
  tokens: TokenService,
  tables: TableServices,
  auth: AuthorizationService,
  user: UserService,
};
*/

const createServices = async ()/*: Promise<Services>*/ => {
  const tables = await createTableServices();
  const tokens = createTokenService(tables);
  const auth = createAuthorizationService(tokens);
  const user = createUserService(tables);

  return {
    tables,
    tokens,
    auth,
    user
  };
};

module.exports = {
  createServices,
};