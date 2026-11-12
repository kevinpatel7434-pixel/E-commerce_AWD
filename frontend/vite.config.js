import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// healthcheck.railway.app is the Host header Railway's healthcheck sends.
const hosts = [process.env.RAILWAY_PUBLIC_DOMAIN, 'healthcheck.railway.app'].filter(Boolean);

export default defineConfig({
  plugins: [react()],
  server: { host: '0.0.0.0', allowedHosts: hosts },
  preview: { host: '0.0.0.0', allowedHosts: hosts },
});
