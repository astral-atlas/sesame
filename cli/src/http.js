// @flow strict
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
const { request } = require('http');
const { createNodeClient } = require("@lukekaalim/http-client");

const createHTTPClient = ()/*: HTTPClient*/ => createNodeClient(request);

module.exports = {
  createHTTPClient,
};