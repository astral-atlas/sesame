// @flow strict
/*:: import type { Node } from 'preact'; */
import { h } from 'preact';
import { Form, FormHint } from './form';

/*::
export type AuthorizationFormProps = {|
  onAuthorizeClick: () => mixed,
|};
*/

export const authorizationFormStyles = `
.authorization-form {
  background-color: #4c5571;
  width: 100%;
  height: 100%;
  padding: 16px;
  color: white;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.authorization-form p {
  text-align: center;
  margin: 0 0 8px 0;
  max-width: 256px;
}
.authorization-form input[type="submit"] {
  margin: 0;
  background-color: #349960;
  width: 100%;
  color: white;
  border: solid #7dd5a4 2px;
  font-weight: bold;
  flex-grow: 1;
  max-width: 512px;
  max-height: 64px;
}
`;

export const AuthorizationForm = ({ onAuthorizeClick }/*: AuthorizationFormProps*/)/*: Node*/ => {
  const onSubmit = (event) => {
    event.preventDefault();
    onAuthorizeClick();
  };
  return h('form', { onSubmit, class: 'authorization-form' }, [
    h('p', {}, `Authorize this third-party application?`),
    h('input', { type: 'submit', value: `Authorize ${document.referrer}` }),
  ]);
};

export const styles = [
  authorizationFormStyles,
];