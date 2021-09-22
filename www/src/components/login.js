// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { AccessGrantProof, AccessOfferProof } from '@astral-atlas/sesame-models'; */
import { h } from 'preact';
import { useContext, useState } from 'preact/hooks';
import { accessOfferProofEncoder } from '@astral-atlas/sesame-models';
import { applicationContext } from '../context/application';
import { Form, FormHint, FormLabeledSelect, LabeledInput, LabeledTextInput } from './form';
import { useAPI } from "../context/api";

/*::
export type SuperuserLoginFormProps = {|
  onSuperuserSubmit: (username: string, password: string) => mixed,
  accessError?: null | Error,
|}
*/

const SuperuserLoginForm = ({ onSuperuserSubmit, accessError = null }/*: SuperuserLoginFormProps*/)/*: Node*/ => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onFormSubmit = () => {
    onSuperuserSubmit(username, password)
  };

  return h(Form, { onFormSubmit }, [
    h(FormHint, { tone: 'warning' }, [
      h('p', {}, 'Super Users are administrators with elevated credentials.'),
      h('details', {}, [
        h('summary', {}, 'What should I do as a super user?'),
        h('p', {}, `When an Astral Atlas server is started there will only be one user: the Super User.`),
        h('p', {}, `The Super User should only be used to create other normal users and then should be disabled.`),
      ]),
    ]),
    //accessError && h(FormHint, { tone: 'error' },
    //  h('pre', { style: { whiteSpace: 'break-spaces' } }, JSON.stringify(JSON.parse(accessError.response.body), null, 2))
    //),
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
  accessError?: null | Error,
|}
*/

const AccessOfferLoginForm = ({ onOfferSubmit, accessError = null }/*: AccessOfferLoginFormProps*/)/*: Node*/ => {
  const [encodedOffer, setEncodedOffer] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [encodingError, setEncodingError] = useState(null);

  const onFormSubmit = () => {
    try {
      const offerProof = accessOfferProofEncoder.decode(encodedOffer);
      setEncodingError(null);
      onOfferSubmit(offerProof, deviceName)
    } catch (error) {
      console.error(error);
      setEncodingError(error);
    }
  };

  return h(Form, { onFormSubmit }, [
    h(FormHint, {}, [
      h('p', {}, 'Enter your secret Access Code to login.'),
      h('p', {}, 'Note: Each Access Code is one-use only.'),
      h('details', {}, [
        h('summary', {}, 'What is a Access Code?'),
        h('p', {}, `An access code is a special password that you can redeem to login a computer, tablet or phone.`),
        h('p', {}, [
          `An Access Code is a `,
          h('strong', {} , `secret! `),
          `Don't share it with anyone, since they could then use it to log in as you.`
        ]),
      ]),
      h('details', {}, [
        h('summary', {}, 'Where can I get an access code?'),
        h('p', {}, `Your Dungeon Master can create an access code for you, and you can create your own access codes to log in other devices.`),
      ]),
      h('details', {}, [
        h('summary', {}, 'What should my device name be?'),
        h('p', {}, `A device name is stored alongside your access code: You can see a list of all device names that have logged into your account.`),
        h('p', {}, `Your device name should be short but unique. Try something like: "Work Laptop" or "Living Room Tablet".`),
        h('p', {}, `Only you can see your devices names.`),
      ])
    ]),
    encodingError && h(FormHint, { tone: 'warning' }, [
      h('p', {}, `There was an issue with your access code:`),
      h('pre', { style: { whiteSpace: 'break-spaces' } }, encodingError.message),
      h('p', {}, `Try ensuring the code is exactly copied from it's source, or try getting a new one.`),
    ]),
    //accessError && h(FormHint, { tone: 'error' },
    //  h('pre', { style: { whiteSpace: 'break-spaces' } }, JSON.stringify(JSON.parse(accessError.response.body), null, 2))
    //),
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

  const api = useAPI();
  const [,dispatch] = useContext(applicationContext);
  const [accessError, setAccessError] = useState(null);

  const onOfferSubmit = async (offerProof, deviceName) => {
    try {
      const { grantProof: accessGrantProof, user: self } = await client.acceptAccess(deviceName, offerProof);
      setAccessError(null);
      dispatch({ type: 'login', self, authentication: { type: 'grant', accessGrantProof } });
    } catch (error) {
      console.error(error);
      setAccessError(error);
    }
  }
  const onSuperuserSubmit = async (username, password) => {
    try {
      const authorizedClient = client.authorize({ authMode: 'super', username, password });
      const { self } = await authorizedClient.getSelfUser();
      setAccessError(null);
      dispatch({ type: 'login', self, authentication: { type: 'super', username, password } });
    } catch (error) {
      console.error(error);
      setAccessError(error);
    }
  };

  return [
    h(Form, {}, [
      h(FormLabeledSelect, {
        onSelectOption: newLoginMode => (setAccessError(null), setLoginMode(newLoginMode)),
        options: [{ value: 'grant', label: 'Access Code' }, { value: 'super', label: 'Superuser'}],
        label: 'Login Mode',
        value: loginMode,
      }),
    ]),
    loginMode === 'super' ? h(SuperuserLoginForm, { onSuperuserSubmit, accessError }) : null,
    loginMode === 'grant' ? h(AccessOfferLoginForm, { onOfferSubmit, accessError }) : null,
  ]
};