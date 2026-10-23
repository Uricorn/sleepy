import { parseLocal } from "./local-parser.js";
import { TIRED, RESTED } from "./parser-keywords.js";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function cleanFields(f = {}, userText = "") {
  const out = {};
  if (/^\d{4}-\d{2}-\d{2}$/.test(f.date || "")) out.date = f.date;
  for (const k of ["bedtime", "estimated_sleep_onset", "estimated_out_of_bed_time"]) {
    if (TIME_RE.test(f[k] || "")) out[k] = f[k];
  }
  const aw = (f.night_awakenings || []).filter((t) => TIME_RE.test(t || ""));
  if (aw.length) out.night_awakenings = aw;
  if (typeof f.estimated_total_sleep_hours === "number" && f.estimated_total_sleep_hours > 0 && f.estimated_total_sleep_hours <= 24) {
    out.estimated_total_sleep_hours = Math.round(f.estimated_total_sleep_hours * 100) / 100;
  }
  if (Number.isInteger(f.sleep_quality) && f.sleep_quality >= 1 && f.sleep_quality <= 5) out.sleep_quality = f.sleep_quality;
  const mentionsTired = new RegExp(`${TIRED}|${RESTED}|tired|rested|refresh|exhaust|groggy|energi|fatigue|sleepy`, "i").test(userText);
  if (typeof f.woke_up_tired === "boolean" && mentionsTired) out.woke_up_tired = f.woke_up_tired;
  for (const k of ["pre_sleep_notes", "additional_notes"]) {
    if (typeof f[k] === "string" && f[k].trim()) out[k] = f[k].trim().slice(0, 1000);
  }
  return out;
}

export async function chatWithAssistant(input) {
  let text = "";
  if (typeof input === "string") {
    text = input;
  } else if (input?.data?.messages && Array.isArray(input.data.messages)) {
    const userMsgs = input.data.messages.filter((m) => m.role === "user");
    text = userMsgs.length ? userMsgs[userMsgs.length - 1].content || "" : "";
  } else if (input?.messages && Array.isArray(input.messages)) {
    const userMsgs = input.messages.filter((m) => m.role === "user");
    text = userMsgs.length ? userMsgs[userMsgs.length - 1].content || "" : "";
  }

  const result = parseLocal(text);
  return {
    reply: result.reply,
    fields: cleanFields(result.fields, text),
  };
}
