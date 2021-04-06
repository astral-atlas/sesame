// @flow strict
/*:: import type { CLIConfig } from '../config'; */
const { createCLI } = require('../ask');
const {  } = require('@astral-atlas/sesame-models')
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

  cli.finish();

  await writeCLIConfig({
    ...config,
    baseURL: newURL,
    deviceName: newDeviceName,
  });
};

module.exports = {
  handleInitCommand,
};
