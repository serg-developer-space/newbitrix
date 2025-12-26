import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Важно для корректных путей на GitHub Pages
  define: {
    // Исправляет ошибку "process is not defined"
    'process.env': {
      NODE_ENV: JSON.stringify('production'),
      API_KEY: JSON.stringify(process.env.API_KEY || '')
    },
    // Исправляет ошибку "global is not defined"
    'global': 'window',
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false
  }
});