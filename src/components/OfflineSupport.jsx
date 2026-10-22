import { useEffect } from "react";

// Registers the service worker (production only) so the app shell works offline.
export default function OfflineSupport() {
  useEffect(() => {
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}