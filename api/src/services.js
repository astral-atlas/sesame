// @flow strict
/*:: import type {
  Admin, AdminID,
  User, UserID,
  AccessID, AccessGrant, AccessOffer, AccessRevocation,
  AccessGrantProof, AccessOfferProof,
} from '@astral-atlas/sesame-models'; */
/*:: import type { Cast, JSONValue } from '@lukekaalim/cast'; */
/*:: import type { Authorization, HTTPHeaders } from '@lukekaalim/server'; */
/*:: import type { SesameAPIConfig } from './config'; */
/*:: import type { SuperUser } from './models'; */
const { v4: uuid } = require('uuid');
const { dirname } = require('path');
const { writeFile, readFile, mkdir } = require('fs').promises;
const { async: asyncCryptoString } = require('crypto-random-string');
const { toObject, toString, toArray, parse, stringify } = require('@lukekaalim/cast');
const {
  toAdmin, toUser,
  toLoginGrant, toAccessGrant, toAccessOffer, toAccessRevocation, accessGrantProofEncoder,
} = require('@astral-atlas/sesame-models');
const { getSuperUser } = require('./config');
const { getAuthorization } = require('@lukekaalim/server/src/authorization');

/*::
export type Table<Key, Value> = {
  get: (key: Key) => Promise<{ result: Value | null }>,
  set: (key: Key, value: null | Value) => Promise<void>,
  scan: (from?: null | Key, limit?: null | number) => Promise<{ result: Value[], next: Key | null }>
};
*/

const createMemoryTable = /*::<K, V>*/(
  initialMap/*: Iterable<[K, V]>*/ = []
)/*: { ...Table<K, V>, data: Map<K, V> }*/ => {
  const data = new Map/*::<K, V>*/(initialMap);
  const get = async (key) => {
    const result = data.get(key) || null;
    return { result };
  };
  const set = async (key, value) => {
    if (value === null)
      data.delete(key);
    else
      data.set(key, value);
  };
  const scan = async (from, limit) => {
    const entries = [...data.entries()];
    const startIndex = from ? entries.findIndex(([k, v]) => k === from) : 0;
    const endIndex = limit ? (startIndex + limit - 1) : (entries.length - startIndex - 1);

    const result = entries.filter(([k, v], i) => i >= startIndex && i <= endIndex).map(([k, v]) => v);
    const nextEntry = entries[endIndex + 1];
    const next = nextEntry ? nextEntry[0] : null;

    return { result, next };
  };
  return {
    get,
    set,
    scan,
    data,
  };
};

const readOrCreateFile = async (filename, encoding, defaultFileContent) => {
  try {
    return await readFile(filename, encoding);
  } catch (error) {
    switch (error.code) {
      case 'ENOENT':
        await mkdir(dirname(filename), { recursive: true });
        await writeFile(filename, defaultFileContent);
        return defaultFileContent;
      default:
        throw error;
    }
  }
};

/// A "File Table" is a table that is loaded asynchronously
const createFileTable = async /*::<V: JSONValue>*/(
  filename/*: string*/,
  toValue/*: Cast<V>*/,
)/*: Promise<Table<string, V>>*/ => {
  const toMapEntry = (v) => {
    const array = toArray(v);
    return [toString(array[0]), toValue(array[1])];
  };
  const toTable = (v) => {
    const array = toArray(v);
    return array.map(toMapEntry);
  };
  const fileContents = await readOrCreateFile(filename, 'utf-8', JSON.stringify([]));
  const tableValue = toTable(JSON.parse(fileContents));
  const internalTable = createMemoryTable(tableValue);

  const get = async (key) => {
    const { result } = await internalTable.get(key);
    return { result };
  };
  const scan = async (from, limit) => {
    const { next, result } = await internalTable.scan(from, limit);
    return { next, result };
  };
  const set = async (key, value) => {
    await internalTable.set(key, value);
    const newTableValue = [...internalTable.data.entries()];
    await writeFile(filename, JSON.stringify(newTableValue, null, 2));
  };

  return {
    get,
    set,
    scan,
  };
};

const createCompositeKeyTable = /*:: <V>*/(
  backingTable/*: Table<string, V>*/,
)/*: Table<[string, string], V>*/ => {
  const get = (key) => {
    return backingTable.get(key.join(':'));
  };
  const set = (key, value) => {
    return backingTable.set(key.join(':'), value);
  };
  const scan = async (from, limit) => {
    const { next, result } = await backingTable.scan(from ? from.join(':') : null, limit);
    if (next) {
      const [a, b] = next.split(':');
      return { next: [a, b], result };
    }
    return { next: null, result };
  };
  return { get, set, scan };
};

