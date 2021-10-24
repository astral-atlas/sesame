// @flow strict
/*:: import type { Component } from "@lukekaalim/act"; */
/*:: import type { IdentityProof } from "@astral-atlas/sesame-models"; */
import { h, useState, useRef } from '@lukekaalim/act';

import styles from './home.module.css';
import { useAPI } from "../hooks/api.js";
import { useAsync } from "../src/hooks/async";
import { CopperButton } from "../components/button.js";

/*::
export type LoogedInControlsProps = {
  identity: { proof: IdentityProof },
  onIdentityChange: (identity: ?{ proof: IdentityProof, version: number }) => mixed, 
};
*/

export const LoggedInControls/*: Component<LoogedInControlsProps>*/ = ({ identity, onIdentityChange }) => {
  const client = useAPI();

  const [u, setU] = useState(Date.now());
  const [user, error] = useAsync(() => client.user.get(identity.proof.userId), [identity.proof.userId, u]);
  const userIdRef = useRef();

  if (error)
    return [
      h('pre', {}, error.stack || error.message),
      h('button', { class: styles.toggleButton, onClick: () => onIdentityChange(null) }, 'Log Out of Astral Atlas')
    ]

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
  const onIdClick = async () => {
    const { current: htmlStrongElement } = userIdRef;
    if (!htmlStrongElement)
      return;
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNode(htmlStrongElement.childNodes[0]);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  return [
    h('section', { class: styles.loggedInControls }, [
      h('p', { class: styles.loginControlsName }, [
        `You are logged into Astral Atlas as: `,
        h('label', { class: styles.loginControlsNameLabel }, [
          h('input', { type: 'text', onChange: onChangeName, class: styles.loginControlsNameInput, value: user.name }),
          h('span', { class: styles.loginControlsNameLabelHint }, 'Change your name')
        ]),
      ]),
      h('p', { class: styles.loginControlsId }, [
        `Your user ID is `,
        h('strong', { onClick: onIdClick, ref: userIdRef, class: styles.loginControlsIdPick }, [
          `${user.id}`,
          h('span', { class: styles.loginControlsIdHint }, 'Click to Select ID')
        ])
      ]),
    ]),
    h('span', { style: { flexGrow: '1', width: '50%' }}),
    h(CopperButton, { onClick: onLogoutClick }, 'Log Out of Astral Atlas'),
  ];
}
