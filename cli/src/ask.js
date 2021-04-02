// @flow strict
const { EOL } = require('os');
const { createInterface } = require('readline');

const withCLI = async /*:: <T>*/(
  handler/*: (ask: (question: string, defaultAnswer?: string) => Promise<string>
) => Promise<T>*/)/*: Promise<T>*/ => {
  const i = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    const ask = (question, defaultAnswer = '') => new Promise(res => {
      i.question(question + EOL, a => res(a));
      i.write(defaultAnswer);
    });
    return await handler(ask);
  } finally {
    i.close();
  }
};

/*::
export type CLI = {
  ask: (question: string, defaultAnswer?: string) => Promise<string>,
  finish: () => void,
}
*/
const createCLI = ()/*: CLI*/ => {
  const i = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (question, defaultAnswer = '') => new Promise(res => {
    i.question(question + EOL, a => res(a));
    i.write(defaultAnswer);
  });
  const finish = () => i.close();

  return {
    ask,
    finish,
  }
};

module.exports = {
  createCLI,
  withCLI,
};
