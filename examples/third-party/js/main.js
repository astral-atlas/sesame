// @flow strict
import { h, render } from 'preact';
import { AuthorizerFrame } from '@astral-atlas/sesame-components';

const App = () => {
  const style = {
    display: 'flex',
    overflow: 'hidden',
    resize: 'both',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#c7ccdf'
  };
  return h('div', { style }, h(AuthorizerFrame, {
    wwwBaseURL: new URL('http://localhost:8080'),
    onAuthorizeOffer: console.log
  }))
}

const main = () => {
  const body = document.body;
  if (!body)
    return;
  render(h(App), body);
};

main();