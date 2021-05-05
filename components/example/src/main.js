// @flow strict
import { h, render } from 'preact';
import { AuthorizerFrame } from '@astral-atlas/sesame-components';

const App = () => {
  return h(AuthorizerFrame, {
    wwwBaseURL: new URL('http://localhost:5000'),
    onAuthorizeOffer: console.log
  })
}

const main = () => {
  const body = document.body;
  if (!body)
    return;
  render(h(App), body);
};

main();