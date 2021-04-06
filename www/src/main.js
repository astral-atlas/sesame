// @flow strict
import { h, render } from 'preact';
import 'preact/debug';
import { Homepage } from './pages/homepages';

const SesamePage = ({ children }) => {
  const style = {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };
  return h('span', { style }, children)
}

const SesameWebsite = () => {
  const path = '/';
  switch (path) {
    case '/':
      return h(SesamePage, {}, h(Homepage));
  }
};

const main = () => {
  const root = document.body
  if (!root)
    return;
  render(h(SesameWebsite), root)
};

main();