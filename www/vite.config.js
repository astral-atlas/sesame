import { resolve } from 'path';

export default {
  server: {
    port: 8080
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        nested: './trustedFrame/index.html'
      }
    }
  }
};