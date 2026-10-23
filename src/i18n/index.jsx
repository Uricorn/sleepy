import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { LANGUAGES, translations, DATE_LOCALES } from "./translations";
import { setDateLocale } from "@/lib/sleep-utils";

const KEY = "sleepy-lang";

function detect() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && LANGUAGES[saved]) return saved;
  } catch { /* ignore */ }
  const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
  return LANGUAGES[nav] ? nav : "en";
}

const I18nContext = createContext({ lang: "en", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detect);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGUAGES[lang].dir;
  }, [lang]);

  const setLang = useCallback((l) => {
    if (!LANGUAGES[l]) return;
    setLangState(l);
    try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
  }, []);

  setDateLocale(DATE_LOCALES[lang]);

  const t = useCallback(
    (k, vars) => {
      let s = translations[lang]?.[k] ?? k;
      if (vars) for (const [name, v] of Object.entries(vars)) s = s.replaceAll(`{${name}}`, String(v));
      return s;
    },
    [lang],
  );

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
export { LANGUAGES };
