import { useEffect, useRef, useState } from "react";
import { ImagePlus, Send, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { chatWithAssistant } from "@/lib/chat-fns";
import { todayNightKey } from "@/lib/sleep-utils";
import { ChatBubble } from "./ChatBubble";
import { useOnline } from "@/hooks/useOnline";
import { parseLocal } from "@/lib/local-parser";

const INTRO = {
  role: "assistant",
  content: "Hi! Tell me about your night, or upload a screenshot from your ring or watch, and I'll suggest diary entries to add.",
};

export function ChatPanel() {
  const [messages, setMessages] = useState([INTRO]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const online = useOnline();
  const fileRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, busy]);

  const pick = (e) => {
    const picked = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    e.target.value = "";
    setFiles((cur) => [...cur, ...picked].slice(0, 4));
  };

  const send = async () => {
    const text = input.trim();
    if ((!text && !files.length) || busy) return;
    const previews = files.map((f) => URL.createObjectURL(f));
    const userMsg = { role: "user", content: text, images: previews };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    const toUpload = files;
    setFiles([]);
    if (!navigator.onLine) {
      const res = parseLocal(text);
      const hasFields = Object.keys(res.fields).length > 0;
      setMessages((m) => [...m, { role: "assistant", content: files.length ? `${res.reply} (Screenshots were skipped — they need internet.)` : res.reply, fields: hasFields ? res.fields : null }]);
      return;
    }
    setBusy(true);
    try {
      const urls = [];
      for (const file of toUpload) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 600 });
        urls.push(signed_url);
      }
      const payload = history
        .filter((m) => m !== INTRO)
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.content || "(screenshot attached)" }));
      const res = await chatWithAssistant({ data: { today: todayNightKey(), messages: payload, imageUrls: urls } });
      const hasFields = Object.keys(res.fields).length > 0;
      setMessages((m) => [...m, { role: "assistant", content: res.reply, fields: hasFields ? res.fields : null }]);
    } catch {
      toast.error("The assistant couldn't respond. Check your connection and try again.");
    } finally {
      setBusy(false);
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
      {files.length > 0 && (
        <div className="flex gap-2 pb-2">
          {files.map((f, i) => (
            <div key={i} className="relative">
              <img src={URL.createObjectURL(f)} alt="Selected screenshot" className="h-16 w-12 rounded-lg object-cover" />
              <button
                aria-label="Remove image"
                onClick={() => setFiles((cur) => cur.filter((_, j) => j !== i))}
                className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-secondary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={pick} />
        <button onClick={() => fileRef.current?.click()} disabled={!online} title={online ? undefined : "Screenshots need internet"} aria-label="Upload images" className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-border bg-secondary disabled:opacity-40">
          <ImagePlus className="h-5 w-5" />
        </button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          maxLength={2000}
          placeholder="Message…"
          className="min-h-14 flex-1 resize-none rounded-2xl border border-border bg-secondary px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-[#818CF8]"
        />
        <button onClick={send} disabled={busy} aria-label="Send" className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#818CF8] text-[#0C1017] disabled:opacity-60">
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}