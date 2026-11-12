import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const hosts = [process.env.RAILWAY_PUBLIC_DOMAIN].filter(Boolean);

export default defineConfig({
  plugins: [react()],
  server: { host: '0.0.0.0', allowedHosts: hosts },
  preview: { host: '0.0.0.0', allowedHosts: hosts },
});
