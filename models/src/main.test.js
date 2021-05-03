// @flow strict
import './main.js';
import { assert, colorReporter, exitCodeReporter } from '@lukekaalim/test';

const test = async () => {
  const assertion = assert('@astral-atlas/sesame-models', [
    // no tests
  ]);
  console.log(colorReporter(assertion)); 
  process.exitCode = exitCodeReporter(assertion);
};

test();