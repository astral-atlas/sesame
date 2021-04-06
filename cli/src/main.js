#!/usr/bin/env node
// @flow strict
const { request } = require('http'); 
const { createInterface } = require('readline');
const { readCLIConfig, writeCLIConfig } = require('./config');
const { createNodeClient, HTTPInternalError } = require('@lukekaalim/http-client');
const { handleInitCommand } = require('./commands/init');
const { createLoginCLI } = require('./commands/login');
const { name, version } = require('../package.json');
const { createSelfCLI, createUserCLI } = require('./commands/users');
const { createUserSesameClient, createGuestSesameClient, createAdminSesameClient } = require('@astral-atlas/sesame-client');

const handleUnauthenticatedCommand = () => {

};

const commands = {
  init: 'init',
  version: 'version',
  login: 'login',
  superLogin: 'super-login',
  me: 'me',
};

const main = async (command, ...args) => {
  try {
    const config = await readCLIConfig();
    const { login, baseURL } = config;
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
      case 'super-login':
        return await loginCLI.handleSuperLogin();
    }

    if (login.type === 'none')
      throw new Error('No Login set; Try running "sesame login"?');

    const createClientArgs = () => {
      switch (login.type) {
        case 'super':
          return { http, baseURL: new URL(baseURL), authMode: 'super', username: login.username, password: login.password };
        case 'grant':
          return { http, baseURL: new URL(baseURL), authMode: 'grant', accessGrantProof: login.proof };
        default:
          throw new Error('Unexpected login strategy');
      }
    };
    const clientArgs = createClientArgs();

    const userClient = createUserSesameClient(clientArgs)
    const selfCLI = createSelfCLI(userClient);

    switch (command) {
      case 'me':
        return await selfCLI.handleCommand(...args);
    }

    const adminClient = await createAdminSesameClient(clientArgs);
    const userCLI = createUserCLI(adminClient);
    switch (command) {
      case 'users':
        return await userCLI.handleCommand(...args);
    };
    throw new Error(`Unknown command "${command}"`)
  } catch (error) {
    const typedError/*: Error*/ = error;
    // $FlowFixMe
    if (typedError.response) {
      // $FlowFixMe Oh god fix me
      console.error(JSON.parse(typedError.response.body).error.stack)
    }
  }
};

main(...process.argv.slice(2));