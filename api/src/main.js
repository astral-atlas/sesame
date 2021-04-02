// @flow strict
const { createServer } = require('http');
const { router } = require('@lukekaalim/server');
const { createRoutes } = require('./routes');
const { createServices } = require('./services');
const { loginTokenEncoder } = require('@astral-atlas/sesame-models');

const { readConfig } = require('./config');

const main = async (configPath) => {
  try {
    const config = await readConfig(configPath);
    const services = await createServices(config);
    const routes = createRoutes(services);
    const listener = router(routes);
    const server = createServer((req, res) => (console.log(req.url), listener(req, res)));

    server.listen(config.port, () => console.log(`Running on: "http://localhost:${server.address().port}"`))
  } catch (error) {
    console.error(error.message, error.stack);
  }
};

main(...process.argv.slice(2));
