// @flow strict
/*:: import type { AccessOptions } from '@lukekaalim/http-server'; */

export const routeOptions/*: {| access: AccessOptions |}*/ = {
  access: {
    origins: { type: 'wildcard' },
    headers: ['authorization', 'content-type'],
    methods: ['PUT', 'POST', 'GET', 'DELETE'],
    cache: 600
  },
};