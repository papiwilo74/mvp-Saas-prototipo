import { defineConfig } from 'vitest/config';

process.env.JWT_SECRET = 'test-jwt-secret-key-at-least-24-chars!!';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.js'],
      exclude: ['src/__tests__/**', 'src/server.js'],
      thresholds: {
        branches: 40,
        functions: 40,
        lines: 40,
        statements: 40
      }
    },
    testTimeout: 15000,
    hookTimeout: 15000,
  }
});