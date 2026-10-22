export function TimeInput({ label, value, onChange, id }) {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
      )}
      <input
        id={id}
        type="time"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 w-full rounded-2xl border border-border bg-secondary px-4 font-heading text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#818CF8]"
      />
    </div>
  );
}