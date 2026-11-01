import { useState } from "react";
import { Moon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TimeInput } from "./TimeInput";
import { useI18n } from "@/i18n";

export function BeforeBedForm({ entry, onSave, saving, blocked }) {
  const { t } = useI18n();
  const [bedtime, setBedtime] = useState(entry?.bedtime || "");
  const [notes, setNotes] = useState(entry?.pre_sleep_notes || "");
  const done = entry?.before_bed_recorded;

  const submit = () => onSave({ bedtime, pre_sleep_notes: notes });

  return (
    <div className="space-y-4">
      <TimeInput id="bedtime" label={t("Bedtime")} value={bedtime} onChange={setBedtime} />
      <div className="space-y-2">
        <label htmlFor="before-notes" className="text-sm font-medium text-muted-foreground">{t("Before-bed notes")}</label>
        <Textarea
          id="before-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder={t("Caffeine, last meal & hour, how your body/stomach feels, exercise, anxiety, noise…")}
          className="resize-none rounded-2xl border-border bg-secondary text-base"
        />
      </div>
      <Button
        onClick={submit}
        disabled={saving || blocked || !bedtime}
        className="h-14 w-full rounded-2xl bg-[#818CF8] text-base font-semibold text-[#0C1017] hover:bg-[#818CF8]/90"
      >
        {done ? (
          <>
            <Check className="h-5 w-5" /> {t("Update before-bed")}
          </>
        ) : (
          <>
            <Moon className="h-5 w-5" /> {t("Save before-bed log")}
          </>
        )}
      </Button>
    </div>
  );
}