// @flow strict
/*:: import type { Component } from "@lukekaalim/act"; */
/*:: import type { IdentityProof } from "@astral-atlas/sesame-models"; */
import { h, useState} from '@lukekaalim/act';

import styles from './home.module.css';
import { useAPI } from "../hooks/api.js";
import { useAsync } from "../src/hooks/async";

/*::
export type LoogedInControlsProps = {
  identity: { proof: IdentityProof },
  onIdentityChange: (identity: ?{ proof: IdentityProof }) => mixed, 
};
*/

export const LoggedInControls/*: Component<LoogedInControlsProps>*/ = ({ identity, onIdentityChange }) => {
  const client = useAPI();

  const [u, setU] = useState(Date.now());
  const [user, error] = useAsync(() => client.user.get(identity.proof.userId), [identity.proof.userId, u]);

  if (error)
    return h('pre', {}, error.stack);

  if (!user)
    return null;

  const onChangeName =  async (e) => {
    await client.user.update(user.id, { name: e.target.value })
    setU(Date.now())
  }
  const onLogoutClick = async (e) => {
    await client.grants.identity.revoke(user.id, identity.proof.grantId);
    onIdentityChange(null);
  }

  return [
    h('section', { class: styles.loggedInControls }, [
      h('p', { class: styles.loginControlsName }, [
        `You are logged into Astral Atlas as: `,
        h('label', { class: styles.loginControlsNameLabel }, [
          h('input', { type: 'text', onChange: onChangeName, class: styles.loginControlsNameInput, value: user.name }),
          h('span', { class: styles.loginControlsNameLabelHint }, 'Change your name')
        ]),
      ])
    ]),
    h('span', { style: { flexGrow: '1', width: '50%' }}),
    h('link', { rel: 'preload', href: '/2d/5e_box_selected.png', as: 'image' }),
    h('button', { class: styles.toggleButton, onClick: onLogoutClick }, 'Log Out of Astral Atlas')
  ];
}
