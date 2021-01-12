// @flow strict
const { } = require('..');
const { assert, colorReporter, exitCodeReporter } = require('@lukekaalim/test');

const test = async () => {
  const assertion = assert('@astral-atlas/sesame-models', [
    // no tests
  ]);
  console.log(colorReporter(assertion)); 
  process.exitCode = exitCodeReporter(assertion);
};

test();