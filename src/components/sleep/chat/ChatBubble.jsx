import { cn } from "@/lib/utils";
import { ApplyCard } from "./ApplyCard";
import { useI18n } from "@/i18n";

export function ChatBubble({ message }) {
  const { t } = useI18n();
  const mine = message.role === "user";
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div className={cn("min-w-0 max-w-[85%] rounded-2xl px-4 py-3 text-sm", mine ? "bg-[#818CF8] text-[#0C1017]" : "border border-border bg-card")}>
        {message.content && <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{mine ? message.content : t(message.content)}</p>}
        {message.fields && <ApplyCard fields={message.fields} />}
      </div>
    </div>
  );
}