// @flow strict
/*:: import type { UserID, AdminID } from '@astral-atlas/sesame-models'; */
/*:: import type { Cast } from '@lukekaalim/cast'; */
import { promises } from 'fs';
import {
  createObjectCaster as obj, castString as str, castNumber as num,
  createNullableCaster as maybe, createKeyedUnionCaster as or,
  createConstantCaster as lit,
} from '@lukekaalim/cast';
import JSON5 from 'json5';
const { readFile } = promises;


/*::
export type DataConfig =
  | {| type: 'memory' |}
  | {| type: 'file', dataDir: ?string |}
  | {| type: 'awsS3', bucket: string, prefix: ?string |}

export type Config = {
  port: ?number,
  host: ?string,
  data: ?DataConfig,
};
*/
export const castDataConfig/*: Cast<DataConfig>*/ = or('type', {
  'memory': obj({ type: lit('memory') }),
  'file': obj({ type: lit('file'), dataDir: maybe(str) }),
  'awsS3': obj({ type: lit('awsS3'), bucket: str, prefix: maybe(str) })
});

export const castConfig/*: Cast<Config>*/ = obj({
  host: maybe(str),
  port: maybe(num),
  data: maybe(castDataConfig),
});

export const loadConfigFromFile = async (path/*: string*/ = './sesame_config.json')/*: Promise<Config>*/ => {
  try {
    console.log(`Reading "${path}"`);
    const sesameConfig = castConfig(JSON5.parse(await readFile(path, 'utf8')));
    console.log(sesameConfig);
    return sesameConfig;
  } catch (error) {
    if(error.code === 'ENOENT') {
      return { port: null, host: null, data: null };
    }
    throw error;
  }
};
