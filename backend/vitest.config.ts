import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['backend/**/*.test.ts', 'backend/**/*.spec.ts'],
    exclude: ['node_modules', '.git'],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
});
