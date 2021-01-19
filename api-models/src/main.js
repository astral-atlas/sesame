// @flow strict
/*::
export type * from './resource';
export type * from './rest';
*/

module.exports = {
  ...require('./resource'),
  ...require('./rest')
}