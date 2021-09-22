// @flow strict
/*:: import type { Cast, JSONValue } from '@lukekaalim/cast'; */
const { stringify } = require('@lukekaalim/cast');

/*::
export type Endpoint<Q: ?{ +[string]: ?string }> = {|
  path: string,
  toQuery: ?{ +[string]: ?string } => Q
|};

export type WithResponseBody<ResponseBody: JSONValue> = {|
  toResponseBody: JSONValue => ResponseBody,
|};
export type WithRequestBody<RequestBody: JSONValue> = {|
  toRequestBody: JSONValue => RequestBody,
|};

export type GETEndpoint<Res, Q> = {| ...Endpoint<Q>, ...WithResponseBody<Res>, method: 'GET' |};
export type PUTEndpoint<Req, Q> = {| ...Endpoint<Q>, ...WithRequestBody<Req>, method: 'PUT' |};
export type POSTEndpoint<Req, Res, Q> = {| ...Endpoint<Q>, ...WithResponseBody<Res>, ...WithRequestBody<Req>, method: 'POST' |};
export type DELETEEndpoint<Req, Res, Q> = {| ...Endpoint<Q>, ...WithResponseBody<Res>, ...WithRequestBody<Req>, method: 'DELETE' |};

export type MyAPI = {|
  '/home': {
     GET: { query: { no: string }, response: null }
  },
|};

*/

const a = /*:: <T>*/ (implementation/*: $ObjMap<T, <Z>(_: Z) => Z['GET']['query']>*/) => {

};


a/*::<MyAPI>*/({ "/home": { no: 'hello' } });