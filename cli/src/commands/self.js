// @flow strict
/*:: import type { CLIConfig } from '../config'; */
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { UserSesameClient } from '@astral-atlas/sesame-client'; */
const { createUserSesameClient } = require('@astral-atlas/sesame-client');
const { readCLIConfig } = require('../config');

/*::
export type UserCLI = {
  handleSelfCommand: () => Promise<void>,
}
*/

const createUserCLI = (config/*: CLIConfig*/, http/*: HTTPClient*/, userClient/*: UserSesameClient*/)/*: UserCLI*/ => {
  const handleSelfCommand = async () => {
    const { baseURL, accessToken } = config;
  
    if (!baseURL)
      throw new Error();
    if (!accessToken)
      throw new Error();
  
    const { self, admin } = await userClient.getSelf();
    console.log(`Logged in as ${self.name} (${self.id})`);
    console.log(`Using Access Grant (${accessToken.accessGrantId})`)
    if (admin)
      console.log(`${self.name} is an Admin (${admin.id})`);
  };
  return { handleSelfCommand };
};

module.exports = {
  createUserCLI,
};