import { ChevronRight, Moon, Sunrise } from "lucide-react";
import { formatDateLabel, formatTime } from "@/lib/sleep-utils";
import { cn } from "@/lib/utils";

function Pill({ on, icon: Icon, label, indigo }) {
  return (
    <span
      className={cn(
        "flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium",
        on
          ? indigo
            ? "border-[#818CF8]/30 bg-[#818CF8]/15 text-[#818CF8]"
            : "border-[#34D399]/30 bg-[#34D399]/15 text-[#34D399]"
          : "border-border bg-secondary text-muted-foreground",
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

export function HistoryList({ entries = [], onEdit }) {
  if (!entries.length) {
    return <p className="text-sm text-muted-foreground">No entries yet. Log tonight to start your diary.</p>;
  }
  return (
    <div className="space-y-2">
      {entries.map((e) => (
        <button
          key={e.id}
          onClick={() => onEdit(e)}
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left hover:border-[#818CF8]/40"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{formatDateLabel(e.date)}</p>
            <p className="text-xs text-muted-foreground">
              {e.bedtime ? `Bed ${formatTime(e.bedtime)}` : "—"} · {e.estimated_total_sleep_hours != null ? `${e.estimated_total_sleep_hours}h` : "—"}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Pill on={e.before_bed_recorded} icon={Moon} label="Night" indigo />
            <Pill on={e.after_waking_recorded} icon={Sunrise} label="AM" />
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}