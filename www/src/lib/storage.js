// @flow strict
/*:: import type { Cast, JSONValue } from '@lukekaalim/cast'; */
import { parse, stringify } from '@lukekaalim/cast';

/*::
export type StoredValue<T> = {
  get: () => T,
  set: T => void,
};
*/
export const createStoredValue = /*:: <T: JSONValue>*/(
  key/*: string*/,
  toValue/*: Cast<T>*/,
  defaultValue/*: T*/
)/*: StoredValue<T>*/ => {
  const get = () => {
    const valueOrNull = localStorage.getItem(key);
    if (!valueOrNull)
      return defaultValue;
    return toValue(parse(valueOrNull));
  };
  const set = (value) => {
    localStorage.setItem(key, stringify(value));
  };

  return {
    get,
    set,
  };
};
