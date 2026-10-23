// Offline, on-device parser for typed messages (no AI). Only fills what is explicitly written.
import * as K from "./parser-keywords.js";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const T = `(\\d{1,2})(?::(\\d{2}))?\\s*(${K.AMPM})?`;

function toHHMM(h, m, ap) {
  let hh = Number(h);
  const mm = Number(m || 0);
  const p = ap?.replace(/\./g, "").toLowerCase();
  if (mm > 59 || hh > 24) return null;
  if (K.PM_SET.has(p) && hh < 12) hh += 12;
  if (K.AM_SET.has(p) && hh === 12) hh = 0;
  if (hh > 23) return null;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function timeAfter(text, words) {
  const re = new RegExp(`(?:${words})[^\\d]{0,15}${T}`, "i");
  const m = text.match(re);
  // a bare number without minutes or am/pm is too ambiguous
  if (!m || (!m[2] && !m[3])) return null;
  return toHHMM(m[1], m[2], m[3]);
}

// Arabic-Indic (٠-٩) and Persian (۰-۹) digits -> ASCII, so localized keyboards work.
function normalizeDigits(s) {
  return s.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (c) => String(c.charCodeAt(0) & 0xf));
}

export function parseLocal(text = "") {
  const t = normalizeDigits(String(text)).toLowerCase();
  const fields = {};

  const bed = timeAfter(t, K.BED);
  if (bed) fields.bedtime = bed;

  const onset = timeAfter(t, K.ONSET);
  if (onset) fields.estimated_sleep_onset = onset;

  const out = timeAfter(t, K.WAKE);
  if (out) fields.estimated_out_of_bed_time = out;

  const h = t.match(new RegExp(`(?:${K.SLEPT})[^\\d]{0,15}(\\d+(?:[.,]\\d+)?)\\s*(?:${K.HOURS_UNIT})(?:\\s*(?:(?:${K.AND_WORD})\\s*)?(\\d{1,2})\\s*(?:${K.MINUTES_UNIT}))?`, "i"));
  if (h) {
    const hours = Number(h[1].replace(",", ".")) + (h[2] ? Number(h[2]) / 60 : 0);
    if (hours >= 0 && hours <= 24) fields.estimated_total_sleep_hours = Math.round(hours * 100) / 100;
  }

  const q = t.match(new RegExp(`(?:${K.QUALITY})[^\\d]{0,10}([1-5])`, "i"));
  if (q) fields.sleep_quality = Number(q[1]);

  if (new RegExp(K.TIRED, "i").test(t)) fields.woke_up_tired = true;
  if (new RegExp(K.RESTED, "i").test(t)) fields.woke_up_tired = false;

  const d = t.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (d) fields.date = d[1];

  const awakeningsMatch = t.match(new RegExp(`(?:${K.AWAKENINGS})[^\\d]{0,15}((?:(?:\\d{1,2})(?::\\d{2})?\\s*(?:${K.AMPM})?[\\s,،]*)+)`, "i"));
  if (awakeningsMatch && awakeningsMatch[1]) {
    const times = [];
    const timeRe = new RegExp(T, "gi");
    let match;
    while ((match = timeRe.exec(awakeningsMatch[1])) !== null) {
      if (match[2] || match[3]) {
        const hhmm = toHHMM(match[1], match[2], match[3]);
        if (hhmm && TIME_RE.test(hhmm)) times.push(hhmm);
      }
    }
    if (times.length > 0) fields.night_awakenings = times;
  }

  const preNotesMatch = t.match(/before[- ]bed notes?:?\s*([^.\n]+)/i);
  if (preNotesMatch) fields.pre_sleep_notes = preNotesMatch[1].trim();

  const addNotesMatch = t.match(new RegExp(`(?:${K.NOTES})\\s*[:：]?\\s*([^.\\n]+)`, "i"));
  if (addNotesMatch && !preNotesMatch) fields.additional_notes = addNotesMatch[1].trim();

  const found = Object.keys(fields).length;
  const mentionsScreenshot = new RegExp(K.SCREENSHOT, "i").test(t);

  let reply = "";
  if (found) {
    reply = mentionsScreenshot
      ? "I read your text note on this device. Here's what I found — check it and add it to your diary. (Note: screenshots are not analyzed by the local text parser.)"
      : "I read your message on this device. Here's what I found — check it and add it to your diary.";
  } else {
    reply = mentionsScreenshot
      ? "Screenshots are not analyzed by the local text parser. Try typing notes like “bed at 11:30pm, up at 7am, slept 7.5 hours, quality 4”."
      : "I couldn't extract sleep details from your note. Try typing notes like “bed at 11:30pm, up at 7am, slept 7.5 hours, quality 4”. Note: screenshots are not analyzed by the local text parser.";
  }

  return {
    reply,
    fields,
  };
}
