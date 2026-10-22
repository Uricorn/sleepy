import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { chatWithAssistant } from "@/lib/chat-fns";
import { todayNightKey } from "@/lib/sleep-utils";
import { ChatBubble } from "./ChatBubble";

const INTRO = {
  role: "assistant",
  content: "Hi! Tell me about your night (e.g. “bed at 11:30pm, up at 7am, slept 7.5 hours, quality 4”), and I'll extract diary entries for you. Note: this local text parser reads typed notes and does not analyze screenshots.",
};

export function ChatPanel() {
  const [messages, setMessages] = useState([INTRO]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const userMsg = { role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setBusy(true);
    try {
      const res = await chatWithAssistant({ data: { today: todayNightKey(), messages: history } });
      const hasFields = res?.fields && Object.keys(res.fields).length > 0;
      setMessages((m) => [...m, { role: "assistant", content: res.reply, fields: hasFields ? res.fields : null }]);
    } catch {
      toast.error("An error occurred while parsing your message.");
    } finally {
      setBusy(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex h-[calc(100dvh-10rem)] flex-col md:h-[calc(100dvh-6rem)]">
      <div className="flex-1 space-y-3 overflow-y-auto pb-3">
        {messages.map((m, i) => (
          <ChatBubble key={i} message={m} />
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Reading…
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={2000}
          placeholder="Message… (e.g. bed at 11pm, up at 7am, slept 7.5h, quality 4)"
          className="min-h-14 flex-1 resize-none rounded-2xl border border-border bg-secondary px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-[#818CF8]"
        />
        <button
          onClick={send}
          disabled={busy || !input.trim()}
          aria-label="Send"
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#818CF8] text-[#0C1017] disabled:opacity-60"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
