// @flow strict
/*:: import type { Node } from 'preact'; */
import { h } from 'preact';
import { ContentIsland } from '../components/island';
import { NavigationHeader } from '../components/navigation';
import { AccessInfo } from '../components/user';

export const AccessPage = ()/*: Node*/ => {
  return [
    h(NavigationHeader),
    h('main', {}, [
      h(ContentIsland, {}, [
        h('h2', {}, 'Access'),
        h(AccessInfo)
      ]),
    ])
  ];
};