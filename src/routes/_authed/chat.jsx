import { createFileRoute } from "@tanstack/react-router";
import { WifiOff } from "lucide-react";
import { ChatPanel } from "@/components/sleep/chat/ChatPanel";
import { useOnline } from "@/hooks/useOnline";

export const Route = createFileRoute("/_authed/chat")({
  ssr: false,
  head: () => ({ meta: [{ title: "Lull · Assistant" }] }),
  component: ChatPage,
});

function ChatPage() {
  const online = useOnline();
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold">Assistant</h1>
        <p className="text-sm text-muted-foreground">Chat or upload screenshots to fill in your diary. Uploads are sent to the assistant (stored privately).</p>
      </div>
      {!online && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <WifiOff className="h-5 w-5 shrink-0" /> Offline: typed notes are read on this device. Screenshots need internet.
        </div>
      )}
      <ChatPanel />
    </div>
  );
}