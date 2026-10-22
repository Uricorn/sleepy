import { useEffect } from "react";

// Registers the service worker (production only) so the app shell works offline.
export default function OfflineSupport() {
  useEffect(() => {
    // Ask the browser not to evict the locally stored diary.
    navigator.storage?.persist?.().catch(() => {});
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}