// Generates a Sleepy backup with 14 nights of believable demo data ending last night.
// Usage: node scripts/demo-data.mjs [out.json]   (default: demo/sleepy-demo-backup.json)
// Load it in the app via the database icon -> Import. Meant for screenshots and manual testing.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const out = process.argv[2] || "demo/sleepy-demo-backup.json";
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// [bedtime, onset, awakenings, out of bed, hours, quality, tired, pre-sleep note, morning note]
const nights = [
  ["23:10", "23:40", ["03:15"], "07:00", 7.0, 4, false, "Herbal tea, read for 20 min.", "Woke once, back to sleep quickly."],
  ["23:45", "00:30", ["02:10", "04:30"], "07:15", 6.0, 3, true, "Late coffee at 4pm, screens until bed.", "Restless, mind racing."],
  ["22:50", "23:10", [], "06:45", 7.5, 5, false, "Evening walk, light dinner.", "Felt fully rested."],
  ["23:20", "23:50", ["03:00"], "07:00", 7.0, 4, false, "Yoga, no screens after 10pm.", ""],
  ["00:15", "01:00", ["03:40"], "07:30", 6.0, 2, true, "Worked late, heavy dinner.", "Hard to wake up."],
  ["23:30", "23:55", [], "07:45", 7.5, 4, false, "Weekend, watched a film.", "Slept in a little."],
  ["23:00", "23:20", [], "07:00", 7.5, 5, false, "Warm shower, lavender spray.", "Great night."],
  ["23:35", "00:10", ["02:45"], "06:50", 6.5, 3, true, "Argued with a deadline.", "Tired but OK."],
  ["22:40", "23:00", [], "06:30", 7.5, 5, false, "Gym in the evening.", ""],
  ["23:15", "23:45", ["04:00"], "07:00", 7.0, 4, false, "Tea and journaling.", ""],
  ["23:55", "00:35", ["01:50", "04:20"], "07:20", 6.0, 2, true, "Noisy neighbours.", "Earplugs next time."],
  ["23:05", "23:30", [], "07:00", 7.5, 4, false, "Stretching, dim lights.", ""],
  ["23:25", "23:50", ["03:20"], "07:10", 7.0, 4, false, "Light snack, podcast.", ""],
  ["22:55", "23:15", [], "06:50", 7.5, 5, false, "No caffeine after noon.", "Woke before the alarm."],
];

const entries = nights.map((n, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (nights.length - i)); // oldest first, last one = yesterday night
  const [bedtime, onset, wake, up, hours, quality, tired, pre, post] = n;
  return {
    id: `demo-${iso(d)}`,
    date: iso(d),
    bedtime,
    pre_sleep_notes: pre,
    estimated_sleep_onset: onset,
    night_awakenings: wake,
    estimated_out_of_bed_time: up,
    estimated_total_sleep_hours: hours,
    sleep_quality: quality,
    woke_up_tired: tired,
    additional_notes: post,
    before_bed_recorded: true,
    after_waking_recorded: true,
  };
});

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ app: "lull", version: 1, exported_at: new Date().toISOString(), entries, settings: {} }, null, 2));
console.log(`Wrote ${entries.length} demo nights to ${out}`);
