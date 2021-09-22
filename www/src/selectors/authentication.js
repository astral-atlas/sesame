// @flow strict
/*:: import type { ApplicationState } from '../context/application'; */

export const isLoggedIn = (application/*: ApplicationState*/)/*: boolean*/ => {
  switch (application.authentication.type) {
    default:
      throw new Error('Unknown Login State');
    case 'none':
      return false;
    case 'grant':
    case 'super':
      return true;
  }
};