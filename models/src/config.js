// @flow strict
/*:: import type  { Cast } from '@lukekaalim/cast'; */
import * as identity from "../../www/src/storage/identity";
import { c } from '@lukekaalim/cast';

/*::
export type APIDataConfig =
  | {| type: 'memory' |}
  | {| type: 'file', dataDir: ?string |}
  | {| type: 'awsS3', bucket: string, prefix: ?string |}

export type APIConfig = {
  port: ?number,
  host: ?string,
  data: ?APIDataConfig,
  www: {
    sesame: {
      origin: string
    }
  }
};
*/

export const castAPIDataConfig/*: Cast<APIDataConfig>*/ = c.or('type', {
  memory: c.obj({ type: c.lit('memory') }),
  file: c.obj({ type: c.lit('file'), dataDir: c.maybe(c.str) }),
  awsS3: c.obj({ type: c.lit('awsS3'), bucket: c.str, prefix: c.maybe(c.str) }),
})
export const castAPIConfig/*: Cast<APIConfig>*/ = c.obj({
  port: c.maybe(c.num),
  host: c.maybe(c.str),
  data: c.maybe(castAPIDataConfig),
  www: c.obj({
    sesame: c.obj({
      origin: c.str
    })
  })
});


/*::
export type WWWConfig = {
  origin: string,
  name: string,
  api: {
    sesame: {
      origin: string,
    }
  }
};
*/

export const castWWWConfig/*: Cast<WWWConfig>*/ = c.obj({
  origin: c.str,
  name: c.str,
  api: c.obj({
    sesame: c.obj({
      origin: c.str,
    })
  })
});