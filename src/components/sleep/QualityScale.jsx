import { cn } from "@/lib/utils";
import { qualityLabel } from "@/lib/sleep-utils";
import { useI18n } from "@/i18n";

const VALUES = [1, 2, 3, 4, 5];

export function QualityScale({ value, onChange }) {
  const { t } = useI18n();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{t("Sleep quality")}</span>
        <span className="text-sm font-medium text-[#34D399]">{value ? t(qualityLabel(value)) : t("Tap to rate")}</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {VALUES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onChange(q)}
            className={cn(
              "h-14 rounded-2xl border font-heading text-lg transition",
              value === q
                ? "border-[#34D399] bg-[#34D399] text-[#0C1017]"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}