import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const schema = {
  type: "object",
  properties: {
    reply: { type: "string" },
    fields: {
      type: "object",
      properties: {
        date: { type: "string", description: "Bedtime date YYYY-MM-DD, only if clearly stated" },
        bedtime: { type: "string", description: "HH:MM 24h" },
        estimated_sleep_onset: { type: "string", description: "HH:MM 24h" },
        night_awakenings: { type: "array", items: { type: "string" }, description: "Start time HH:MM 24h of each awake period" },
        estimated_out_of_bed_time: { type: "string", description: "HH:MM 24h" },
        estimated_total_sleep_hours: { type: "number" },
        sleep_quality: { type: "integer", description: "1-5, only if the user states it" },
        woke_up_tired: { type: "boolean", description: "only if the user states it" },
        pre_sleep_notes: { type: "string" },
        additional_notes: { type: "string" },
      },
    },
  },
  required: ["reply"],
};

function clean(f = {}, userText = "") {
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
  const mentionsTired = /tired|rested|refresh|exhaust|groggy|energi|fatigue|sleepy/i.test(userText);
  if (typeof f.woke_up_tired === "boolean" && mentionsTired) out.woke_up_tired = f.woke_up_tired;
  for (const k of ["pre_sleep_notes", "additional_notes"]) {
    if (typeof f[k] === "string" && f[k].trim()) out[k] = f[k].trim().slice(0, 1000);
  }
  return out;
}

// Deliberately public: the app has no accounts. Input is bounded.
export const chatWithAssistant = createServerFn({ method: "POST" })
  .validator(
    z.object({
      today: z.string().max(10),
      messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) })).min(1).max(12),
      imageUrls: z.array(z.string().url().max(2000)).max(4).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const convo = data.messages.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");
    const prompt = `You are the assistant inside Sleepy, a private sleep diary. Today's date is ${data.today}.
Help the user fill in their sleep diary from what they say and from attached screenshots (e.g. sleep-ring or wearable app data).
Rules:
- Only fill a field when the value is explicitly stated or visible. Never guess or invent. Leave everything else out.
- Times use 24h HH:MM. estimated_total_sleep_hours is only set from an explicit total-sleep figure (e.g. 6h 54m = 6.9), never computed from awake times.
- night_awakenings: the start time of each awake period shown.
- Sleep started the evening before waking, so if the data is from this morning the bedtime date is usually yesterday; only set date if clear.
- Keep the reply short and friendly; say what you found and what is missing.
Conversation:
${convo}`;
    const res = await context.getBase44().asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema,
      file_urls: data.imageUrls?.length ? data.imageUrls : undefined,
    });
    return { reply: String(res?.reply || "Done."), fields: clean(res?.fields, data.messages.filter((m) => m.role === "user").map((m) => m.content).join(" ")) };
  });