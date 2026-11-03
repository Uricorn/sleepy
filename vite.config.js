import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

const skipVoice = process.env.SLEEPY_SKIP_VOICE === '1';

// F-Droid build: replace the Whisper worker with an empty module so neither it nor the prebuilt
// ONNX Runtime WebAssembly it imports ends up in the bundle (the mic button is hidden anyway).
const stripVoiceWorker = {
  name: 'strip-voice-worker',
  enforce: 'pre',
  load(id) {
    if (skipVoice && id.split('?')[0].endsWith('/src/lib/whisper-worker.js')) return 'export {};';
  },
};

export default defineConfig({
  base: './',
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react(), tailwindcss(), ...(skipVoice ? [stripVoiceWorker] : [])],
  // SLEEPY_SKIP_VOICE=1 (the F-Droid build) ships without the on-device speech model, so the mic is hidden.
  define: { 'import.meta.env.VITE_VOICE': JSON.stringify(skipVoice ? '0' : '1') },
  // Worker bundles are built separately, so the plugin must be registered for them too.
  worker: { format: 'es', plugins: () => (skipVoice ? [stripVoiceWorker] : []) },
  build: { target: 'es2020' },
});
