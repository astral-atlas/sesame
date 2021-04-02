// @flow strict
/*:: import type { CLIConfig } from '../config'; */
/*:: import type { CLI } from '../ask'; */
/*:: import type { UserSesameClient } from '@astral-atlas/sesame-client'; */
const { createHTTPClient } = require('../http');
const { createUserSesameClient } = require("@astral-atlas/sesame-client");
const { loginTokenEncoder } = require('@astral-atlas/sesame-models');

/*::
export type UserCommands =
  | ['whoami']
  | ['new', 'login']
export type UserCLI = {
  handleCommand: (...args: string[]) => Promise<void>,
};
*/

const createUsersCLI = (client/*: UserSesameClient*/)/*: UserCLI*/ => {
  const whoami = async () => {
    const { admin, self } = await client.getSelf();
    console.log(self);
    admin && console.log(admin)
  };
  const newLogin = async () => {
    const { self } = await client.getSelf();
    const loginToken = await client.createLoginGrant(self.id);
    console.log('This is your login token. Don\'t share it with anyone!')
    console.log(loginTokenEncoder.encode(loginToken));
  };
  const handleCommand = async (command, subcommand) => {
    switch (command) {
      case undefined:
      case 'whoami':
        return await whoami();
      case 'new':
        switch (subcommand) {
          case 'login':
            return await newLogin();
          default:
            throw new Error();
        }
        default:
          throw new Error();
    }
  }

  return { handleCommand };
};

module.exports = {
  createUsersCLI,
};
