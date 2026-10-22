import { Plus, X } from "lucide-react";

export function AwakeningList({ value = [], onChange }) {
  const add = () => onChange([...value, ""]);
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  const set = (i, v) => onChange(value.map((x, idx) => (idx === i ? v : x)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Night awakenings</span>
        <button type="button" onClick={add} className="flex items-center gap-1 text-sm font-medium text-[#818CF8]">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      {value.length === 0 && <p className="text-sm text-muted-foreground">No awakenings recorded.</p>}
      <div className="space-y-2">
        {value.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="time"
              value={t}
              onChange={(e) => set(i, e.target.value)}
              className="h-14 flex-1 rounded-2xl border border-border bg-secondary px-4 font-heading text-lg focus:outline-none focus:ring-2 focus:ring-[#818CF8]"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="grid h-14 w-14 place-items-center rounded-2xl border border-border bg-secondary text-muted-foreground hover:text-destructive"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}