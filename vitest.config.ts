import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src/main'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/test/**/*.test.{ts,tsx}'],
  },
});
