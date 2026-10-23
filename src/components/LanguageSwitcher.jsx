import { Globe } from "lucide-react";
import { useI18n, LANGUAGES } from "@/i18n";

export function LanguageSwitcher({ className = "" }) {
  const { lang, setLang, t } = useI18n();
  return (
    <label className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      <Globe className="h-4 w-4 shrink-0" />
      <span className="sr-only">{t("language")}</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        aria-label={t("language")}
        className="max-w-[9rem] rounded-md border border-border bg-background px-2 py-1 text-foreground"
      >
        {Object.entries(LANGUAGES).map(([code, { name }]) => (
          <option key={code} value={code}>{name}</option>
        ))}
      </select>
    </label>
  );
}
