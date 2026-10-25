import { cn } from "@/lib/utils";
import { ApplyCard } from "./ApplyCard";
import { useI18n } from "@/i18n";

export function ChatBubble({ message, defaultDate, onApplied, onSuggest }) {
  const { t } = useI18n();
  const mine = message.role === "user";
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div className={cn("min-w-0 max-w-[85%] rounded-2xl px-4 py-3 text-sm", mine ? "bg-[#818CF8] text-[#0C1017]" : "border border-border bg-card")}>
        {message.content && <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{mine ? message.content : t(message.content)}</p>}
        {message.fields && <ApplyCard fields={message.fields} defaultDate={defaultDate} onApplied={onApplied} />}
        {message.suggestions?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.suggestions.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => onSuggest?.(s.starter)}
                className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium"
              >
                + {t(s.label)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}