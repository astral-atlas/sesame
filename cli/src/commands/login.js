// @flow strict
/*:: import type { LoginToken } from '@astral-atlas/sesame-models'; */
/*:: import type { GuestSesameClient } from '@astral-atlas/sesame-client'; */
/*:: import type { CLIConfig } from '../config'; */
const { request } = require('http');
const { loginTokenEncoder } = require('@astral-atlas/sesame-models');
const { createNodeClient } = require('@lukekaalim/http-client');
const { createGuestSesameClient, createUserSesameClient } = require('../../../client/src/main');
const { createCLI } = require('../ask');
const { readCLIConfig, writeCLIConfig } = require('../config');

/*::
export type LoginCLI = {
  handleEncodedLogin: () => Promise<void>,
  handleManualLogin: () => Promise<void>,
}
*/

const createLoginCLI = (guestSesameClient/*: GuestSesameClient*/, config/*: CLIConfig*/)/*: LoginCLI*/ => {
  const login = async (loginToken) => {
    const accessToken = await guestSesameClient.grantAccess(loginToken, config.deviceName || 'Unnamed Command Line');

    await  writeCLIConfig({ ...config, accessToken });
    console.log(accessToken);
  };
  const handleEncodedLogin = async () => {
    const cli = createCLI();
    const encodedLoginToken = await cli.ask(`Please enter your encoded login token`);
    const loginToken = loginTokenEncoder.decode(encodedLoginToken);
    cli.finish();
    await login(loginToken);
  };
  const handleManualLogin = async () => {
    const cli = createCLI();
    const secret = await cli.ask(`Please enter your login secret`);
    const loginGrantId = await cli.ask(`Please enter your login id`);
    const loginToken = { secret, loginGrantId };
    cli.finish();
    await login(loginToken);
  };

  return { handleEncodedLogin, handleManualLogin };
};

module.exports = {
  createLoginCLI,
};