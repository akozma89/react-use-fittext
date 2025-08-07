/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['**/__tests__/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/example/**',
        '**/src/index.ts',
        '**/src/types.ts',
        '**/vite.config.ts',
        '**/vitest.config.ts',
        '**/dist/**',
      ],
    },
  },
});
