import { useEffect } from "react";

// Registers the service worker so the app shell works offline.
export default function OfflineSupport() {
  useEffect(() => {
    // Ask the browser not to evict the locally stored diary.
    navigator.storage?.persist?.().catch(() => {});
    if (import.meta.env.PROD && !window.SleepyNative && "serviceWorker" in navigator) {
      const baseUrl = import.meta.env.BASE_URL || "./";
      const swUrl = baseUrl.endsWith("/") ? `${baseUrl}sw.js` : `${baseUrl}/sw.js`;
      navigator.serviceWorker
        .register(swUrl, { scope: baseUrl })
        .catch(() => {
          // Fallback to relative registration if custom base scope fails
          navigator.serviceWorker.register("./sw.js").catch(() => {});
        });
    }
  }, []);
  return null;
}
