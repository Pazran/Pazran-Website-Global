import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  appType: 'mpa',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sovereignsearch: resolve(__dirname, 'sovereignsearch/index.html'),
      },
    },
  },
});
