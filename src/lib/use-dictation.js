import { useCallback, useEffect, useRef, useState } from "react";

// Whisper language names for the app's supported locales.
const WHISPER_LANG = {
  en: "english", es: "spanish", fr: "french", de: "german", pt: "portuguese", ru: "russian",
  zh: "chinese", ja: "japanese", hi: "hindi", ar: "arabic", he: "hebrew", uk: "ukrainian",
  it: "italian", tr: "turkish", pl: "polish", ko: "korean", fa: "persian", ur: "urdu",
};

async function decodeTo16k(blob) {
  const ctx = new AudioContext({ sampleRate: 16000 });
  try {
    const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
    return buf.getChannelData(0);
  } finally {
    ctx.close();
  }
}

/**
 * Local-only dictation. The mic permission is requested only when start() is called
 * (user taps the mic icon). status: idle | recording | loading | transcribing
 */
export function useDictation({ lang, onText, onError }) {
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(null);
  const workerRef = useRef(null);
  const recRef = useRef(null);
  const cb = useRef({ onText, onError });
  cb.current = { onText, onError };

  const getWorker = () => {
    if (workerRef.current) return workerRef.current;
    const w = new Worker(new URL("./whisper-worker.js", import.meta.url), { type: "module" });
    w.onmessage = (e) => {
      const m = e.data;
      if (m.type === "progress") setProgress(Math.round(m.progress));
      else if (m.type === "transcribing") {
        setProgress(null);
        setStatus("transcribing");
      } else if (m.type === "done") {
        setProgress(null);
        setStatus("idle");
        if (m.text) cb.current.onText(m.text);
      } else if (m.type === "error") {
        setProgress(null);
        setStatus("idle");
        cb.current.onError(m.message);
      }
    };
    workerRef.current = w;
    return w;
  };

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setStatus("loading");
        try {
          const audio = await decodeTo16k(new Blob(chunks, { type: rec.mimeType }));
          // Whisper invents text on silence, so skip near-silent recordings.
          const rms = Math.sqrt(audio.reduce((a, v) => a + v * v, 0) / (audio.length || 1));
          if (rms < 0.003) {
            setStatus("idle");
            cb.current.onError("silent");
            return;
          }
          getWorker().postMessage({ audio, language: WHISPER_LANG[lang] || "english" });
        } catch (err) {
          setStatus("idle");
          cb.current.onError(String(err?.message || err));
        }
      };
      rec.start();
      recRef.current = rec;
      setStatus("recording");
    } catch (err) {
      setStatus("idle");
      cb.current.onError(err?.name === "NotAllowedError" ? "denied" : String(err?.message || err));
    }
  }, [lang]);

  const stop = useCallback(() => {
    if (recRef.current?.state === "recording") recRef.current.stop();
  }, []);

  useEffect(
    () => () => {
      if (recRef.current?.state === "recording") {
        recRef.current.onstop = null;
        recRef.current.stop();
        recRef.current.stream?.getTracks().forEach((t) => t.stop());
      }
      workerRef.current?.terminate();
    },
    [],
  );

  return { status, progress, start, stop };
}
