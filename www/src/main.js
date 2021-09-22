// @flow strict
import 'preact/debug';
import JSON5 from 'json5';
import { h, render } from 'preact';
import { Homepage } from './pages/homepages';
import { castObject, toString } from '@lukekaalim/cast';
import { applicationContext, ApplicationProvider } from './context/application';
import { locationContext, LocationProvider } from './context/location';
import { useContext } from 'preact/hooks';
import { insertStyleElement } from './lib/style';
import { ProfilePage } from './pages/profile';
import { AccessPage } from './pages/access';
import { ManageUsersPage } from './pages/users';
import { FramePage } from './pages/frame';

const SesameRouter = () => {
  const { url } = useContext(locationContext);
  
  switch (url.pathname) {
    default:
    case '/':
      return h(Homepage);
    case '/frame':
      return h(FramePage);
    case '/access':
      return h(AccessPage);
    case '/profile':
      return h(ProfilePage);
    case '/users':
      return h(ManageUsersPage);
  }
};

const SesameWebsite = ({ config }) => {
  return h(ApplicationProvider, { base: config.baseURL },
    h(SesameRouter));
};

const castConfig = castObject(prop => ({
  api: prop('api', castObject(prop => ({
    sesame: prop('sesame', castObject(prop => ({
      baseURL: prop('baseURL', toString)
    })))
  })))
}));

const main = async () => {
  const configResponse = await fetch('/config.json5');
  const config = castConfig(JSON5.parse(await configResponse.text()));
  const root = document.body
  if (!root)
    return;
  insertStyleElement();
  render(h(SesameWebsite, { config }), root)
};

main();