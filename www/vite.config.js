import { resolve } from 'path';

export default {
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'frame/authorizer': resolve(__dirname, 'frame/authorizer.html'),
        'frame/embed': resolve(__dirname, 'frame/embed.html'),
        'frame/popoutAuth': resolve(__dirname, 'frame/popoutAuth.html'),
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