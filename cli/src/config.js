// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { AccessGrantProof } from '@astral-atlas/sesame-models'; */
const { homedir } = require('os');
const { writeFile, readFile } = require('fs').promises;
const { toAccessGrantProof } = require('@astral-atlas/sesame-models');
const { toObject, toString, toNullable, stringify, parse, toEnum } = require('@lukekaalim/cast');

/*::
export type CLILoginConfig = 
  | {| type: 'super', username: string, password: string |}
  | {| type: 'grant', proof: AccessGrantProof |}
  | {| type: 'none' |}
export type CLIConfig = {|
  baseURL: null | string,
  deviceName: null | string,
  login: CLILoginConfig,
|};
*/

const toLoginConfig/*: Cast<CLILoginConfig>*/ = (value) => {
  const object = toObject(value);
  const objectType = toString(object.type);
  switch (objectType) {
    case 'super':
      return { type: 'super', username: toString(object.username), password: toString(object.password) };
    case 'grant':
      return { type: 'grant', proof: toAccessGrantProof(object.proof) };
    case 'none':
      return { type: 'none' };
    default:
      throw new TypeError(`Unknown login type: "${objectType}"`)
  }
};

const toCLIConfig/*: Cast<CLIConfig>*/ = (value) => {
  const object = toObject(value);
  return {
    baseURL: toNullable(object.baseURL || null, toString),
    deviceName: toNullable(object.deviceName || null, toString),
    login: toLoginConfig(object.login),
  }
};

const readCLIConfig = async ()/*: Promise<CLIConfig>*/ => {
  try {
    const fileContent = await readFile(homedir() + '/.atlas_sesame.json', 'utf8');
    const config = toCLIConfig(parse(fileContent));
    return config;
  } catch (error) {
    return {
      baseURL: null,
      login: { type: 'none' },
      deviceName: null,
    }
  }
};

const writeCLIConfig = async (updatedClient/*: CLIConfig*/) => {
  const fileContents = stringify(updatedClient);
  await writeFile(homedir() + '/.atlas_sesame.json', fileContents, 'utf8');
};
 
module.exports = {
  toCLIConfig,
  writeCLIConfig,
  readCLIConfig,
};
