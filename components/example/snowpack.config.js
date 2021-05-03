// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration
const cleanup = require('rollup-plugin-cleanup');

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  workspaceRoot: '../../',
  mount: {
    /* ... */
  },
  plugins: [
    /* ... */
  ],
  packageOptions: {
    rollup: {
      plugins: [cleanup()],
    }
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
};
