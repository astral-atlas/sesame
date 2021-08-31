// @flow strict
/*:: import type { Component } from 'preact'; */
/*:: import type { ApplicationState } from './context/application'; */

/*::
export type Page = {
  path: string,
  title: string,
};
*/

const homePage = {
  path: '/',
  title: 'Home',
};
const profilePage = {
  path: '/profile',
  title: 'Profile',
};
const accessPage = {
  path: '/access',
  title: 'Access',

};
const usersPage = {
  path: '/users',
  title: 'Users',
};

export const guestPages/*: Page[]*/ = [
  homePage,
];

export const userPages/*: Page[]*/ = [
  ...guestPages,
  profilePage,
  accessPage,
];

export const adminPages/*: Page[]*/ = [
  ...userPages,
  usersPage,
];

export const allPages/*: Page[]*/ = [
  ...adminPages,
];

export const getPagesForState = ({ self }/*: ApplicationState*/)/*: Page[]*/ => {
  if (!self)
    return guestPages;
  else if (self.adminId)
    return adminPages;
  else
    return userPages;
}