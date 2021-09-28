// @flow strict
/*:: import type { Cast} from '@lukekaalim/cast'; */
import { createObjectCaster, castString } from '@lukekaalim/cast';
import JSON5 from 'json5';


/*::
export type Config = {
  origin: string,
  name: string,
  api: {
    sesame: {
      origin: string,
    }
  }
};
*/

export const castConfig/*: Cast<Config>*/ = createObjectCaster({
  origin: castString,
  name: castString,
  api: createObjectCaster({
    sesame: createObjectCaster({
      origin: castString,
    })
  }),
})

export const loadConfigFromURL = async (url/*: URL | string*/ = '/config.json5')/*: Promise<Config>*/ => {
  console.log(`Reading config from ${url.toString()}`);
  const response = await fetch(url)
  const config = castConfig(JSON5.parse(await response.text()));
  console.log(JSON.stringify(config, null, 2));
  return config;
};
