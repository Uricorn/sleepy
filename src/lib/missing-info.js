// What a night's diary entry still lacks, as tappable prompts for the assistant chat.
// `starter` is the text pre-filled into the input; the parser reads English keywords in any language.
const FIELDS = [
  ["bedtime", "Bedtime", "bed at ", (e) => !e.bedtime],
  ["estimated_sleep_onset", "Time fell asleep", "fell asleep at ", (e) => !e.estimated_sleep_onset],
  ["estimated_out_of_bed_time", "Out of bed", "up at ", (e) => !e.estimated_out_of_bed_time],
  ["estimated_total_sleep_hours", "Total sleep", "slept ", (e) => e.estimated_total_sleep_hours == null],
  ["sleep_quality", "Quality", "quality ", (e) => e.sleep_quality == null],
  ["woke_up_tired", "Woke up tired", "felt ", (e) => typeof e.woke_up_tired !== "boolean"],
];

export function missingPrompts(entry = {}) {
  return FIELDS.filter(([, , , isMissing]) => isMissing(entry)).map(([key, label, starter]) => ({ key, label, starter }));
}
