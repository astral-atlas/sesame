// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { LoginToken, AccessToken } from '@astral-atlas/sesame-models'; */
const { homedir } = require('os');
const { writeFile, readFile } = require('fs').promises;
const { toLoginToken, toAccessToken } = require('@astral-atlas/sesame-models');
const { toObject, toString, toNullable, stringify, parse } = require('@lukekaalim/cast');

/*::
export type CLIConfig = {|
  baseURL: null | string,
  deviceName: null | string,
  accessToken: null | AccessToken,
|};
*/

const toCLIConfig/*: Cast<CLIConfig>*/ = (value) => {
  const object = toObject(value);
  return {
    baseURL: toNullable(object.baseURL || null, toString),
    deviceName: toNullable(object.deviceName || null, toString),
    accessToken: toNullable(object.accessToken || null, toAccessToken)
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
      accessToken: null,
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
