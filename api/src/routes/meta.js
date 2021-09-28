// @flow strict

export const routeOptions = {
  access: {
    origins: { type: 'wildcard' },
    headers: ['authorization', 'content-type'],
    cache: 600
  },
};