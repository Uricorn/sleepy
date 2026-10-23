import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";
import { applyChatFields } from "@/lib/sleep-fns";
import { formatTime } from "@/lib/sleep-utils";
import { useI18n } from "@/i18n";

const LABELS = [
  ["bedtime", "Bedtime", formatTime],
  ["estimated_sleep_onset", "Sleep onset", formatTime],
  ["night_awakenings", "Awakenings", (v) => v.map(formatTime).join(", ")],
  ["estimated_out_of_bed_time", "Out of bed", formatTime],
  ["estimated_total_sleep_hours", "Total sleep", (v) => `${v} h`],
  ["sleep_quality", "Quality", (v) => `${v}/5`],
  ["woke_up_tired", "Woke up tired", (v) => (v ? "Yes" : "No")],
  ["pre_sleep_notes", "Before-bed notes", (v) => v],
  ["additional_notes", "Notes", (v) => v],
];

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ApplyCard({ fields }) {
  const { t } = useI18n();
  const router = useRouter();
  const [date, setDate] = useState(fields.date || yesterday());
  const [done, setDone] = useState(false);
  const rows = LABELS.filter(([k]) => fields[k] !== undefined);
  if (!rows.length) return null;

  const apply = async () => {
    await applyChatFields({ date, fields });
    await router.invalidate();
    setDone(true);
    toast.success(t("Diary updated"));
  };

  return (
    <div className="mt-2 space-y-3 rounded-2xl border border-border bg-background/60 p-3">
      <dl className="space-y-1 text-sm">
        {rows.map(([k, label, fmt]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t(label)}</dt>
            <dd className="text-end font-medium">{t(fmt(fields[k]))}</dd>
          </div>
        ))}
      </dl>
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground" htmlFor="chat-night">{t("Night of")}</label>
        <input
          id="chat-night"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-10 min-h-0 flex-1 rounded-xl border border-border bg-secondary px-3 text-sm"
        />
      </div>
      <button
        onClick={apply}
        disabled={done || !date}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#34D399] text-sm font-semibold text-[#0C1017] disabled:opacity-60"
      >
        {done ? <><Check className="h-4 w-4" /> {t("Added to diary")}</> : t("Add to diary")}
      </button>
    </div>
  );
}