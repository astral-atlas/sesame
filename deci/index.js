#!/usr/bin/env node
// @flow strict
import { rollup, watch } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';

const inputOptions = {
  input: 'src/main.js',
  plugins: [
    alias({
      entries: [
        { find: 'react', replacement: 'preact/compat' },
        { find: 'react-dom', replacement: 'preact/compat' }
      ]
    }),
    nodeResolve(),
    commonjs()
  ]
};
const outputOptions = {
  file: 'dist/bundle.js',
  format: 'esm',
  sourcemap: true,
};

const main = async (command, ...args) => {
  switch (command) {
    case 'build':
      const bundle = await rollup(inputOptions);
      await bundle.write(outputOptions);
      await bundle.close();
      console.log('Written!');
      return;
    case 'version':
      console.log('Cool version')
      return;
    default:
      console.log('Unknown command!')
      return;
  }
};

main(...process.argv.slice(2));