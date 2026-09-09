import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/media': 'http://localhost:8000',
    },
  },
  build: {
    // Vendor bundle (React + libs) is ~560kB gzip ~170kB — raise limit to silence noise
    chunkSizeWarningLimit: 700,
  },
});