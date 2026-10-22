// Offline, on-device parser for typed messages (no AI). Only fills what is explicitly written.
const T = "(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm|a\\.m\\.|p\\.m\\.)?";

function toHHMM(h, m, ap) {
  let hh = Number(h);
  const mm = Number(m || 0);
  const p = ap?.replace(/\./g, "").toLowerCase();
  if (mm > 59 || hh > 24) return null;
  if (p === "pm" && hh < 12) hh += 12;
  if (p === "am" && hh === 12) hh = 0;
  if (!p && !m && hh <= 12 && false) return null;
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

export function parseLocal(text) {
  const t = text.toLowerCase();
  const fields = {};

  const bed = timeAfter(t, "went to bed|bedtime|bed time|in bed at|to bed at|bed at");
  if (bed) fields.bedtime = bed;
  const onset = timeAfter(t, "fell asleep|sleep onset|asleep at");
  if (onset) fields.estimated_sleep_onset = onset;
  const out = timeAfter(t, "got up|woke up|out of bed|get up|up at|woke at");
  if (out) fields.estimated_out_of_bed_time = out;

  const h = t.match(/(?:slept|sleep|total)[^\d]{0,15}(\d+(?:\.\d+)?)\s*(?:h|hrs?|hours?)(?:\s*(?:and\s*)?(\d{1,2})\s*(?:m|mins?|minutes?))?/);
  if (h) {
    const hours = Number(h[1]) + (h[2] ? Number(h[2]) / 60 : 0);
    if (hours >= 0 && hours <= 24) fields.estimated_total_sleep_hours = Math.round(hours * 100) / 100;
  }

  const q = t.match(/quality[^\d]{0,10}([1-5])/);
  if (q) fields.sleep_quality = Number(q[1]);
  if (/woke up tired|felt tired|unrested/.test(t)) fields.woke_up_tired = true;
  if (/well rested|felt rested/.test(t)) fields.woke_up_tired = false;

  const found = Object.keys(fields).length;
  return {
    reply: found
      ? "I'm offline, so I read your message on this device. Here's what I found — check it and add it to your diary."
      : "I'm offline, so I can only read simple notes like “bed at 11:30pm, up at 7am, slept 7 hours, quality 4”. Screenshots need internet.",
    fields,
  };
}