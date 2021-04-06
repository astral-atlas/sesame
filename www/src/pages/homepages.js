// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { LoginToken } from '@astral-atlas/sesame-models'; */
import { toString, toNullable } from '@lukekaalim/cast';
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { createAdminSesameClient, createGuestSesameClient, createUserSesameClient } from '@astral-atlas/sesame-client';
import { createWebClient } from '@lukekaalim/http-client';
import { useLocalStorage } from '../hooks/storage';
import { loginTokenEncoder, toAccessToken, toUserId } from '@astral-atlas/sesame-models';

const GuestHomepage = () => {

};

const LabeledTextInput = ({ label, ...props }) => h('label', {}, [
  h('p', {}, label),
  h('input', { type: 'text', ...props })
]);

const EncodedLoginForm = ({ onLogin }/*: {| onLogin: (t: LoginToken, n: string) => mixed |}*/) => {
  const [encodedLoginToken, setEncodedLoginToken] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const onSubmit = (e) => {
    e.preventDefault();
    const loginToken = loginTokenEncoder.decode(encodedLoginToken);
    onLogin(loginToken, deviceName);
  }
  return [
    h('form', { onSubmit }, [
      h(LabeledTextInput, {
        label: 'Encoded Login Token',
        value: encodedLoginToken,
        onInput: e => setEncodedLoginToken(e.currentTarget.value)
      }),
      h(LabeledTextInput, {
        label: 'Device name',
        value: deviceName,
        onInput: e => setDeviceName(e.currentTarget.value)
      }),
      h('input', { type: 'submit', value: 'Login' })
    ]),
  ]
}

const User = ({ http, baseURL, accessToken }) => {
  const userClient = createUserSesameClient({ http, baseURL, accessToken });
  const [user, setUser] = useState(null);
  useEffect(() => {
    userClient.getSelf().then(({ self, admin }) => setUser(self));
  }, [accessToken]);

  if (!user)
    return null;

  return h('section', {}, [
    h('h3', {}, user.name),
    h('p', {}, user.id),
    user.adminId && h('p', {}, 'Admin'),
  ]);
};

const CreateUserForm = ({ http, baseURL, accessToken }) => {
  const adminClient = createAdminSesameClient({ http, baseURL, accessToken });
  const [name, setName] = useState('');
  const [newUserId, setNewUserId] = useState(null);
  const onSubmit = async (e) => {
    e.preventDefault();
    const { newUserId } = await adminClient.createUser(name);
    setNewUserId(newUserId);
  };

  return [
    h('form', { onSubmit }, [
      h('h3', {}, 'Create User'),
      h(LabeledTextInput, {
        label: 'Subject ID',
        value: name,
        onInput: e => setName(e.currentTarget.value)
      }),
      h('input', { type: 'submit', value: 'Create User' })
    ]),
    newUserId && h('pre', {}, newUserId),
  ];
};

const GrantForm = ({ http, baseURL, accessToken })/*: Node*/ => {
  const [subjectId, setSubjectId] = useState('');
  const [loginToken, setLoginToken] = useState(null);
  const userClient = createUserSesameClient({ http, baseURL, accessToken });
  const onSubmit = async (e) => {
    e.preventDefault();
    const newLoginToken = await userClient.createLoginGrant(toUserId(subjectId));
    setLoginToken(newLoginToken);
  };
  return [
    h('form', { onSubmit }, [
      h('h3', {}, 'Login Grant'),
      h(LabeledTextInput, {
        label: 'Subject ID',
        value: subjectId,
        onInput: e => setSubjectId(e.currentTarget.value)
      }),
      h('input', { type: 'submit', value: 'Create Grant ' }),
    ]),
    loginToken && h('pre', {}, loginTokenEncoder.encode(loginToken)),
  ];
};

const Homepage = ()/*: Node*/ => {
  const [accessToken, setAccessToken] = useLocalStorage('sesame_access_token', null, v => toNullable(v, toAccessToken));
  const http = createWebClient(fetch);
  const baseURL = new URL('http://localhost:5543')
  const guestClient = createGuestSesameClient({ http, baseURL })

  const onLogin = async (loginToken) => {
    const newAccessToken = await guestClient.grantAccess(loginToken, 'My Web Client')
    setAccessToken(() => newAccessToken);
  };

  return [
    h('h1', {}, 'Sesame'),
    h('pre', {}, JSON.stringify(accessToken)),
    h(EncodedLoginForm, { onLogin }),
    accessToken && h(User, { accessToken, http, baseURL }),
    accessToken && h(GrantForm, { accessToken, http, baseURL }),
    accessToken && h(CreateUserForm, { accessToken, http, baseURL })
  ];
};

export {
  GuestHomepage,
  Homepage,
};
