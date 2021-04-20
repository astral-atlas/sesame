// @flow strict
import 'preact/debug';
import { h, render } from 'preact';
import { Homepage } from './pages/homepages';
import { SesameClientProvider } from './context/sesameClient';
import { ApplicationProvider } from './context/application';
import { ManageUsersPage, manageUsersPath } from './pages/users';
import { locationContext, LocationProvider } from './context/location';
import { NavigationSidePane } from './components/navigation';
import { useContext } from 'preact/hooks';

const sesameClientProviderProps = {
  baseURL: new URL('http://localhost:5543'),
  accessGrantProof: null
};

const SesameProviders = ({ children }) =>
  h(ApplicationProvider, {},
    h(SesameClientProvider, sesameClientProviderProps,
      h(LocationProvider, {},
        children
      )
    )
  )

const SesameRouter = () => {
  const { url } = useContext(locationContext);
  switch (url.pathname) {
    case '/':
      return h(Homepage);
    case manageUsersPath:
      return h(ManageUsersPage);
    default:
      return null;
  }
};

const SesamePage = ({ children }) => {
  const style = {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };
  return h(SesameProviders, {},
    h('span', { style }, [
      h('header', {}, [
        h('h1', {}, 'Astral Atlas - OpenSesame'),
        h(NavigationSidePane),
      ]),
      children,
    ])
  );
}

const SesameWebsite = () =>
  h(SesameProviders, {},
    h(SesamePage, {},
      h(SesameRouter)
    )
  );

const main = () => {
  const root = document.body
  if (!root)
    return;
  render(h(SesameWebsite), root)
};

main();