import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Where the Express + ws backend runs (backend/.env PORT).
const BACKEND = process.env.BACKEND_URL || 'http://localhost:3000';

// In dev the browser only talks to the Vite origin; Vite forwards:
//   /api/*  -> backend REST (prefix stripped: /api/login -> /login)
//   /ws     -> backend WebSocket upgrade
// This avoids CORS entirely, so no backend changes are needed.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: BACKEND,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/ws': {
        target: BACKEND,
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
