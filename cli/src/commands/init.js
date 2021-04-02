// @flow strict
/*:: import type { CLIConfig } from '../config'; */
const { createCLI } = require('../ask');
const { accessTokenEncoder } = require('@astral-atlas/sesame-models')
const { readCLIConfig, writeCLIConfig } = require('../config');

const handleInitCommand = async (config/*: CLIConfig*/) => {
  const cli = createCLI();

  const newURL = await cli.ask(
    `What's the API URL you want to connect to?`,
    config.baseURL || ''
  );
  const newDeviceName = await cli.ask(
    `What's this device\'s name?`,
    config.deviceName || ''
  );
  const newAccessToken = (await cli.ask(
    `What's your encoded access token? (leave blank if n/a)`,
    config.accessToken ? accessTokenEncoder.encode(config.accessToken) : '',
  )).trim();

  cli.finish();

  await writeCLIConfig({
    ...config,
    baseURL: newURL,
    deviceName: newDeviceName,
    accessToken: newAccessToken !== '' ? accessTokenEncoder.decode(newAccessToken) : null,
  });
};

module.exports = {
  handleInitCommand,
};
