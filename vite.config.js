import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

export default defineConfig({
  base: './',
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react(), tailwindcss()],
  // SLEEPY_SKIP_VOICE=1 (the F-Droid build) ships without the on-device speech model, so the mic is hidden.
  define: { 'import.meta.env.VITE_VOICE': JSON.stringify(process.env.SLEEPY_SKIP_VOICE === '1' ? '0' : '1') },
  build: { target: 'es2020' },
});
