import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'mf_history',
      filename: 'remoteEntry.js',
      exposes: {
        './PokemonHistory': './src/PokemonHistory.tsx',
      },
      shared: ['react', 'react-dom'],
    }),
    {
      name: 'serve-federation-remote-dev',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/assets/')) {
            const cleanUrl = req.url.split('?')[0];
            const filePath = path.resolve(__dirname, 'dist', cleanUrl.replace(/^\//, ''));
            if (fs.existsSync(filePath)) {
              const ext = path.extname(filePath);
              if (ext === '.js' || ext === '.mjs') {
                res.setHeader('Content-Type', 'application/javascript');
              } else if (ext === '.css') {
                res.setHeader('Content-Type', 'text/css');
              }
              res.setHeader('Access-Control-Allow-Origin', '*');
              return fs.createReadStream(filePath).pipe(res);
            }
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 3002,
    strictPort: true,
    host: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  preview: {
    port: 3002,
    strictPort: true,
  },
  build: {
    target: 'esnext',
    modulePreload: false,
    minify: false,
    cssCodeSplit: false,
  },
});
