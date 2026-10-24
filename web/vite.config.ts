import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// mode "demo": un solo archivo HTML que funciona sin servidor (todo corre en el navegador).
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'demo' ? [viteSingleFile()] : [])],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared/src'),
      '@data': path.resolve(__dirname, '../data'),
    },
  },
  build: { outDir: mode === 'demo' ? 'dist-demo' : 'dist' },
  server: {
    host: true, // permite abrirlo desde el celular en la misma red wifi
    fs: { allow: ['..'] },
    proxy: { '/api': 'http://localhost:3001' },
  },
}));
