// @flow strict
/*:: import type { Cast, JSONValue } from '@lukekaalim/cast'; */
import { parse, stringify } from '@lukekaalim/cast';

/*::
export type StoredValue<T> = {
  get: () => T,
  set: T => void,
};
*/
export const createStoredValue = /*:: <T>*/(
  key/*: string*/,
  toValue/*: Cast<T>*/,
  defaultValue/*: T*/
)/*: StoredValue<T>*/ => {
  const get = () => {
    try {
      const valueOrNull = localStorage.getItem(key);
      if (!valueOrNull)
        return defaultValue;
      return toValue(parse(valueOrNull));
    } catch (error) {
      console.warn(error.message);
      return defaultValue;
    }
  };
  const set = (value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  return {
    get,
    set,
  };
};
