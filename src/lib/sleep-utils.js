// Shared helpers for the Sleep Diary. No sleep totals are ever derived from
// awakening times alone — the user always enters estimated total sleep hours.

export function todayNightKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function localTz() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

// Current wall-clock HH:MM and YYYY-MM-DD in a given IANA timezone.
export function nowInTz(timezone) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || "UTC",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value ?? "";
    return { hhmm: `${get("hour")}:${get("minute")}`, date: `${get("year")}-${get("month")}-${get("day")}` };
  } catch {
    const d = new Date();
    return {
      hhmm: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
      date: todayNightKey(),
    };
  }
}

export function formatTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h)) return t;
  return new Date(2000, 0, 1, h, m || 0).toLocaleTimeString(dateLocale, { hour: "numeric", minute: "2-digit" });
}

let dateLocale = "en-US";
export function setDateLocale(l) {
  dateLocale = l;
}

export function formatDateLabel(dateStr) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(dateLocale, { weekday: "short", month: "short", day: "numeric" });
}

export function formatShortDate(dateStr) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(dateLocale, { month: "short", day: "numeric" });
}

export function qualityLabel(q) {
  return ["", "Very poor", "Poor", "Fair", "Good", "Excellent"][q] || "—";
}
export function shiftDateKey(key, days) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

// Hours before this count as "still last night" when deciding whether to ask which night to log.
export const EARLY_MORNING_HOUR = 6;
