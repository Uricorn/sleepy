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

  // Test 3: nothing recognised -> hint, no fields
  const t3 = parseLocal("Hello there");
  assert.equal(Object.keys(t3.fields).length, 0);
  assert.match(t3.reply, /couldn't extract/i);
  console.log("✓ Test 3 passed");

  // Localized keywords (Arabic, Spanish, Russian, Chinese, German)
  const ar = parseLocal("ذهبت إلى السرير الساعة 11:30 م، استيقظت 7:00 ص، نمت 7.5 ساعات، الجودة ٤، متعب");
  assert.equal(ar.fields.bedtime, "23:30");
  assert.equal(ar.fields.estimated_out_of_bed_time, "07:00");
  assert.equal(ar.fields.estimated_total_sleep_hours, 7.5);
  assert.equal(ar.fields.sleep_quality, 4);
  assert.equal(ar.fields.woke_up_tired, true);
  const es = parseLocal("me acosté a las 23:30, me desperté a las 7:00, dormí 7,5 horas, calidad 4, descansado");
  assert.equal(es.fields.bedtime, "23:30");
  assert.equal(es.fields.estimated_out_of_bed_time, "07:00");
  assert.equal(es.fields.estimated_total_sleep_hours, 7.5);
  assert.equal(es.fields.sleep_quality, 4);
  assert.equal(es.fields.woke_up_tired, false);
  const ru = parseLocal("лег в 23:30, проснулся в 7:00, спал 7 часов 30 минут, качество 4");
  assert.equal(ru.fields.bedtime, "23:30");
  assert.equal(ru.fields.estimated_out_of_bed_time, "07:00");
  assert.equal(ru.fields.estimated_total_sleep_hours, 7.5);
  assert.equal(ru.fields.sleep_quality, 4);
  const zh = parseLocal("上床 23:30，起床 7:00，睡了7.5小时，质量4");
  assert.equal(zh.fields.bedtime, "23:30");
  assert.equal(zh.fields.estimated_total_sleep_hours, 7.5);
  assert.equal(zh.fields.sleep_quality, 4);
  const de = parseLocal("ins bett um 23:30, aufgewacht um 7:00, geschlafen 7,5 stunden, qualität 4, müde");
  assert.equal(de.fields.bedtime, "23:30");
  assert.equal(de.fields.estimated_total_sleep_hours, 7.5);
  assert.equal(de.fields.woke_up_tired, true);
  console.log("✓ Localized keyword tests passed");

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
