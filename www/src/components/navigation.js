// @flow strict
/*:: import type { Node } from 'preact'; */
import { h } from 'preact';
import { useContext } from 'preact/hooks';
import { locationContext } from '../context/location';

const Anchor = ({ path, query, children }) => {
  const { url, navigate } = useContext(locationContext);
  const destination = new URL(path, url);
  destination.search = new URLSearchParams(query).toString();
  const onClick = (e) => {
    e.preventDefault();
    navigate(destination);
  };

  return h('a', { onClick, href: destination.href }, children)
};

export const NavigationSidePane = ()/*: Node*/ => {
  const { navigate, url } = useContext(locationContext);

  return h('nav', {}, h('ul', {}, [
    h(Anchor, { path: '/', query: {} }, 'Home'),
    h(Anchor, { path: '/profile', query: {} }, 'Profile'),
    h(Anchor, { path: '/access', query: {} }, 'Access'),
  ]))
};