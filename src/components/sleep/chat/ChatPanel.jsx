import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Mic, Square } from "lucide-react";
import { toast } from "sonner";
import { chatWithAssistant } from "@/lib/chat-fns";
import { todayNightKey, formatDateLabel } from "@/lib/sleep-utils";
import { missingPrompts } from "@/lib/missing-info";
import { ChatBubble } from "./ChatBubble";
import { useI18n } from "@/i18n";
import { useDictation } from "@/lib/use-dictation";

const INTRO = {
  role: "assistant",
  content: "Hi! Tell me about your night (e.g. “bed at 11:30pm, up at 7am, slept 7.5 hours, quality 4”), and I'll extract diary entries for you.",
};

export function ChatPanel() {
  const { t, lang } = useI18n();
  const [messages, setMessages] = useState([INTRO]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const dictation = useDictation({
    lang,
    onText: (text) => setInput((v) => (v ? `${v} ${text}` : text).slice(0, 2000)),
    onError: (m) => toast.error(m === "denied" ? t("Microphone access was denied.") : m === "silent" ? t("No speech detected.") : t("Voice input failed.")),
  });
  const voiceBusy = dictation.status === "loading" || dictation.status === "transcribing";
  const recording = dictation.status === "recording";
  const [lastDate, setLastDate] = useState(null);
  const inputRef = useRef(null);
  const endRef = useRef(null);
  const rootRef = useRef(null);
  const [fitH, setFitH] = useState(null);

  // On mobile, size the panel so its input sits just above the on-screen keyboard.
  const fitToKeyboard = () => {
    const vv = window.visualViewport;
    const el = rootRef.current;
    if (!vv || !el || window.innerWidth >= 768) return;
    const top = el.getBoundingClientRect().top;
    setFitH(Math.max(200, vv.offsetTop + vv.height - top - 8));
  };
  const onFocusInput = () => {
    setTimeout(() => {
      rootRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
      setTimeout(fitToKeyboard, 300);
    }, 350);
  };
  useEffect(() => {
    const vv = window.visualViewport;
    const reset = () => {
      if (vv && window.innerHeight - vv.height < 100) setFitH(null);
    };
    vv?.addEventListener("resize", reset);
    return () => vv?.removeEventListener("resize", reset);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  // After a night is saved, tell the user what is still empty for it and offer quick prompts.
  const onApplied = (date, entry) => {
    setLastDate(date);
    const missing = missingPrompts(entry);
    const label = formatDateLabel(date);
    setMessages((m) => [
      ...m,
      missing.length
        ? { role: "assistant", content: t("Still missing for {date} — tap one to fill it in:", { date: label }), suggestions: missing }
        : { role: "assistant", content: t("{date} is fully logged. You can still add awakenings or notes.", { date: label }) },
    ]);
  };

  const onSuggest = (starter) => {
    setInput((v) => (v && !/\s$/.test(v) ? `${v}, ${starter}` : `${v}${starter}`).slice(0, 2000));
    inputRef.current?.focus();
  };

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
      toast.error(t("An error occurred while parsing your message."));
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
    <div ref={rootRef} style={fitH ? { height: fitH } : undefined} className="flex h-[calc(var(--vvh,100dvh)-20rem)] min-h-64 flex-col md:h-[calc(100dvh-6rem)]">
      <div className="flex-1 space-y-3 overflow-y-auto pb-3">
        {messages.map((m, i) => (
          <ChatBubble key={i} message={m} defaultDate={lastDate} onApplied={onApplied} onSuggest={onSuggest} />
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> {t("Reading…")}
          </div>
        )}
        {voiceBusy && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />{" "}
            {t("Transcribing…")}
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onFocusInput}
          rows={2}
          maxLength={2000}
          placeholder={t("Message… (e.g. bed at 11pm, up at 7am, slept 7.5h, quality 4)")}
          className="h-16 flex-1 resize-none rounded-2xl border border-border bg-secondary px-4 py-2 text-sm leading-snug focus:outline-none focus:ring-2 focus:ring-[#818CF8]"
        />
        {import.meta.env.VITE_VOICE !== "0" && (
          <button
            type="button"
            onClick={recording ? dictation.stop : dictation.start}
            disabled={voiceBusy}
            aria-label={recording ? t("Stop recording") : t("Voice input")}
            className={`grid h-16 w-14 shrink-0 place-items-center rounded-2xl border border-border disabled:opacity-60 ${recording ? "animate-pulse bg-destructive text-white" : "bg-secondary"}`}
          >
            {voiceBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : recording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
        )}
        <button
          onClick={send}
          disabled={busy || !input.trim()}
          aria-label={t("Send")}
          className="grid h-16 w-14 shrink-0 place-items-center rounded-2xl bg-[#818CF8] text-[#0C1017] disabled:opacity-60"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
