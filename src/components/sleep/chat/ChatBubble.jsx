import { cn } from "@/lib/utils";
import { ApplyCard } from "./ApplyCard";

export function ChatBubble({ message }) {
  const mine = message.role === "user";
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div className={cn("min-w-0 max-w-[85%] rounded-2xl px-4 py-3 text-sm", mine ? "bg-[#818CF8] text-[#0C1017]" : "border border-border bg-card")}>
        {message.images?.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {message.images.map((src) => (
              <img key={src} src={src} alt="Uploaded screenshot" className="h-24 w-16 rounded-lg object-cover" />
            ))}
          </div>
        )}
        {message.content && <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{message.content}</p>}
        {message.fields && <ApplyCard fields={message.fields} />}
      </div>
    </div>
  );
}