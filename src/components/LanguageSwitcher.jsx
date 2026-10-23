import { Globe } from "lucide-react";
import { useI18n, LANGUAGES } from "@/i18n";

export function LanguageSwitcher({ className = "", iconOnly = false }) {
  const { lang, setLang, t } = useI18n();
  const options = Object.entries(LANGUAGES).map(([code, { name }]) => (
    <option key={code} value={code}>{name}</option>
  ));

  // Compact variant: just a globe icon; the native picker opens from an invisible select on top.
  if (iconOnly) {
    return (
      <label className={`relative inline-flex items-center justify-center ${className}`} title={t("Language")}>
        <Globe className="h-5 w-5" />
        <span className="sr-only">{t("Language")}</span>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          aria-label={t("Language")}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        >
          {options}
        </select>
      </label>
    );
  }

  return (
    <label className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      <Globe className="h-4 w-4 shrink-0" />
      <span className="sr-only">{t("Language")}</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        aria-label={t("Language")}
        className="max-w-[6.5rem] rounded-md border border-border bg-background px-1.5 py-0.5 text-xs text-foreground"
      >
        {options}
      </select>
    </label>
  );
}
