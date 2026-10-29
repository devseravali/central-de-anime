import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    host: 'localhost',
    strictPort: true,
  },

  preview: {
    port: 4173,
    strictPort: true,
  },

  test: {
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    environment: 'node',
    clearMocks: true,
    restoreMocks: true,
  },
});