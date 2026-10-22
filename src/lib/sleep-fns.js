// Local-only data layer. Everything lives in this browser's localStorage — no
// account, no server. Functions keep the `fn({ data })` call shape.
import { nowInTz, localTz } from "@/lib/sleep-utils";

const KEY = "lull:v1";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const defaultSettings = () => ({
  bedtime_reminder_enabled: false,
  bedtime_reminder_time: "22:30",
  morning_reminder_enabled: false,
  morning_reminder_time: "07:30",
  timezone: localTz(),
});

const ENTRY_FIELDS = [
  "date", "bedtime", "pre_sleep_notes", "estimated_sleep_onset", "night_awakenings",
  "estimated_out_of_bed_time", "estimated_total_sleep_hours", "sleep_quality",
  "woke_up_tired", "additional_notes", "before_bed_recorded", "after_waking_recorded",
];

function read() {
  let p = {};
  try {
    p = JSON.parse(localStorage.getItem(KEY) || "{}") || {};
  } catch {
    p = {};
  }
  const entries = (Array.isArray(p.entries) ? p.entries : []).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return { entries, settings: { ...defaultSettings(), ...(p.settings || {}) } };
}

function write(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

export async function getHomeData({ data }) {
  const { entries, settings } = read();
  const tonightEntry = entries.find((e) => e.date === data.nightDate) || null;
  const recent = entries.slice(0, 30);
  return {
    tonightEntry,
    lastNightEntry: recent.find((e) => e.id !== tonightEntry?.id) || recent[0] || null,
    recentEntries: recent,
    trends: recent.slice(0, 14),
    reminderSettings: settings,
  };
}

export async function getHistory() {
  return read().entries.slice(0, 30);
}

export async function getTrends() {
  return read().entries.slice(0, 14);
}

// Upsert by id, else by night date, else create.
function upsert({ id, nightDate }, patch, createDefaults) {
  const db = read();
  let idx = id ? db.entries.findIndex((e) => e.id === id) : -1;
  if (idx < 0 && nightDate) idx = db.entries.findIndex((e) => e.date === nightDate);
  let saved;
  if (idx >= 0) {
    saved = { ...db.entries[idx], ...patch };
    db.entries[idx] = saved;
  } else {
    if (!nightDate) throw new Error("nightDate required");
    saved = { id: newId(), date: nightDate, ...createDefaults, ...patch };
    db.entries.push(saved);
  }
  write(db);
  return saved;
}

export async function saveBeforeBed({ data }) {
  return upsert(
    data,
    { bedtime: data.bedtime, pre_sleep_notes: data.pre_sleep_notes ?? "", before_bed_recorded: true },
    { after_waking_recorded: false, night_awakenings: [] },
  );
}

export async function saveAfterWaking({ data }) {
  return upsert(
    data,
    {
      estimated_sleep_onset: data.estimated_sleep_onset,
      night_awakenings: data.night_awakenings || [],
      estimated_out_of_bed_time: data.estimated_out_of_bed_time,
      estimated_total_sleep_hours: data.estimated_total_sleep_hours,
      sleep_quality: data.sleep_quality,
      woke_up_tired: data.woke_up_tired,
      additional_notes: data.additional_notes ?? "",
      after_waking_recorded: true,
    },
    { before_bed_recorded: false },
  );
}

// Merges only the provided fields into the night with this date (creating it if needed).
export async function applyChatFields({ date, fields }) {
  const { date: _d, ...patch } = fields;
  if (patch.bedtime) patch.before_bed_recorded = true;
  if (
    patch.estimated_total_sleep_hours != null ||
    patch.estimated_out_of_bed_time ||
    patch.estimated_sleep_onset ||
    patch.sleep_quality
  ) {
    patch.after_waking_recorded = true;
  }
  return upsert({ nightDate: date }, patch, { before_bed_recorded: false, after_waking_recorded: false, night_awakenings: [] });
}

export async function saveReminderSettings({ data }) {
  const db = read();
  db.settings = { ...db.settings, ...data };
  write(db);
  return db.settings;
}

export async function getReminderCheckState() {
  const { entries, settings } = read();
  const today = nowInTz(settings.timezone).date;
  return {
    bedtimeEnabled: !!settings.bedtime_reminder_enabled,
    bedtimeTime: settings.bedtime_reminder_time,
    morningEnabled: !!settings.morning_reminder_enabled,
    morningTime: settings.morning_reminder_time,
    timezone: settings.timezone,
    todayBeforeBedDone: entries.some((e) => e.date === today && e.before_bed_recorded),
    latestAfterWakingDone: !!entries[0]?.after_waking_recorded,
  };
}

export function exportData() {
  const { entries, settings } = read();
  return JSON.stringify({ app: "lull", version: 1, exported_at: new Date().toISOString(), entries, settings }, null, 2);
}

// Merges a backup file into local data; imported nights replace same-date nights.
export function importData(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("This file isn't a valid Sleepy backup.");
  }
  if (!parsed || parsed.app !== "lull" || !Array.isArray(parsed.entries)) {
    throw new Error("This file isn't a valid Sleepy backup.");
  }
  const db = read();
  const byDate = new Map(db.entries.map((e) => [e.date, e]));
  let count = 0;
  for (const raw of parsed.entries) {
    if (!raw || typeof raw.date !== "string" || !DATE_RE.test(raw.date)) continue;
    const clean = {};
    for (const f of ENTRY_FIELDS) if (raw[f] !== undefined) clean[f] = raw[f];
    if (!Array.isArray(clean.night_awakenings)) clean.night_awakenings = [];
    byDate.set(raw.date, { ...(byDate.get(raw.date) || {}), ...clean, id: byDate.get(raw.date)?.id || newId() });
    count += 1;
  }
  db.entries = [...byDate.values()];
  if (parsed.settings && typeof parsed.settings === "object") {
    db.settings = { ...db.settings, ...parsed.settings, timezone: parsed.settings.timezone || db.settings.timezone };
  }
  write(db);
  return count;
}

const BACKUP_KEY = "lull.lastBackup";
export function markBackedUp() {
  localStorage.setItem(BACKUP_KEY, String(Date.now()));
}
export function lastBackupAt() {
  const v = Number(localStorage.getItem(BACKUP_KEY));
  return v || null;
}

export function eraseAllData() {
  localStorage.removeItem(KEY);
}