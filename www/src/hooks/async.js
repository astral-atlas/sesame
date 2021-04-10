// @flow strict
import { useState, useEffect } from 'preact/hooks';

export const useAsync = /*:: <T>*/(handler/*: () => Promise<T>*/, deps/*: void | mixed[]*/ = undefined)/*: [null | T, null | Error]*/ => {
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    handler()
      .then(v => setValue(v))
      .catch(e => setError(e))
  }, deps)
  return [value, error];
};