/*::
export type TableServices = {
  admins: Table<AdminID, Admin>,
  users: Table<UserID, User>,
  accessGrants: Table<[UserID, AccessID], AccessGrant>,
  accessOffers: Table<[UserID, AccessID], AccessOffer>,
  accessRevocations: Table<[UserID, AccessID], AccessRevocation>,
};
*/
const createTableServices = async ()/*: Promise<TableServices>*/ => {
  const admins = await createFileTable('./data/admins.json', toAdmin);
  const users = await createFileTable('./data/users.json', toUser);
  const accessGrants = createCompositeKeyTable(await createFileTable('./data/access/grants.json', toAccessGrant));
  const accessOffers = createCompositeKeyTable(await createFileTable('./data/access/offers.json', toAccessOffer));
  const accessRevocations = createCompositeKeyTable(await createFileTable('./data/access/revocations.json', toAccessRevocation));

  return {
    admins,
    users,
    accessGrants,
    accessOffers,
    accessRevocations,
  };
};

/*::
export type UserService = {
  createAdmin(userId: UserID): Promise<Admin>,
  getAdminFromUser(userId: UserID): Promise<Admin>,

  createUser(name: string, creatorAdminId: ?AdminID): Promise<User>,
  getUserById(userId: UserID): Promise<User>,
  listSomeUsers(): Promise<User[]>,
  deleteUser(userId: UserID): Promise<User>,
  updateUser(userId: UserID, newName: string): Promise<User>,
};
*/

