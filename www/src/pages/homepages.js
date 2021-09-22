// @flow strict
/*:: import type { Node } from 'preact'; */
import { h } from 'preact';
import { useContext } from 'preact/hooks';

/*:: import type { User } from '@astral-atlas/sesame-models'; */
import { LoginForm } from '../components/login';
import { applicationContext } from '../context/application';
import { SelfInfo } from '../components/user';
import { ContentIsland } from '../components/island';
import { NavigationHeader } from '../components/navigation';
import { Form, FormHint } from '../components/form';
import { useAsync } from '../hooks/async';
import { useAPI } from "../context/api";

const GuestHomepageContent = ()/*: Node*/ => {
  return [
    h('h2', {}, 'Login to Astral Atlas'),
    h(LoginForm),
  ];
};

const UserHomePageContent = ()/*: Node*/ => {
  const [{ self: { user, admin, access } },dispatch] = useContext(applicationContext);

  const onLogoutClick = () => {
    dispatch({
      type: 'login',
      authentication: { type: 'none' },
      self: null
    });
  }

  return [
    h('h2', {}, 'Astral Atlas'),
    h('p', {}, `You are logged in as "${self.name}".`),
    h('p', {}, `You can create more access codes for other devices to login in at the Access Page.`),
    h('p', {}, `You can view or modify your own details in the Profile Page.`),
    self.adminId && h('p', {}, `You are also an administrator; You can create or modify users at the Users Page.`),
    access && access.grant && h('p', {}, `You are loggin in from device "${access.grant.deviceName}"`),
    //h(SelfInfo),
    h(Form, {}, [
      h(FormHint, { tone: 'warning' }, 'You can\'t use the same Access Token to log back in. Make sure you have another device or spare access token before logging out.'),
      h('button', { onClick: onLogoutClick }, 'Logout'),
    ]),
  ];
};

export const Homepage = ()/*: Node*/ => {
  const [{ self: { user } }] = useContext(applicationContext);
  return [
    h(NavigationHeader, {}, []),
    h('main', {}, [
      h(ContentIsland, {}, [
        user ? h(UserHomePageContent) : h(GuestHomepageContent),
      ])
    ]),
  ]
};
