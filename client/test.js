// @flow strict
import { assert, colorReporter, exitCodeReporter } from '@lukekaalim/test';

const test = async () => {
  const assertion = assert('@astral-atlas/sesame-client', [
    assert('imports without error', (await import('./src/main.js'), true))
  ])
  console.log(colorReporter(assertion));
  process.exitCode = exitCodeReporter(assertion);
};

test();