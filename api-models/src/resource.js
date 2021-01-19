// @flow strict
/*:: import type { Cast, JSONValue } from '@lukekaalim/cast'; */

/*::
export type QueryMap = ?{ +[string]: ?(string | number | boolean) };

export type APIResource<Response: JSONValue = null, Request: JSONValue = null, Query: QueryMap = null> = {
  path: string,
  method: string,
  authenticated: boolean,
  toQuery: Cast<Query>,
  toRequest: Cast<Request>,
  toResponse: Cast<Response>
};

export type QueryOfAPIResource<T> = $Call<<Q>(t: APIResource<any, any, Q>) => Q, T>;
export type RequestOfAPIResource<T> = $Call<<Req>(t: APIResource<Req, any, any>) => Req, T>;
export type ResponseOfAPIResource<T> = $Call<<Res>(t: APIResource<any, Res, any>) => Res, T>;
*/

const createAPIResource = /*:: <Res: JSONValue, Req: JSONValue, Q: QueryMap>*/(
  path/*: string*/,
  method/*: string*/,
  toQuery/*: Cast<Q>*/,
  toRequest/*: Cast<Req>*/,
  toResponse/*: Cast<Res>*/,
  authenticated/*: boolean*/ = false,
)/*: APIResource<Res, Req, Q>*/ => ({
  path,
  method,
  authenticated,
  toQuery,
  toRequest,
  toResponse,
});

module.exports = {
  createAPIResource,
};