const createUserService = (tables/*: TableServices*/, superUser/*: ?SuperUser*/)/*: UserService*/ => {
  const getAdminFromUser = async (id) => {
    if (superUser && id === superUser.userId)
      return { id: superUser.adminId, userId: superUser.userId };
    const { result: user } = await tables.users.get(id);
    if (!user || !user.adminId)
      throw new Error();
    const { result: admin } = await tables.admins.get(user.adminId);
    if (!admin)
      throw new Error();
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
  const deleteUser = async (userId) => {
    const { result: user } = await tables.users.get(userId);
    if (!user)
      throw new Error();
    await tables.users.set(userId, null);
    return user;
  };
  const updateUser = async (userId, newName) => {
    const { result: user } = await tables.users.get(userId);
    if (!user)
      throw new Error();
    const newUser = { ...user, name: newName };
    await tables.users.set(userId, newUser);
    return newUser;
  };
  const listSomeUsers = async () => {
    const { result: users } = await tables.users.scan();
    return users;
  };
  const createAdmin = async (userId) => {
    const { result: user } = await tables.users.get(userId);
    if (!user)
      throw new Error();
    if (user.adminId)
      throw new Error();

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
  const getUserById = async (id) => {
    if (superUser && id === superUser.userId)
      return { id: superUser.userId, name: 'superuser', adminId: superUser.adminId, creatorAdminId: null };
    const { result: user } = await tables.users.get(id);
    if (!user)
      throw new Error(`No user with id ${id}`);
    return user;
  };
  return {
    getAdminFromUser,
    createUser,
    updateUser,
    deleteUser,
    listSomeUsers,
    createAdmin,
    getUserById,
  }
}

/*::
export type AccessService = {
  getAccessGrant: (headers: HTTPHeaders) => Promise<null | AccessGrant>,
  createNewOffer: (creatorId: UserID, subjectId: UserID) => Promise<AccessOfferProof>,
  createNewGrant: (offerProof: AccessOfferProof, deviceName: string, host: string | null) => Promise<AccessGrantProof>,
  validateUserAccess: (accessProof: AccessGrantProof, host: string | null) => Promise<{ userId: UserID, deviceName: string }>,
};
*/
const createAccessService = (tables/*: TableServices*/, users/*: UserService*/)/*: AccessService*/ => {
  const createNewOffer = async (creatorId, subjectId) => {
    const creator = await users.getUserById(creatorId);
    if (creatorId !== subjectId && creator.adminId === null)
      throw new Error('Can\'t create Access Grant for other users unless you are admin');
    const subject = await users.getUserById(subjectId);
    if (!subject)
      throw new Error('Subject with User ID does not exist');
    const newOffer = {
      id: uuid(),
      creator: creatorId,
      subject: subjectId,
      offerSecret: await asyncCryptoString({ length: 32, type: 'url-safe' })
    };
    await tables.accessOffers.set([subjectId, newOffer.id], newOffer);
    const newOfferProof = {
      id: newOffer.id,
      subject: subject.id,
      offerSecret: newOffer.offerSecret,
    };
    return newOfferProof;
  };
  const createNewGrant = async (offerProof, deviceName, hostName) => {
    const { result: accessOffer } = await tables.accessOffers.get([offerProof.subject, offerProof.id]);
    if (!accessOffer)
      throw new Error(`No Offer found for proof "${offerProof.id}"`);
    if (offerProof.offerSecret !== accessOffer.offerSecret)
      throw new Error(`Provided proof has invalid secret`);
    const subject = await users.getUserById(accessOffer.subject);
    if (!subject)
      throw new Error('Subject with User ID does not exist');
    const { result: accessRevocation } = await tables.accessRevocations.get([offerProof.subject, offerProof.id]);
    if (accessRevocation)
      throw new Error(`Offer has been revoked`);
    const { result: existingGrant } = await tables.accessGrants.get([offerProof.subject, offerProof.id])
    if (existingGrant)
      throw new Error(`Offer has already been accepted`);
    const newGrant = {
      id: uuid(),
      deviceName,
      hostName,
      grantSecret: await asyncCryptoString({ length: 32, type: 'url-safe' })
    };
    await tables.accessGrants.set([newGrant.id, subject.id], newGrant);
    const newGrantProof = {
      id: newGrant.id,
      subject: subject.id,
      grantSecret: newGrant.grantSecret,
    };
    return newGrantProof;
  };
  const validateUserAccess = async (accessGrantProof, hostName) => {
    const { result: accessGrant } = await tables.accessGrants.get([accessGrantProof.subject, accessGrantProof.id]);
    if (!accessGrant)
      throw new Error(`No Grant for the provided proof`);
    if (accessGrant.grantSecret !== accessGrantProof.grantSecret)
      throw new Error(`Provided proof has invalid secret`);
    if (accessGrant.hostName !== hostName)
      throw new Error(`Host "${hostName || '[none]'}" not valid for access`);
    const { result: accessRevocation } = await tables.accessRevocations.get([accessGrantProof.subject, accessGrantProof.id]);
    if (accessRevocation)
      throw new Error(`Access has been revoked`);
    const { result: accessOffer } = await tables.accessOffers.get([accessGrantProof.subject, accessGrantProof.id]);
    if (!accessOffer)
      throw new Error(`Grant has no corresponding offer`);
    return { userId: accessOffer.subject, deviceName: accessGrant.deviceName };
  };
  const getAccessGrant = async (headers) => {
    const auth = getAuthorization(headers);
    if (auth.type !== 'bearer')
      return null;
    const grantProof = accessGrantProofEncoder.decode(auth.token);
    const { result: grant } = await tables.accessGrants.get([grantProof.id, grantProof.subject]);
    if (!grant)
      return null;
    return {
      ...grant,
      grantSecret: '******',
    };
  };

  return {
    validateUserAccess,
    createNewOffer,
    createNewGrant,
    getAccessGrant,
  };
};

/*::
export type AuthorizationService = {
  authorizeUser(headers: HTTPHeaders): Promise<User>,
  authorizeAdmin(headers: HTTPHeaders): Promise<[Admin, User]>,
};
*/

const createAuthorizationService = (users/*: UserService*/, access/*: AccessService*/, superUser/*: ?SuperUser*/)/*: AuthorizationService*/ => {
  const getUser = async (authorization, host = null) => {
    switch (authorization.type) {
      case 'bearer': {
        const grantProof = accessGrantProofEncoder.decode(authorization.token);
        const { userId } = await access.validateUserAccess(grantProof, host);

        return await users.getUserById(userId);
      }
      case 'basic': {
        if (superUser && authorization.username === superUser.adminId && authorization.password === superUser.password) {
          return await users.getUserById(authorization.username);
        }
        throw new Error();
      }
      case 'none':
        throw new Error('Authorization header expected')
      default:
        throw new Error('Unknown type of Authorization Header, can\;t proceed.');
    }
  };
  const authorizeUser = async (headers) => {
    const auth = getAuthorization(headers);
    const user = await getUser(auth, headers['host']);
    return user;
  };
  const authorizeAdmin = async (headers) => {
    const auth = getAuthorization(headers);
    const user = await getUser(auth, headers['host']);
    const admin = await users.getAdminFromUser(user.id);
    return [admin, user];
  };

  return {
    authorizeUser,
    authorizeAdmin,
  };
};

/*::
export type Services = {
  access: AccessService,
  tables: TableServices,
  auth: AuthorizationService,
  user: UserService,
};
*/

const createServices = async (config/*: SesameAPIConfig*/)/*: Promise<Services>*/ => {
  const superUser = getSuperUser(config);
  const tables = await createTableServices();
  const user = createUserService(tables, superUser);
  const access = createAccessService(tables, user);
  const auth = createAuthorizationService(user, access, superUser);

  return {
    tables,
    access,
    auth,
    user
  };
};

module.exports = {
  createServices,
};