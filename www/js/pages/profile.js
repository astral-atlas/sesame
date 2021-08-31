// @flow strict
/*:: import type { Node } from 'preact'; */
import { h } from 'preact';
import { useContext } from 'preact/hooks';
import { Form, LabeledTextInput } from '../components/form';
import { ContentIsland } from '../components/island';
import { NavigationHeader } from '../components/navigation';
import { applicationContext } from '../context/application';

export const ProfilePage = ()/*: Node*/ => {
  const { appState: { self } } = useContext(applicationContext);

  if (!self)
    return h(NavigationHeader);

  return [
    h(NavigationHeader),
    h('main', {}, [
      h(ContentIsland, {}, [
        h('h2', {}, 'Profile'),
        h(Form, {}, [
          h(LabeledTextInput, { label: 'Name', disabled: true, onTextChange: () => {}, value: self.name, })
        ]),
      ]),
    ])
  ];
};