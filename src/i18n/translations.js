import { KEYS } from "./keys";
import es from "./locales/es";
import fr from "./locales/fr";
import de from "./locales/de";
import pt from "./locales/pt";
import ru from "./locales/ru";
import uk from "./locales/uk";
import it from "./locales/it";
import tr from "./locales/tr";
import pl from "./locales/pl";
import ko from "./locales/ko";
import hi from "./locales/hi";
import zh from "./locales/zh";
import ja from "./locales/ja";
import ar from "./locales/ar";
import he from "./locales/he";
import fa from "./locales/fa";
import ur from "./locales/ur";

export const LANGUAGES = {
  en: { name: "English", dir: "ltr" },
  es: { name: "Español", dir: "ltr" },
  fr: { name: "Français", dir: "ltr" },
  de: { name: "Deutsch", dir: "ltr" },
  pt: { name: "Português", dir: "ltr" },
  ru: { name: "Русский", dir: "ltr" },
  zh: { name: "中文", dir: "ltr" },
  ja: { name: "日本語", dir: "ltr" },
  hi: { name: "हिन्दी", dir: "ltr" },
  ar: { name: "العربية", dir: "rtl" },
  he: { name: "עברית", dir: "rtl" },
  uk: { name: "Українська", dir: "ltr" },
  it: { name: "Italiano", dir: "ltr" },
  tr: { name: "Türkçe", dir: "ltr" },
  pl: { name: "Polski", dir: "ltr" },
  ko: { name: "한국어", dir: "ltr" },
  fa: { name: "فارسی", dir: "rtl" },
  ur: { name: "اردو", dir: "rtl" },
};


const LOCALES = { es, fr, de, pt, ru, uk, it, tr, pl, ko, hi, zh, ja, ar, he, fa, ur };

export const translations = Object.fromEntries(
  Object.entries(LOCALES).map(([code, arr]) => {
    if (arr.length !== KEYS.length) console.warn(`[i18n] ${code}: expected ${KEYS.length} strings, got ${arr.length}`);
    return [code, Object.fromEntries(KEYS.map((k, i) => [k, arr[i]]))];
  }),
);

// BCP-47 tags for date formatting
export const DATE_LOCALES = { en: "en-US", es: "es", fr: "fr", de: "de", pt: "pt-BR", ru: "ru", uk: "uk", it: "it", tr: "tr", pl: "pl", ko: "ko", hi: "hi", zh: "zh-CN", ja: "ja", ar: "ar", he: "he", fa: "fa", ur: "ur" };
