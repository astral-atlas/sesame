// @flow strict
import { h, render } from 'preact';
import 'preact/debug';
import { Homepage } from './pages/homepages';

const SesameWebsite = () => {
  const path = '/';
  switch (path) {
    case '/':
      return h(Homepage);
  }
};

const main = () => {
  const root = document.body
  if (!root)
    return;
  render(h(SesameWebsite), root)
};

main();