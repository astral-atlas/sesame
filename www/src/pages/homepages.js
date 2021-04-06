// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { LoginToken } from '@astral-atlas/sesame-models'; */
import { toString, toNullable } from '@lukekaalim/cast';
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { createAdminSesameClient, createGuestSesameClient, createUserSesameClient } from '@astral-atlas/sesame-client';
import { createWebClient } from '@lukekaalim/http-client';
import { useLocalStorage } from '../hooks/storage';
import { accessOfferProofEncoder, toAccessGrantProof, toUserId } from '@astral-atlas/sesame-models';

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

const User = ({ http, baseURL, accessProof }) => {
  const userClient = createUserSesameClient({ http, baseURL, authMode: 'grant', accessGrantProof: accessProof });
  const [me, setMe] = useState(null);
  useEffect(() => {
    userClient.getSelfUser().then((newMe) => setMe(newMe));
  }, [accessProof]);

  if (!me)
    return null;

  const style = {
    border: '1px solid black',
    borderRadius: '16px',
    padding: '1em',
    margin: '1em',
  }

  return h('section', { style }, [
    h('h3', {}, me.self.name),
    h('p', {}, me.self.id),
    me.admin && h('p', {}, `Admin ${me.admin.id}`),
    me.access && h('p', {}, `Logged as ${me.access.deviceName} (${me.access.hostName || ''})`),
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

const HomepageOld = ()/*: Node*/ => {
  const [accessToken, setAccessToken] = useLocalStorage('sesame_access_token', null, v => toNullable(v, toAccessToken));
  const http = createWebClient(fetch);
  const baseURL = new URL('http://localhost:5543')
  const guestClient = createGuestSesameClient({ http, baseURL })

  const onLogin = async (loginToken) => {
    const newAccessToken = await guestClient.grantAccess(loginToken, 'My Web Client')
    setAccessToken(() => newAccessToken);
  };

  return [
    h('h1', {}, 'Astral Atlas: Sesame'),
    h('pre', {}, JSON.stringify(accessToken)),
    h(EncodedLoginForm, { onLogin }),
    accessToken && h(User, { accessToken, http, baseURL }),
    accessToken && h(GrantForm, { accessToken, http, baseURL }),
    accessToken && h(CreateUserForm, { accessToken, http, baseURL })
  ];
};

const LoginForm = ({ onSubmitOfferProof })/*: Node*/  => {
  const [encodedProof, setEncodedProof] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const onSubmit = (e) => {
    e.preventDefault();
    const proof = accessOfferProofEncoder.decode(encodedProof);
    onSubmitOfferProof(proof, deviceName);
  }
  return [
    h('form', { onSubmit }, [
      h('p', {}, [
        h('div', {}, 'You are currently not logged in'),
        h('div', {}, 'Enter an Access Code to log in.'),
      ]),
      h('label', {}, [
        h('p', {}, 'Access Code:'),
        h('input', {
          type: 'text',
          placeholder: 'Long string of random characters',
          onChange: e => setEncodedProof(e.currentTarget.value),
          value: encodedProof,
        })
      ]),
      h('label', {}, [
        h('p', {}, 'Device Name:'),
        h('input', {
          type: 'text',
          placeholder: 'Kitchen Laptop, Main Workstation, e.g.',
          onChange: e => setDeviceName(e.currentTarget.value),
          value: deviceName,
        })
      ]),
      h('input', { type: 'submit', value: 'Login with Access Code' })
    ])
  ]
};

const Homepage = ()/*: Node*/ => {
  const [accessProof, setAccessProof] = useLocalStorage('sesame_access_grant_proof', null, v => toNullable(v, toAccessGrantProof));
  const http = createWebClient(fetch);
  const baseURL = new URL('http://localhost:5543')
  const style = {

  };
  const onSubmitOfferProof = async (accessOfferProof, deviceName) => {
    const guestClient = createGuestSesameClient({ http, baseURL })
    const { grantProof } = await guestClient.acceptAccess(deviceName, accessOfferProof);
    setAccessProof(() => grantProof)
  };
  return [
    h('header', { style }, [
      h('h1', {}, 'Astral Atlas - OpenSesame'),
    ]),
    !accessProof ? h(LoginForm, { onSubmitOfferProof }) : null,
    accessProof && h(User, { http, baseURL, accessProof }),
    accessProof && h('pre', {}, JSON.stringify(accessProof, null, 2)),
    accessProof && h('button', { onClick: () => setAccessProof(() => null) }, 'Logout')
  ]
};

export {
  GuestHomepage,
  Homepage,
};
