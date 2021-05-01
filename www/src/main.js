// @flow strict
import 'preact/debug';
import JSON5 from 'json5';
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

const SesameProviders = ({ config, children }) =>
  h(ApplicationProvider, {},
    h(SesameClientProvider, { baseURL: new URL(config.api.sesame.baseURL) },
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

const SesameWebsite = ({ config }) => h(SesameProviders, { config }, h(SesameRouter));

const main = async () => {
  const configResponse = await fetch('/config.json5');
  const config = JSON5.parse(await configResponse.text());
  const root = document.body
  if (!root)
    return;
  insertStyleElement();
  render(h(SesameWebsite, { config }), root)
};

main();