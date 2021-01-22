// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
const { toObject, toString } = require('@lukekaalim/cast')

/*::
export type OffsetPaginationFilterQuery = {|
  offset: string,
  limit: string,
|};
*/
const toOffsetPaginationFilter/*: Cast<OffsetPaginationFilterQuery>*/ = (value) => {
  const object = toObject(value);
  return {
    offset: toString(object.offset),
    limit: toString(object.limit),
  };
};

module.exports = {
  toOffsetPaginationFilter,
}