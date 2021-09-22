// @flow strict
/*:: import type { Context, Node } from 'preact'; */
/*:: import type { Updater } from 'preact/hooks'; */
import { createContext, h } from "preact";
import { useEffect, useState } from 'preact/hooks';

/*::
export type Location = {|
  url: URL,
  navigate: URL => void,
|};
*/
const defaultLocation/*: Location*/ = {
  url: new URL(document.location.href),
  navigate: () => {},
};

export const locationContext/*: Context<Location>*/ = createContext(defaultLocation);

/*::
export type LocationProviderProps = {|
  children: Node,
  initialURL?: URL,
|};
*/

export const LocationProvider = ({
  children,
  initialURL = new URL(document.location.href)
}/*: LocationProviderProps*/)/*: Node*/ => {
  const [currentLocationURL, setCurrentLocationURL] = useState/*:: <URL>*/(initialURL);
  useEffect(() => {
    const onPopState = (event) => {
      setCurrentLocationURL(new URL(document.location.href));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener(onPopState);
  }, []);
  const navigate = (value) => {
    setCurrentLocationURL(value);
    history.pushState(null, '', value.href);
  };
  const location = {
    url: currentLocationURL,
    navigate,
  }
  return h(locationContext.Provider, { value: location }, children)
};