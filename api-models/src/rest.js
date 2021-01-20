// @flow strict
/*:: import type { Cast, JSONValue } from '@lukekaalim/cast'; */
/*:: import type { APIResource, QueryMap } from './resource'; */ 
const { toArray } = require('@lukekaalim/cast');
const { createAPIResource } = require('./resource');

const toNull/*: Cast<null>*/ = () => null;

/*::
export type RESTResource<
  T: JSONValue,
  TCreateArgs: JSONValue,
  TModifyArgs: JSONValue,
  TIdentifier: QueryMap,
  TFilter: QueryMap
> = {
  create: APIResource<T, TCreateArgs, null>,
  list:   ?APIResource<T[], null, TFilter>,
  get:    APIResource<T, null, TIdentifier>,
  patch:  APIResource<T, TModifyArgs, TIdentifier>,
  delete: APIResource<null, null, TIdentifier>,
};
*/

const createRESTResource = /*::<
  T: JSONValue,
  TCreateArgs: JSONValue,
  TModifyArgs: JSONValue,
  TIdentifier: QueryMap,
  TFilter: QueryMap
>*/ (
  name/*: string*/,
  toResource/*: Cast<T>*/,
  toCreateArgs/*: Cast<TCreateArgs>*/,
  toModifyArgs/*: Cast<TModifyArgs>*/,
  toIdentifier/*: Cast<TIdentifier>*/,
  toFilter/*: ?Cast<TFilter>*/ = null,
)/*: RESTResource<T, TCreateArgs, TModifyArgs, TIdentifier, TFilter>*/ => {
  const toList = (value) => {
    const array = toArray(value);
    return array.map(toResource);
  };
  return {
    create: createAPIResource(name, 'POST', toNull, toCreateArgs, toResource, true),
    list:   toFilter ? createAPIResource(name, 'GET', toFilter, toNull, toList, true) : null,
    get:    createAPIResource(name, 'GET', toIdentifier, toNull, toResource, true),
    patch:  createAPIResource(name, 'PATCH', toIdentifier, toModifyArgs, toResource, true),
    delete: createAPIResource(name, 'DELETE',toIdentifier, toNull, toNull, true),
  }
};

module.exports = {
  toNull,
  createRESTResource,
};
