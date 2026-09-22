import { defineConfig } from 'vite';

// Configuração do Vite para GitHub Pages
// base: './' permite funcionar em subdiretórios do GitHub Pages
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
  },
  server: {
    port: 5173,
    open: true,
  },
});
