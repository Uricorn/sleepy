import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Sleepy · Privacy Policy" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5 px-5 py-10 text-foreground">
      <Link to="/" className="text-sm text-primary">← Back to Sleepy</Link>
      <h1 className="font-heading text-3xl font-extrabold">Privacy Policy</h1>
      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold">Your diary stays on your device</h2>
        <p className="text-muted-foreground">Sleepy needs no account. Your sleep entries and reminder settings are stored only in this device's local storage. We do not collect, upload or sell them.</p>
      </section>
      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold">The Assistant</h2>
        <p className="text-muted-foreground">The Assistant uses a simple on-device text parser. It does not contact an AI service or analyze screenshots. Nothing is added to your diary until you tap "Add to diary". The Android app has no internet permission.</p>
      </section>
      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold">Backups and deleting data</h2>
        <p className="text-muted-foreground">You can export a backup file, import it on another device, or erase everything from "Your data". Uninstalling the app or clearing browser data deletes your diary unless you have a backup.</p>
      </section>
      <section className="space-y-2">
        <h2 className="font-heading text-lg font-bold">Not medical advice</h2>
        <p className="text-muted-foreground">Sleepy is a personal journal and does not provide medical advice or diagnosis.</p>
      </section>
    </div>
  );
}