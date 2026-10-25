// Runs Whisper fully on-device. Audio never leaves the browser.
import { pipeline, env } from "@huggingface/transformers";

env.allowLocalModels = false;

let asr = null;

async function load() {
  if (asr) return asr;
  const device = self.navigator?.gpu ? "webgpu" : "wasm";
  asr = await pipeline("automatic-speech-recognition", "onnx-community/whisper-base", {
    device,
    dtype: device === "webgpu" ? "fp32" : "q8",
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
    const out = await model(audio, { language, task: "transcribe", chunk_length_s: 30 });
    self.postMessage({ type: "done", text: (out.text || "").trim() });
  } catch (err) {
    self.postMessage({ type: "error", message: String(err?.message || err) });
  }
};
