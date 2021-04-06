// @flow strict
/*:: import type { CLIConfig } from '../config'; */
/*:: import type { CLI } from '../ask'; */
/*:: import type { UserSesameClient } from '@astral-atlas/sesame-client'; */
const { createHTTPClient } = require('../http');
const { createUserSesameClient } = require("@astral-atlas/sesame-client");
const { accessOfferProofEncoder } = require('@astral-atlas/sesame-models');

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
    const { self, admin, access } = await client.getSelfUser();
    console.log(`Logged in as ${self.name} (${self.id})`);
    if (access)
      console.log(`Using access granted to "${access.deviceName}"`)
    if (admin)
      console.log(`${self.name} is an Admin (${admin.id})`);
  };
  const newLogin = async () => {
    const { self } = await client.getSelfUser();
    const { offerProof } = await client.createAccessOfferForSelf();
    console.log('This is your secret access code. Keep it safe!')
    console.log(accessOfferProofEncoder.encode(offerProof));
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
