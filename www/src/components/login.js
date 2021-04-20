// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { AccessGrantProof, AccessOfferProof } from '@astral-atlas/sesame-models'; */
import { h } from 'preact';
import { useContext, useState } from 'preact/hooks';
import { accessOfferProofEncoder } from '@astral-atlas/sesame-models';
import { useGuestSesameClient } from '../hooks/sesameClient';
import { applicationContext } from '../context/application';
import { createUserSesameClient } from '@astral-atlas/sesame-client';
import { LabeledInput, LabeledTextInput } from './form';

/*::
export type SuperuserLoginFormProps = {|
  onSuperuserSubmit: (username: string, password: string) => mixed,
|}
*/

const SuperuserLoginForm = ({ onSuperuserSubmit }/*: SuperuserLoginFormProps*/)/*: Node*/ => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    onSuperuserSubmit(username, password)
  };

  return h('form', { onSubmit }, [
    h(LabeledTextInput,
        { label: 'Username', placeholder: 'Special value set by admin',
        value: username, onTextChange: v => setUsername(v)
      }),
    h(LabeledTextInput,
        { label: 'Password', placeholder: 'Secret password set by admin',
        value: password, onTextChange: v => setPassword(v)
      }),
    h('input', { type: 'submit', value: 'Login with Superuser Credentials' })
  ])
};

/*::
export type AccessOfferLoginFormProps = {|
  onOfferSubmit: (offerProof: AccessOfferProof, deviceName: string) => mixed,
|}
*/

const AccessOfferLoginForm = ({ onOfferSubmit }/*: AccessOfferLoginFormProps*/)/*: Node*/ => {
  const [encodedOffer, setEncodedOffer] = useState('');
  const [deviceName, setDeviceName] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    const offerProof = accessOfferProofEncoder.decode(encodedOffer);
    onOfferSubmit(offerProof, deviceName)
  };

  return h('form', { onSubmit }, [
    h(LabeledTextInput,
        { label: 'Access Code', placeholder: 'Special Code',
        value: encodedOffer, onTextChange: v => setEncodedOffer(v)
      }),
    h(LabeledTextInput,
        { label: 'Device Name', placeholder: 'Kitchen Laptop, Main Workstation, e.g.',
        value: deviceName, onTextChange: v => setDeviceName(v)
      }),
    h('input', { type: 'submit', value: 'Login with Access Code' })
  ])
};

export const LoginForm = ()/*: Node*/  => {
  const [loginMode, setLoginMode] = useState('grant');

  const client = useGuestSesameClient();
  const { dispatch } = useContext(applicationContext);

  const onOfferSubmit = async (offerProof, deviceName) => {
    const { grantProof: accessGrantProof, user: self } = await client.acceptAccess(deviceName, offerProof);
    dispatch({ type: 'login', self, authentication: { type: 'grant', accessGrantProof } });
  }
  const onSuperuserSubmit = async (username, password) => {
    const authorizedClient = client.authorize({ authMode: 'super', username, password });
    const { self } = await authorizedClient.getSelfUser();
    dispatch({ type: 'login', self, authentication: { type: 'super', username, password } });
  };

  return [
    h('select', { onChange: e => setLoginMode(e.currentTarget.value) }, [
      h('option', { value: 'grant' }, 'Access Code'),
      h('option', { value: 'super' }, 'Superuser'),
    ]),
    loginMode === 'super' ? h(SuperuserLoginForm, { onSuperuserSubmit }) : null,
    loginMode === 'grant' ? h(AccessOfferLoginForm, { onOfferSubmit }) : null,
  ]
};