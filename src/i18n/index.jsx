import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { LANGUAGES, translations } from "./translations";

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
    setLangState(l);
    try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
  }, []);

  const t = useCallback((k) => translations[lang]?.[k] ?? translations.en[k] ?? k, [lang]);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
export { LANGUAGES };
