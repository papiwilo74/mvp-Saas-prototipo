import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
    env: {
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
      JWT_SECRET: 'test-jwt-secret-key-at-least-24-chars!!',
      FRONTEND_URL: 'http://localhost:5173',
      NODE_ENV: 'test',
      LOGIN_RATE_LIMIT_MAX: '3',
      LOGIN_RATE_LIMIT_WINDOW_MS: '60000',
      PUBLIC_RATE_LIMIT_MAX: '100',
      PUBLIC_RATE_LIMIT_WINDOW_MS: '60000'
    }
  }
});
