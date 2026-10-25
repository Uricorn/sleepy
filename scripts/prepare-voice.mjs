// Fetches the on-device speech-to-text assets into public/voice (git-ignored) so the web
// build and the Android APK never need network access at runtime. Run automatically before
// dev/build; set SLEEPY_SKIP_VOICE=1 to skip (voice input then will not work).
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

if (process.env.SLEEPY_SKIP_VOICE === '1') {
  console.log('Skipping voice assets (SLEEPY_SKIP_VOICE=1).');
  process.exit(0);
}

const REPO = 'onnx-community/whisper-base';
const REVISION = '1846881b6b3a3024392c1eea3ad983695bc23925'; // pinned model revision
const FILES = [
  'config.json', 'generation_config.json', 'preprocessor_config.json', 'tokenizer.json',
  'tokenizer_config.json', 'added_tokens.json', 'special_tokens_map.json', 'vocab.json', 'merges.txt',
  'normalizer.json', 'onnx/encoder_model_quantized.onnx', 'onnx/decoder_model_merged_quantized.onnx',
];
const exists = (p) => stat(p).then((s) => s.size > 0, () => false);

for (const f of FILES) {
  const dest = path.join('public/voice/models', REPO, f);
  if (await exists(dest)) continue;
  await mkdir(path.dirname(dest), { recursive: true });
  const res = await fetch(`https://huggingface.co/${REPO}/resolve/${REVISION}/${f}`);
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${f}`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  console.log('downloaded', f);
}
console.log('Voice assets ready.');
