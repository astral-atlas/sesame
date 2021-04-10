// @flow strict
import 'preact/debug';
import { h, render } from 'preact';
import { Homepage } from './pages/homepages';
import { SesameClientProvider } from './context/sesameClient';
import { ApplicationProvider } from './context/application';

const SesamePage = ({ children }) => {
  const style = {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };
  return h(ApplicationProvider, {},
    h(SesameClientProvider, { baseURL: new URL('http://localhost:5543'), accessGrantProof: null },
      h('span', { style }, [
        h('header', {}, [
          h('h1', {}, 'Astral Atlas - OpenSesame'),
        ]),
        children,
      ])));
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