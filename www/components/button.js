// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
import { h } from '@lukekaalim/act';

import styles from './components.module.css';

/*::
export type ButtonProps = {
  onClick: () => mixed,
}
*/

export const CopperButton/*: Component<ButtonProps>*/ = ({ onClick, children }) => {
  return h('button', { class: styles.copperButton, onClick }, children);
}