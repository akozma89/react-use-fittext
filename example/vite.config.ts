import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/react-use-fittext/' : '/',
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      'react-use-fittext': resolve(import.meta.dirname, '../src'),
    },
  },
});
