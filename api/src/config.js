// @flow strict
/*:: import type { UserID, AdminID, APIConfig } from '@astral-atlas/sesame-models'; */
/*:: import type { Cast } from '@lukekaalim/cast'; */
import { promises } from 'fs';
import { castAPIConfig } from '@astral-atlas/sesame-models';
import JSON5 from 'json5';
const { readFile } = promises;


export const loadConfigFromFile = async (path/*: string*/ = './sesame_config.json')/*: Promise<APIConfig>*/ => {
  try {
    console.log(`Reading "${path}"`);
    const sesameConfig = castAPIConfig(JSON5.parse(await readFile(path, 'utf8')));
    console.log(sesameConfig);
    return sesameConfig;
  } catch (error) {
    console.warn(error.message);
    if(error.code === 'ENOENT') {
      return { port: null, host: null, data: null, www: { sesame: { origin: null }} };
    }
    throw error;
  }
};
