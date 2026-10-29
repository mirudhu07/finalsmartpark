import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@smartpark/shared': path.resolve(__dirname, '../../packages/shared/dist/index.js'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 10000,
  },
});
