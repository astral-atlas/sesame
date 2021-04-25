// @flow strict
/*:: import type { Node } from 'preact'; */
import { h } from 'preact';

/*::
export type ContentIslandProps = {|
  children: Node,
|};
*/;

export const contentIslandStyle = `
.content-island {
  padding: 32px;
  margin: 32px;

  box-shadow: 0 0 16px 0px #bdbdbd;
  box-sizing: border-box;
}
`;

export const ContentIsland = ({ children }/*: ContentIslandProps*/)/*: Node*/ => {
  return h('section', { class: 'content-island' }, children);
};

export const styles = [contentIslandStyle];