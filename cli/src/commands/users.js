// @flow strict
/*:: import type { CLIConfig } from '../config'; */
/*:: import type { CLI } from '../ask'; */
/*:: import type { UserSesameClient, AdminSesameClient } from '@astral-atlas/sesame-client'; */
const { createHTTPClient } = require('../http');
const { createUserSesameClient } = require("@astral-atlas/sesame-client");
const { accessOfferProofEncoder } = require('@astral-atlas/sesame-models');
const { createCLI } = require('../ask');

/*::
export type UserCommands =
  | ['whoami']
  | ['new', 'login']
  | ['new', 'user']
export type CLI = {
  handleCommand: (...args: string[]) => Promise<void>,
};
*/
const createUserCLI = (admin/*: AdminSesameClient*/)/*: CLI*/ => {
  const newUser = async () => {
    if (!admin)
      throw new Error('Insufficient permission to create new User');
    const cli = createCLI();
    const name = await cli.ask('What is this new User\'s name?');
    const { newUser } = await admin.createNewUser(name);
    console.log(`User ${newUser.id} (${newUser.name}) has been created`);
    const { offerProof } = await admin.createAccessOffer(newUser.id);
    console.log('This is the new User\'s secret access code. Keep it safe!');
    console.log(accessOfferProofEncoder.encode(offerProof));
    cli.finish();
  };
  const handleCommand = async (command) => {
    switch (command) {
      case undefined:
      default:
        throw new Error();
      case 'new':
        return await newUser();
    }
  };
  return { handleCommand };
};

const createSelfCLI = (client/*: UserSesameClient*/)/*: CLI*/ => {
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
  createSelfCLI,
  createUserCLI,
};
