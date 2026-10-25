// Runs Whisper fully on-device. Audio never leaves the browser.
import { pipeline, env } from "@huggingface/transformers";
// ONNX Runtime WebAssembly files, bundled with the app (emitted as hashed assets by Vite).
import ortMjs from "../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.asyncify.mjs?url";
import ortWasm from "../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.asyncify.wasm?url";

// Everything is served from the app's own origin (public/voice) — no network access.
env.allowRemoteModels = false;
env.allowLocalModels = true;
env.useBrowserCache = false;
env.localModelPath = "/voice/models/";
env.backends.onnx.wasm.wasmPaths = { mjs: ortMjs, wasm: ortWasm };

let asr = null;

async function load() {
  if (asr) return asr;
  asr = await pipeline("automatic-speech-recognition", "onnx-community/whisper-tiny", {
    device: "wasm",
    dtype: "q8",
    progress_callback: (p) => {
      if (p.status === "progress") self.postMessage({ type: "progress", progress: p.progress });
    },
  });
  return asr;
}

self.onmessage = async (e) => {
  const { audio, language } = e.data;
  try {
    const model = await load();
    self.postMessage({ type: "transcribing" });
    const out = await model(audio, { language, task: "transcribe", chunk_length_s: 30, max_new_tokens: 128, no_repeat_ngram_size: 4 });
    self.postMessage({ type: "done", text: (out.text || "").trim() });
  } catch (err) {
    self.postMessage({ type: "error", message: String(err?.message || err) });
  }
};
