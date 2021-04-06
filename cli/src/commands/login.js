// @flow strict
/*:: import type { AccessGrantProof } from '@astral-atlas/sesame-models'; */
/*:: import type { GuestSesameClient } from '@astral-atlas/sesame-client'; */
/*:: import type { CLIConfig } from '../config'; */
const { request } = require('http');
const { accessOfferProofEncoder, toAccessId, toUserId } = require('@astral-atlas/sesame-models');
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
  const login = async (offerProof) => {
    const { grantProof } = await guestSesameClient.acceptAccess(config.deviceName || 'Unnamed Command Line', offerProof);

    await  writeCLIConfig({ ...config, accessGrantProof:grantProof });
  };
  const handleEncodedLogin = async () => {
    const cli = createCLI();
    const encodedProof = await cli.ask(`Please enter your access code`);
    const offerProof = accessOfferProofEncoder.decode(encodedProof);
    cli.finish();
    await login(offerProof);
  };
  const handleManualLogin = async () => {
    const cli = createCLI();
    const offerSecret = await cli.ask(`Please enter your offer secret`);
    const id = await cli.ask(`Please enter your offer id`);
    const subject = await cli.ask(`Please enter your user id`);
    const loginToken = { offerSecret, id: toAccessId(id), subject: toUserId(subject) };
    cli.finish();
    await login(loginToken);
  };

  return { handleEncodedLogin, handleManualLogin };
};

module.exports = {
  createLoginCLI,
};