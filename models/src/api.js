// @flow strict

module.exports = {
  api: {
    ...require('./api/users'),
    ...require('./api/access'),
  }
};
