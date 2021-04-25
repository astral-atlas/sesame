// @flow strict
import 'preact/debug';
import { h, render } from 'preact';
import { Homepage } from './pages/homepages';
import { SesameClientProvider } from './context/sesameClient';
import { applicationContext, ApplicationProvider } from './context/application';
import { locationContext, LocationProvider } from './context/location';
import { useContext } from 'preact/hooks';
import { insertStyleElement } from './lib/style';
import { allPages } from './pages';
import { ProfilePage } from './pages/profile';
import { AccessPage } from './pages/access';
import { ManageUsersPage } from './pages/users';

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
  const { appState: { self } } = useContext(applicationContext);
  
  const page = allPages.find(page => page.path === url.pathname);
  if (!page)
    return h('p', {}, '404 Not Found!');
  
  switch (page.path) {
    default:
    case '/':
      return h(Homepage);
    case '/access':
      return h(AccessPage);
    case '/profile':
      return h(ProfilePage);
    case '/users':
      return h(ManageUsersPage);
  }
};

const SesameWebsite = () => h(SesameProviders, {}, h(SesameRouter));

const main = () => {
  const root = document.body
  if (!root)
    return;
  insertStyleElement();
  render(h(SesameWebsite), root)
};

main();