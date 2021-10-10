import { resolve } from 'path';

export default {
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'frame/login': resolve(__dirname, 'frame/login.html'),
        'token/login': resolve(__dirname, 'token/login.html'),
      }
    }
  },
  server: {
    port: 8080
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly'
    }
  }
};