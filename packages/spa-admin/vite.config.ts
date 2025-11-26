import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Proxy ONLY /api and /s to Worker during development
      // DO NOT proxy /src (that's Vite's source files)
      '^/api/.*': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        rewrite: (path) => path,
      },
      '^/s/.*': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});

