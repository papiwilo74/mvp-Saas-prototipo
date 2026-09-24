import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';
  const shouldSanitize = isProd && env.VITE_API_URL && env.VITE_API_URL.includes('localhost');

  return {
    plugins: [react()],
    server: {
      port: 5173
    },
    define: shouldSanitize
      ? {
          'import.meta.env.VITE_API_URL': JSON.stringify('')
        }
      : {}
  };
});

