#!/usr/bin/env node
// @flow strict
const { request } = require('http'); 
const { createInterface } = require('readline');
const { readCLIConfig, writeCLIConfig } = require('./config');
const { createNodeClient } = require('@lukekaalim/http-client');
const { handleInitCommand } = require('./commands/init');
const { createLoginCLI } = require('./commands/login');
const { name, version } = require('../package.json');
const { createUsersCLI } = require('./commands/users');
const { createUserSesameClient, createGuestSesameClient } = require('@astral-atlas/sesame-client');

const handleUnauthenticatedCommand = () => {

};

const main = async (command, ...args) => {
  try {
    const config = await readCLIConfig();
    const { accessGrantProof, baseURL } = config;
    const http = createNodeClient(request);

    switch (command) {
      case 'init':
        return await handleInitCommand(config);
      case 'version':
        return console.log(`${name}@${version}`)
    }
    if (!baseURL)
      throw new Error('No BaseURL set; Try running "sesame init"?')

    const guestClient = createGuestSesameClient({ baseURL: new URL(baseURL), http })
    const loginCLI = createLoginCLI(guestClient, config);

    switch (command) {
      case 'login':
        const encodedLogin = args.includes('-encoded');
        if (encodedLogin)
          return await loginCLI.handleEncodedLogin();
        else
          return await loginCLI.handleManualLogin();
    }

    if (!accessGrantProof)
      throw new Error('No AccessToken set; Try running "sesame login"?');
    if (!config.baseURL)
      throw new Error('No BaseURL set; Try running "sesame init"?');

    const userClient = createUserSesameClient({ http, baseURL: new URL(config.baseURL), accessGrantProof })
    const userCli = createUsersCLI(userClient);

    switch (command) {
      case 'me':
        return await userCli.handleCommand(...args);
    }
    throw new Error(`Unknown command "${command}"`)
  } catch (error) {
    console.error(error);
  }
};

main(...process.argv.slice(2));