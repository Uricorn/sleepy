import { useState } from "react";
import { Sunrise, Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TimeInput } from "./TimeInput";
import { QualityScale } from "./QualityScale";
import { AwakeningList } from "./AwakeningList";

export function AfterWakingForm({ entry, onSave, saving }) {
  const [onset, setOnset] = useState(entry?.estimated_sleep_onset || "");
  const [awakenings, setAwakenings] = useState(entry?.night_awakenings || []);
  const [outOfBed, setOutOfBed] = useState(entry?.estimated_out_of_bed_time || "");
  const [hours, setHours] = useState(entry?.estimated_total_sleep_hours ?? "");
  const [quality, setQuality] = useState(entry?.sleep_quality || 0);
  const [tired, setTired] = useState(entry?.woke_up_tired ?? false);
  const [notes, setNotes] = useState(entry?.additional_notes || "");
  const done = entry?.after_waking_recorded;

  const [error, setError] = useState("");

  const step = (d) => {
    const cur = Number(hours) || 0;
    setHours(String(Math.min(24, Math.max(0, Math.round((cur + d) * 10) / 10))));
    setError("");
  };

  const submit = () => {
    const n = Number(hours);
    if (hours !== "" && (!Number.isFinite(n) || n < 0 || n > 24)) {
      setError("Enter a number of hours between 0 and 24.");
      return;
    }
    setError("");
    onSave({
      estimated_sleep_onset: onset,
      night_awakenings: awakenings.filter((a) => a),
      estimated_out_of_bed_time: outOfBed,
      estimated_total_sleep_hours: hours === "" ? null : n,
      sleep_quality: quality,
      woke_up_tired: tired,
      additional_notes: notes,
    });
  };

  return (
    <div className="space-y-4">
      <TimeInput id="onset" label="Estimated sleep onset" value={onset} onChange={setOnset} />
      <AwakeningList value={awakenings} onChange={setAwakenings} />
      <TimeInput id="outofbed" label="Out-of-bed time" value={outOfBed} onChange={setOutOfBed} />
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Estimated total sleep (hours)</label>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" aria-label="Decrease hours" onClick={() => step(-0.5)} className="h-14 w-14 rounded-2xl text-xl">
            <Minus className="h-5 w-5" />
          </Button>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max="24"
            value={hours}
            onChange={(e) => {
              setHours(e.target.value);
              setError("");
            }}
            placeholder="e.g. 7.5"
            className="h-14 min-w-0 flex-1 rounded-2xl border border-border bg-secondary px-4 text-center font-heading text-lg focus:outline-none focus:ring-2 focus:ring-[#34D399]"
          />
          <Button type="button" variant="outline" aria-label="Increase hours" onClick={() => step(0.5)} className="h-14 w-14 rounded-2xl text-xl">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {[5, 6, 7, 8, 9].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => {
                setHours(String(h));
                setError("");
              }}
              className={`rounded-full border px-4 py-1.5 text-sm ${Number(hours) === h && hours !== "" ? "border-[#34D399] bg-[#34D399]/20" : "border-border bg-secondary"}`}
            >
              {h}h
            </button>
          ))}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">Enter your own estimate — never auto-calculated.</p>
      </div>
      <QualityScale value={quality} onChange={setQuality} />
      <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary p-4">
        <div>
          <p className="font-medium">Woke up tired</p>
          <p className="text-xs text-muted-foreground">Did you feel unrested?</p>
        </div>
        <Switch checked={tired} onCheckedChange={setTired} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Additional notes</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Dreams, mood, anything else…"
          className="resize-none rounded-2xl border-border bg-secondary text-base"
        />
      </div>
      <Button
        onClick={submit}
        disabled={saving}
        className="h-14 w-full rounded-2xl bg-[#34D399] text-base font-semibold text-[#0C1017] hover:bg-[#34D399]/90"
      >
        {done ? (
          <>
            <Check className="h-5 w-5" /> Update morning entry
          </>
        ) : (
          <>
            <Sunrise className="h-5 w-5" /> Save morning entry
          </>
        )}
      </Button>
    </div>
  );
}