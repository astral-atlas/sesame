// @flow strict
/*:: import type { JSONValue, Cast } from '@lukekaalim/cast'; */
import { useMemo, useState } from 'preact/hooks';
import { stringify, parse } from '@lukekaalim/cast';

export const useLocalStorage = /*:: <T: JSONValue>*/(
  key/*: string*/,
  defaultValue/*: T*/,
  toValue/*: Cast<T>*/,
)/*: [T, (v: (T => T)) => void]*/ => {
  const initialValue = useMemo(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? toValue(parse(item)) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }, [])
  const [storedValue, setStoredValue] = useState(initialValue);

  const setValue = updater => {
    try {
      const valueToStore = updater(storedValue);
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};
