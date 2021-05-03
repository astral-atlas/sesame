// @flow strict

export const toBase64 = (input/*: string*/)/*: string*/ => {
  if (typeof Buffer !== 'undefined')
    return Buffer.from(input, 'utf8').toString('base64');
  if (typeof btoa !== 'undefined')
    return btoa(input);
  throw new Error(`No method on this platform to encode base64 encoded string`);
};

export const fromBase64 = (input/*: string*/)/*: string*/ => {
  if (typeof Buffer !== 'undefined')
    return Buffer.from(input, 'base64').toString('utf8');
  if (typeof atob !== 'undefined')
    return atob(input);
  throw new Error(`No method on this platform to decode base64 encoded string`);
};
