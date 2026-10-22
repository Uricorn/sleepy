import assert from "node:assert/strict";
import { parseLocal } from "./local-parser.js";
import { chatWithAssistant } from "./chat-fns.js";

async function runTests() {
  console.log("Running local parser tests...");

  // Test 1: Full note extraction
  const t1 = parseLocal("I went to bed at 11:30pm, fell asleep at 12:00am, woke up at 7:30am, slept 7.5 hours, quality 4, felt rested.");
  assert.equal(t1.fields.bedtime, "23:30");
  assert.equal(t1.fields.estimated_sleep_onset, "00:00");
  assert.equal(t1.fields.estimated_out_of_bed_time, "07:30");
  assert.equal(t1.fields.estimated_total_sleep_hours, 7.5);
  assert.equal(t1.fields.sleep_quality, 4);
  assert.equal(t1.fields.woke_up_tired, false);
  console.log("✓ Test 1 passed");

  // Test 2: Tired status and date
  const t2 = parseLocal("2026-10-21 bed at 10:45pm, up at 6:15am, slept 7.5h, quality 2, woke up tired");
  assert.equal(t2.fields.date, "2026-10-21");
  assert.equal(t2.fields.bedtime, "22:45");
  assert.equal(t2.fields.estimated_out_of_bed_time, "06:15");
  assert.equal(t2.fields.estimated_total_sleep_hours, 7.5);
  assert.equal(t2.fields.sleep_quality, 2);
  assert.equal(t2.fields.woke_up_tired, true);
  console.log("✓ Test 2 passed");

  // Test 3: Screenshot mention explanation
  const t3 = parseLocal("Here is a screenshot from my ring");
  assert.equal(Object.keys(t3.fields).length, 0);
  assert.match(t3.reply, /Screenshots are not analyzed/i);
  console.log("✓ Test 3 passed");

  // Test 4: chatWithAssistant wrapper with legacy message array format
  const res = await chatWithAssistant({
    data: {
      messages: [
        { role: "user", content: "Bed at 11pm, up at 7am, slept 8 hours, quality 5" }
      ]
    }
  });
  assert.equal(res.fields.bedtime, "23:00");
  assert.equal(res.fields.estimated_out_of_bed_time, "07:00");
  assert.equal(res.fields.estimated_total_sleep_hours, 8);
  assert.equal(res.fields.sleep_quality, 5);
  console.log("✓ Test 4 passed");

  console.log("All local parser tests passed successfully!");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
