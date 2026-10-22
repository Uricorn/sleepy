import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const store = new Map();
globalThis.localStorage = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
};
const sourceUrl = new URL('../src/lib/sleep-fns.js', import.meta.url);
const helperUrl = new URL('../src/lib/sleep-utils.js', import.meta.url).href;
const source = (await readFile(sourceUrl, 'utf8')).replace('"@/lib/sleep-utils"', JSON.stringify(helperUrl));
const diary = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

await diary.saveBeforeBed({ data: { nightDate: '2026-01-02', bedtime: '23:45', pre_sleep_notes: 'test entry' } });
let entries = await diary.getHistory();
assert.equal(entries.length, 1);
assert.equal(entries[0].bedtime, '23:45');
assert.equal(entries[0].estimated_total_sleep_hours, undefined);
const id = entries[0].id;
await diary.saveAfterWaking({ data: { nightDate: '2026-01-02', id, estimated_sleep_onset: '00:15', night_awakenings: ['03:00'], estimated_out_of_bed_time: '07:30', estimated_total_sleep_hours: 6.25, sleep_quality: 3, woke_up_tired: true, additional_notes: 'morning test' } });
entries = await diary.getHistory();
assert.equal(entries.length, 1);
assert.equal(entries[0].id, id);
assert.equal(entries[0].estimated_total_sleep_hours, 6.25);
assert.deepEqual(entries[0].night_awakenings, ['03:00']);
assert.equal(entries[0].pre_sleep_notes, 'test entry');
await diary.saveReminderSettings({ data: { timezone: 'Asia/Jerusalem', morning_reminder_enabled: true } });
const backup = diary.exportData();
assert.equal(JSON.parse(backup).app, 'lull');
assert.equal(JSON.parse(backup).entries.length, 1);
assert.throws(() => diary.importData('invalid json'));
assert.throws(() => diary.importData('{"app":"other","entries":[]}'));
assert.equal((await diary.getHistory()).length, 1);
diary.eraseAllData();
assert.equal((await diary.getHistory()).length, 0);
assert.equal(diary.importData(backup), 1);
assert.equal((await diary.getHistory())[0].estimated_total_sleep_hours, 6.25);
assert.equal(diary.importData(backup), 1);
assert.equal((await diary.getHistory()).length, 1, 'reimport must not duplicate date');
await diary.applyChatFields({ date: '2026-01-03', fields: { bedtime: '22:00', night_awakenings: ['02:00', '04:00'] } });
assert.equal((await diary.getHistory())[0].estimated_total_sleep_hours, undefined, 'do not infer total sleep');
assert.ok(store.has('lull:v1'), 'preserve existing storage key');
diary.markBackedUp();
assert.ok(diary.lastBackupAt() > 0);
console.log('PASS: diary save/update, original storage key, backup roundtrip, invalid backup protection, duplicate-date merge, and no inferred sleep duration.');
