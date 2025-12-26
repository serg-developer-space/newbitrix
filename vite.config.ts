import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Гарантирует правильные пути к ассетам на GitHub Pages
  define: {
    // Это лечит ошибку "process is not defined", которая часто является причиной белого экрана
    'process.env': {}
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
});