// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
import { c } from '@lukekaalim/cast';

/*::
export type ServiceID = string;
export type Service = {
  id: ServiceID,
  name: string,
  origin: string,
};
*/

export const castServiceId/*: Cast<ServiceID>*/ = c.str;
export const castService/*: Cast<Service>*/ = c.obj({
  id: castServiceId,
  name: c.str,
  origin: c.str,
});