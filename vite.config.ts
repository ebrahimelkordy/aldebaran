import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { processTransmission } from './api/_lib/sendTransmission';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: './',
    plugins: [
      react(),
      {
        name: 'vite-plugin-aldebaran-api',
        configureServer(server) {
          server.middlewares.use('/api/transmit', (req, res, next) => {
            if (req.method !== 'POST') return next();
            let bodyStr = '';
            req.on('data', (chunk) => {
              bodyStr += chunk;
            });
            req.on('end', async () => {
              try {
                const body = JSON.parse(bodyStr || '{}');
                const ip = req.socket.remoteAddress || '127.0.0.1';
                const result = await processTransmission(body, ip, {
                  ...process.env,
                  ...env,
                });
                res.statusCode = result.status;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify(result.json));
              } catch (e) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ ok: false, code: 'UPSTREAM_ERROR', error: String(e) }));
              }
            });
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      include: ['three'],
      exclude: ['lucide-react'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'three-core': ['three'],
          },
        },
      },
    },
  };
});
