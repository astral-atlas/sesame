// @flow struct

import { styles as islandStyles } from '../components/island';
import { styles as formStyles } from '../components/form';
import { styles as navigationStyles } from '../components/navigation';

const applicationStyles = [
  ...islandStyles,
  ...formStyles,
  ...navigationStyles,
];

const createApplicationStyleElement = () => {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = applicationStyles.join('\n');
  return styleElement;
};

export const insertStyleElement = () => {
  if (!document.head)
    throw new Error(`Cannot append style element when document has no head`);
  document.head.appendChild(createApplicationStyleElement());
}