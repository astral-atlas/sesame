#!/usr/bin/env node
// @flow strict
const { createServer } = require('http');
const { createListener } = require('@lukekaalim/server');
const { createRoutes } = require('./routes');
const { createServices } = require('./services');

const main = async () => {
  try {
    const services = await createServices();
    const routes = createRoutes(services);
    const listener = createListener(routes);
    const server = createServer(listener);
  
    const firstUser = await services.user.createUser('Luke', null);
    const firstAdmin = await services.user.createAdmin(firstUser.id);
    const firstToken = await services.tokens.createLoginToken(firstUser.id);
    console.log([firstUser, firstAdmin, firstToken]);
  
    server.listen(0, () => console.log(`http://localhost:${server.address().port}`))
  } catch (error) {
    console.error(error);
  }
};

main();
