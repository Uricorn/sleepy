import { Plus, X } from "lucide-react";
import { useI18n } from "@/i18n";

// An awakening is { time, out_of_bed, awake_minutes }; all optional. Older entries
// (and chat-parsed ones) are plain "HH:MM" strings, so normalize on read.
const norm = (a) => (typeof a === "string" ? { time: a } : a || {});

export function AwakeningList({ value = [], onChange }) {
  const { t } = useI18n();
  const items = value.map(norm);
  const add = () => onChange([...items, { time: "" }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const patch = (i, p) => onChange(items.map((x, idx) => (idx === i ? { ...x, ...p } : x)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {t("Night awakenings")}
          {items.length > 0 && ` (${items.length})`}
        </span>
        <button type="button" onClick={add} className="flex items-center gap-1 text-sm font-medium text-[#818CF8]">
          <Plus className="h-4 w-4" /> {t("Add")}
        </button>
      </div>
      {items.length === 0 && <p className="text-sm text-muted-foreground">{t("No awakenings recorded.")}</p>}
      <div className="space-y-2">
        {items.map((a, i) => (
          <div key={i} className="space-y-2 rounded-2xl border border-border p-3">
            <div className="flex items-center gap-2">
              <input
                type="time"
                aria-label={t("Time (optional)")}
                value={a.time || ""}
                onChange={(e) => patch(i, { time: e.target.value })}
                className="h-12 flex-1 rounded-2xl border border-border bg-secondary px-4 font-heading text-lg focus:outline-none focus:ring-2 focus:ring-[#818CF8]"
              />
              <button
                type="button"
                aria-label={t("Remove")}
                onClick={() => remove(i)}
                className="grid h-12 w-12 place-items-center rounded-2xl border border-border bg-secondary text-muted-foreground hover:text-destructive"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max="600"
                aria-label={t("Stayed awake (minutes)")}
                placeholder={t("Awake for… min")}
                value={a.awake_minutes ?? ""}
                onChange={(e) => patch(i, { awake_minutes: e.target.value === "" ? "" : Math.max(0, Math.min(600, Number(e.target.value))) })}
                className="h-12 min-w-0 flex-1 rounded-2xl border border-border bg-secondary px-4 text-base focus:outline-none focus:ring-2 focus:ring-[#818CF8]"
              />
              <button
                type="button"
                aria-pressed={!!a.out_of_bed}
                onClick={() => patch(i, { out_of_bed: !a.out_of_bed })}
                className={`h-12 shrink-0 rounded-2xl border px-4 text-sm ${a.out_of_bed ? "border-[#818CF8] bg-[#818CF8]/20" : "border-border bg-secondary"}`}
              >
                {t("Got out of bed")}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">{t("Time is optional — leave blank if you don't know.")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
