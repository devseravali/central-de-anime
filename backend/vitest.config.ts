import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    maxWorkers: 4,
    setupFiles: ['./src/tests/setup.ts'],
    testTimeout: 20000,
  },
});
