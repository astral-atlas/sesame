// @flow strict
import { render, h } from 'preact';
import { TrustedFrame } from '@astral-atlas/sesame-components';

const TrustedApp = () => {
  return [
    'Hello',
    h(TrustedFrame, { providerOrigin: 'http://localhost:8080' })
  ];
};

const main = () => {
  const { body } = document;
  if (body)
    render(h(TrustedApp), body);
};

main();