import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { nowInTz, localTz } from "@/lib/sleep-utils";

const base = (ctx) => ctx.getBase44();

// Each user has exactly one ReminderSettings record; create a default (all off)
// on first access. Timezone defaults to the requester's browser zone.
async function getOrCreateSettings(ctx) {
  const page = await base(ctx).entities.ReminderSettings.filter({}, { limit: 1 });
  if (page.items?.[0]) return page.items[0];
  return base(ctx).entities.ReminderSettings.create({
    bedtime_reminder_enabled: false,
    bedtime_reminder_time: "22:30",
    morning_reminder_enabled: false,
    morning_reminder_time: "07:30",
    timezone: localTz(),
  });
}

export const getHomeData = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ nightDate: z.string() }))
  .handler(async ({ data, context }) => {
    const b = base(context);
    const tonightPage = await b.entities.SleepDiaryEntry.filter({ date: data.nightDate }, { limit: 1 });
    const tonightEntry = tonightPage.items?.[0] || null;
    const recentPage = await b.entities.SleepDiaryEntry.filter({}, { sort: "-date", limit: 30 });
    const recent = recentPage.items || [];
    const reminderSettings = await getOrCreateSettings(context);
    return {
      tonightEntry,
      lastNightEntry: recent.find((e) => e.id !== tonightEntry?.id) || recent[0] || null,
      recentEntries: recent,
      trends: recent.slice(0, 14),
      reminderSettings,
    };
  });

export const getHistory = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({}).optional())
  .handler(async ({ context }) => {
    const page = await base(context).entities.SleepDiaryEntry.filter({}, { sort: "-date", limit: 30 });
    return page.items || [];
  });

export const getTrends = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({}).optional())
  .handler(async ({ context }) => {
    const page = await base(context).entities.SleepDiaryEntry.filter({}, { sort: "-date", limit: 14 });
    return page.items || [];
  });

export const getEntry = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    try {
      return await base(context).entities.SleepDiaryEntry.get(data.id);
    } catch (e) {
      if (e?.status === 404) return null;
      throw e;
    }
  });

export const saveBeforeBed = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      id: z.string().optional(),
      nightDate: z.string().optional(),
      bedtime: z.string(),
      pre_sleep_notes: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const b = base(context);
    const notes = data.pre_sleep_notes ?? "";
    if (data.id) {
      return b.entities.SleepDiaryEntry.update(data.id, { bedtime: data.bedtime, pre_sleep_notes: notes, before_bed_recorded: true });
    }
    if (!data.nightDate) throw Object.assign(new Error("nightDate required"), { status: 400 });
    const existing = await b.entities.SleepDiaryEntry.filter({ date: data.nightDate }, { limit: 1 });
    if (existing.items?.[0]) {
      return b.entities.SleepDiaryEntry.update(existing.items[0].id, { bedtime: data.bedtime, pre_sleep_notes: notes, before_bed_recorded: true, date: data.nightDate });
    }
    return b.entities.SleepDiaryEntry.create({
      date: data.nightDate,
      bedtime: data.bedtime,
      pre_sleep_notes: notes,
      before_bed_recorded: true,
      after_waking_recorded: false,
      night_awakenings: [],
    });
  });

export const saveAfterWaking = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      id: z.string().optional(),
      nightDate: z.string().optional(),
      estimated_sleep_onset: z.string().optional(),
      night_awakenings: z.array(z.string()).optional(),
      estimated_out_of_bed_time: z.string().optional(),
      estimated_total_sleep_hours: z.number().nullable().optional(),
      sleep_quality: z.number().optional(),
      woke_up_tired: z.boolean().optional(),
      additional_notes: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const b = base(context);
    const patch = {
      estimated_sleep_onset: data.estimated_sleep_onset,
      night_awakenings: data.night_awakenings || [],
      estimated_out_of_bed_time: data.estimated_out_of_bed_time,
      estimated_total_sleep_hours: data.estimated_total_sleep_hours,
      sleep_quality: data.sleep_quality,
      woke_up_tired: data.woke_up_tired,
      additional_notes: data.additional_notes ?? "",
      after_waking_recorded: true,
    };
    if (data.id) {
      return b.entities.SleepDiaryEntry.update(data.id, patch);
    }
    if (!data.nightDate) throw Object.assign(new Error("nightDate required"), { status: 400 });
    const existing = await b.entities.SleepDiaryEntry.filter({ date: data.nightDate }, { limit: 1 });
    if (existing.items?.[0]) {
      return b.entities.SleepDiaryEntry.update(existing.items[0].id, { ...patch, date: data.nightDate });
    }
    return b.entities.SleepDiaryEntry.create({ date: data.nightDate, before_bed_recorded: false, ...patch });
  });

export const getReminderSettings = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({}).optional())
  .handler(async ({ context }) => getOrCreateSettings(context));

export const saveReminderSettings = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      bedtime_reminder_enabled: z.boolean().optional(),
      bedtime_reminder_time: z.string().optional(),
      morning_reminder_enabled: z.boolean().optional(),
      morning_reminder_time: z.string().optional(),
      timezone: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const settings = await getOrCreateSettings(context);
    return base(context).entities.ReminderSettings.update(settings.id, data);
  });

// Lightweight state for the in-app reminder checker.
export const getReminderCheckState = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({}).optional())
  .handler(async ({ context }) => {
    const b = base(context);
    const settings = await getOrCreateSettings(context);
    const today = nowInTz(settings.timezone).date;
    const tonightPage = await b.entities.SleepDiaryEntry.filter({ date: today, before_bed_recorded: true }, { limit: 1 });
    const recentPage = await b.entities.SleepDiaryEntry.filter({}, { sort: "-date", limit: 1 });
    return {
      bedtimeEnabled: !!settings.bedtime_reminder_enabled,
      bedtimeTime: settings.bedtime_reminder_time,
      morningEnabled: !!settings.morning_reminder_enabled,
      morningTime: settings.morning_reminder_time,
      timezone: settings.timezone,
      todayBeforeBedDone: !!tonightPage.items?.[0],
      latestAfterWakingDone: !!recentPage.items?.[0]?.after_waking_recorded,
    };
  });