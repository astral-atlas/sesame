// @flow strict
/*:: import type { Cast, JSONValue } from '@lukekaalim/cast'; */
/*:: import type { APIResource, QueryMap } from './resource'; */ 
const { toArray } = require('@lukekaalim/cast');
const { createAPIResource } = require('./resource');

const toNull/*: Cast<null>*/ = () => null;

/*::
export type RESTResource<T: JSONValue, TArgs: JSONValue, TIdentifier: QueryMap, TFilter: QueryMap> = {
  create: APIResource<T, TArgs, null>,
  list:   ?APIResource<T[], null, TFilter>,
  get:    APIResource<T, null, TIdentifier>,
  patch:  APIResource<T, TArgs, TIdentifier>,
  delete: APIResource<null, null, TIdentifier>,
};
*/

const createRESTResource = /*::<T: JSONValue, TArgs: JSONValue, TIdentifier: QueryMap, TFilter: QueryMap>*/ (
  name/*: string*/,
  toResource/*: Cast<T>*/,
  toArgs/*: Cast<TArgs>*/,
  toIdentifier/*: Cast<TIdentifier>*/,
  toFilter/*: ?Cast<TFilter>*/ = null,
)/*: RESTResource<T, TArgs, TIdentifier, TFilter>*/ => {
  const toList = (value) => {
    const array = toArray(value);
    return array.map(toResource);
  };
  return {
    create: createAPIResource(name, 'POST', toNull, toArgs, toResource, true),
    list:   toFilter ? createAPIResource(name, 'GET', toFilter, toNull, toList, true) : null,
    get:    createAPIResource(name, 'GET', toIdentifier, toNull, toResource, true),
    patch:  createAPIResource(name, 'PATCH', toIdentifier, toArgs, toResource, true),
    delete: createAPIResource(name, 'DELETE',toIdentifier, toNull, toNull, true),
  }
};

module.exports = {
  toNull,
  createRESTResource,
};
