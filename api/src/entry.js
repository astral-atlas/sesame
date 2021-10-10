// @flow strict
import { createServer } from 'http';
import { createRouteListener, listenServer } from '@lukekaalim/http-server';
import { createRoutes } from './routes.js';
import { createServices } from './services.js';

import { loadConfigFromFile } from './config.js';

const main = async (configPath = 'config.json5') => {
  try {
    const config = await loadConfigFromFile(configPath);
    const services = await createServices(config);
    const routes = createRoutes(services);
    const fallback = (req, res) => {
      console.log(`Not Found: ${req.url}`);
      res.setHeader('content-type', 'text/plain');
      res.write("404: Not Found");
      res.statusCode = 404;
      res.end();
    }
    const server = createServer(createRouteListener(routes, fallback));

    const { httpOrigin } = await listenServer(server, config.port || 0, config.host || 'localhost');
    console.log(`Running @ ${httpOrigin}`);
  } catch (error) {
    console.error(error.message, error.stack);
  }
};

main(...process.argv.slice(2));
