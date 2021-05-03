// @flow strict
import { createServer } from 'http';
import { router } from '@lukekaalim/server';
import { createRoutes } from './routes.js';
import { createServices } from './services.js';

import { readConfig } from './config.js';

const main = async (configPath) => {
  try {
    const config = await readConfig(configPath);
    const services = await createServices(config);
    const routes = createRoutes(services);
    const listener = router(routes);
    const server = createServer((req, res) => (console.log(req.method, req.url), listener(req, res)));

    server.listen(config.port, () => console.log(`Running on: "http://localhost:${server.address().port}"`))
  } catch (error) {
    console.error(error.message, error.stack);
  }
};

main(...process.argv.slice(2));
