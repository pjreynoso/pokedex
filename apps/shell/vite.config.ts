import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        mf_detail: {
          type: 'module',
          name: 'mf_detail',
          entry: 'http://localhost:3001/remoteEntry.js',
          entryGlobalName: 'mf_detail',
          shareScope: 'default',
        },
        mf_history: {
          type: 'module',
          name: 'mf_history',
          entry: 'http://localhost:3002/remoteEntry.js',
          entryGlobalName: 'mf_history',
          shareScope: 'default',
        },
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
  server: {
    port: 3000,
    strictPort: true,
    host: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
  build: {
    target: 'esnext',
    modulePreload: false,
    minify: false,
    cssCodeSplit: false,
  },
});
