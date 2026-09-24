import { defineConfig } from 'vitest/config';

// Root tests only. packages/ui runs its own Vitest with jsdom.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
  },
});
