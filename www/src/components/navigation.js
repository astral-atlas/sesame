// @flow strict
/*:: import type { Node } from 'preact'; */
import { h } from 'preact';
import { useContext } from 'preact/hooks';
import { applicationContext } from '../context/application';
import { locationContext } from '../context/location';

const Anchor = ({ path, query, children, ...props }) => {
  const { url, navigate } = useContext(locationContext);
  const destination = new URL(path, url);
  destination.search = new URLSearchParams(query).toString();
  const onClick = (e) => {
    e.preventDefault();
    navigate(destination);
  };

  return h('a', { ...props, onClick, href: destination.href }, children)
};

const NavigationAnchor = () => {

};

export const NavigationSidePane = ()/*: Node*/ => {
  const { navigate, url } = useContext(locationContext);

  return h('nav', {}, h('ul', {}, [
    h(Anchor, { path: '/', query: {} }, 'Home'),
    h(Anchor, { path: '/profile', query: {} }, 'Profile'),
    h(Anchor, { path: '/access', query: {} }, 'Access'),
  ]))
};

export const navigationHeaderStyle = `
.navigation-header {
  display: flex;
  flex-direction: column;
  
  position: sticky;
  top: 0;
}
.page-list {
  display: flex;
  flex-direction: row;
  margin: 8px 0 8px 0;
}
.page-list-link {
  display: flex;
  
  border: solid 1px white;
  border-radius: 4px;

  margin: 0 8px 0 0px;
  transition: background-color 0.2s;
  text-decoration: none;
}
.page-list-link:hover {
  background-color: #ffffff3d;
  text-decoration: underline;
}
.page-list-link.active {
  color: black;
  background-color: white;
  text-decoration: underline;
}
.page-list-link > a {
  color: inherit;
  padding: 8px;
}
`;

export const NavigationHeader = ()/*: Node*/ => {
  const { url } = useContext(locationContext)

  const pages = [];

  return h('header', { class: 'navigation-header' }, [
    h('h1', {}, 'Astral Atlas - OpenSesame'),
    h('nav', {},
      h('ul', { class: 'page-list' }, pages.map(({ path, title }) =>
        h('li', { class: ['page-list-link', url.pathname === path ? 'active' : 'inactive'].join(' ') },
          h(Anchor, { path, }, title)))))
  ]);
};

export const styles = [
  navigationHeaderStyle
];