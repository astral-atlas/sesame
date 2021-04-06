// @flow strict
/*:: import type { UserID, AdminID } from '@astral-atlas/sesame-models'; */
/*:: import type { Cast } from '@lukekaalim/cast'; */
const { readFile } = require('fs').promises;
const { toObject, toString, toNumber } = require('@lukekaalim/cast');

/*::
export type SuperUser = {
  userId: UserID,
  adminId: AdminID,
  password: string,
};


export type StaticSuperUser = {
  type: 'static',
  userId: UserID,
  adminId: AdminID,
  password: string,
};
export type EnvironmentSuperUser = {
  type: 'environment',
};
export type NoSuperUser = {
  type: 'none',
};
export type SuperUserConfig = StaticSuperUser | EnvironmentSuperUser | NoSuperUser;

export type SesameAPIConfig = {|
  port: number,
  superUser: SuperUserConfig
|};
*/

const toStaticSuperUser/*: Cast<StaticSuperUser>*/ = (value) => {
  const object = toObject(value);
  return {
    type: 'static',
    userId: toString(object.username),
    adminId: toString(object.username),
    password: toString(object.password),
  }
};

const toSuperUserConfig/*: Cast<SuperUserConfig>*/ = (value) => {
  const object = toObject(value);
  switch (toString(object.type)) {
    case 'static':
      return toStaticSuperUser(value);
    case 'environment':
      return { type: 'environment' };
    case 'none':
      return { type: 'none' };
    default:
      throw new TypeError();
  }
};

const getSuperUser = ({ superUser }/*: SesameAPIConfig*/)/*: ?SuperUser*/ => {
  switch (superUser.type) {
    case 'static':
      return {
        userId: superUser.userId,
        adminId: superUser.adminId,
        password: superUser.password
      };
    case 'environment':
      return {
        userId: toString(process.env['SESAME_SUPERUSER_ID']),
        adminId: toString(process.env['SESAME_SUPERUSER_ID']),
        password: toString(process.env['SESAME_SUPERUSER_SECRET']),
      }
    default:
    case 'none':
      return null;
  }
};

const toSesameAPIConfig/*: Cast<SesameAPIConfig>*/ = (value) => {
  const object = toObject(value);
  
  return {
    superUser: toSuperUserConfig(object.superUser),
    port: toNumber(object.port),
  }
};

const readConfig = async (path/*: string*/ = './sesame_config.json')/*: Promise<SesameAPIConfig>*/ => {
  console.log(`Reading "${path}"`)
  const configFileContents = await readFile(path, 'utf8');
  const sesameConfig = toSesameAPIConfig(JSON.parse(configFileContents));
  return sesameConfig;
};

module.exports = {
  readConfig,
  getSuperUser,
  toSesameAPIConfig,
};
