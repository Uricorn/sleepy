import { useEffect, useState } from "react";
import { createFileRoute, useLoaderData, useRouter, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Moon, Sunrise, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { BeforeBedForm } from "@/components/sleep/BeforeBedForm";
import { AfterWakingForm } from "@/components/sleep/AfterWakingForm";
import { TrendsCard } from "@/components/sleep/TrendsCard";
import { BackupReminder } from "@/components/sleep/BackupReminder";
import { HistoryList } from "@/components/sleep/HistoryList";
import { ReminderSettings } from "@/components/sleep/ReminderSettings";
import { EditEntrySheet } from "@/components/sleep/EditEntrySheet";
import { getHomeData, saveBeforeBed, saveAfterWaking, saveReminderSettings } from "@/lib/sleep-fns";
import { todayNightKey, formatDateLabel, shiftDateKey, EARLY_MORNING_HOUR } from "@/lib/sleep-utils";
import { useI18n } from "@/i18n";

const searchSchema = z.object({
  stage: z.enum(["before_bed", "after_waking"]).optional(),
  edit: z.string().optional(),
});

export const Route = createFileRoute("/_authed/")({
  ssr: false,
  head: () => ({ meta: [{ title: "Sleepy · Tonight" }] }),
  validateSearch: searchSchema,
  loader: () => getHomeData({ data: { nightDate: todayNightKey() } }),
  component: HomePage,
});

function HomePage() {
  const { stage, edit } = Route.useSearch();
  const { t } = useI18n();
  const navigate = Route.useNavigate();
  const data = useLoaderData({ from: "/_authed/" });
  const { lastNightEntry, recentEntries, trends, reminderSettings } = data;
  const router = useRouter();
  const today = todayNightKey();
  const yesterday = shiftDateKey(today, -1);
  // Which night is being logged. Null = not chosen yet (defaults to today).
  const [chosenDate, setChosenDate] = useState(null);
  const nightDate = chosenDate || today;
  const tonightEntry = recentEntries.find((e) => e.date === nightDate) || null;
  // Logging after midnight with nothing recorded for last night is ambiguous: ask.
  const askWhichNight =
    !chosenDate &&
    new Date().getHours() < EARLY_MORNING_HOUR &&
    !recentEntries.some((e) => e.date === today) &&
    !recentEntries.some((e) => e.date === yesterday && e.before_bed_recorded);

  const [savingBed, setSavingBed] = useState(false);
  const [savingWake, setSavingWake] = useState(false);
  const editEntry = recentEntries.find((e) => e.id === edit) || null;
  const setEditId = (id) => navigate({ search: (prev) => ({ ...prev, edit: id }) });
  const [settings, setSettings] = useState(reminderSettings);

  useEffect(() => {
    setSettings(reminderSettings);
  }, [reminderSettings]);

  useEffect(() => {
    if (!stage) return;
    const el = document.getElementById(stage === "before_bed" ? "before-bed" : "after-waking");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stage]);

  const saveBedFn = saveBeforeBed;
  const saveWakeFn = saveAfterWaking;
  const saveSettingsFn = saveReminderSettings;

  // The morning stage binds to the most recent entry whose waking isn't done yet
  // (handles nights crossing midnight), else tonight's entry.
  const pendingWake = recentEntries.find((e) => !e.after_waking_recorded);
  const afterWakingEntry = chosenDate ? tonightEntry : pendingWake || tonightEntry;

  const onSaveBed = async (d) => {
    setSavingBed(true);
    try {
      await saveBedFn({ data: { id: tonightEntry?.id, nightDate, ...d } });
      toast.success(t("Before-bed saved"));
      await router.invalidate();
    } catch {
      toast.error(t("Could not save"));
    } finally {
      setSavingBed(false);
    }
  };

  const onSaveWake = async (d) => {
    setSavingWake(true);
    try {
      await saveWakeFn({ data: { id: afterWakingEntry?.id, nightDate: afterWakingEntry?.date || nightDate, ...d } });
      toast.success(t("Morning entry saved"));
      await router.invalidate();
    } catch {
      toast.error(t("Could not save"));
    } finally {
      setSavingWake(false);
    }
  };

  const onPatch = async (patch) => {
    setSettings((s) => ({ ...s, ...patch }));
    const enabling = patch.bedtime_reminder_enabled === true || patch.morning_reminder_enabled === true;
    if (enabling && "Notification" in window && Notification.permission !== "granted") {
      const res = await Notification.requestPermission();
      if (res !== "granted") toast.error(t("Notifications blocked — enable them in your browser settings to get reminders."));
    }
    try {
      await saveSettingsFn({ data: patch });
      window.dispatchEvent(new Event("sleepy-reminders-changed"));
      await router.invalidate();
    } catch {
      toast.error(t("Could not update reminders"));
    }
  };

  const active = tonightEntry || lastNightEntry;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <BackupReminder hasEntries={recentEntries.length > 0} />
      {/* Hero */}
      <section className="overflow-hidden rounded-[1.5rem] border border-border bg-gradient-to-br from-[#161D2A] to-[#0C1017] p-6">
        <p className="text-sm text-muted-foreground">{formatDateLabel(nightDate)}</p>
        <h1 className="mt-1 font-heading text-[clamp(2rem,5vw,3rem)] font-extrabold leading-tight">
          {tonightEntry ? t("Tonight's Log") : active ? t("Last Night's Sleep") : t("Welcome to Sleepy")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {active
            ? `${active.before_bed_recorded ? t("Before-bed recorded") : t("Before-bed pending")} · ${active.after_waking_recorded ? t("Morning complete") : t("Morning pending")}`
            : t("Start logging tonight's sleep, one calm stage at a time.")}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => document.getElementById("before-bed")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#818CF8] px-5 font-semibold text-[#0C1017]">
            <Moon className="h-5 w-5" /> {t("Log before bed")}
          </button>
          <button type="button" onClick={() => document.getElementById("after-waking")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-card px-5 font-semibold text-foreground">
            <Sunrise className="h-5 w-5 text-[#34D399]" /> {t("Morning entry")}
          </button>
        </div>
      </section>

      {/* Before-bed stage */}
      <section id="before-bed" className="space-y-3">
        <div className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-[#818CF8]" />
          <h2 className="font-heading text-xl font-bold">{t("Before Bed")}</h2>
        </div>
        <div className="rounded-[1.25rem] border border-border bg-card p-5">
          {askWhichNight ? (
            <div className="mb-4 space-y-3 rounded-2xl bg-secondary p-4">
              <p className="text-sm">{t("It's after midnight. Which night is this for?")}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setChosenDate(yesterday)} className="h-10 rounded-full border border-border bg-card px-4 text-sm font-semibold">
                  {t("Last night")} · {formatDateLabel(yesterday)}
                </button>
                <button type="button" onClick={() => setChosenDate(today)} className="h-10 rounded-full bg-[#818CF8] px-4 text-sm font-semibold text-[#0C1017]">
                  {t("Tonight")} · {formatDateLabel(today)}
                </button>
              </div>
            </div>
          ) : (
            <label className="mb-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>{t("Logging for")} {formatDateLabel(nightDate)}</span>
              <input
                type="date"
                value={nightDate}
                max={today}
                onChange={(e) => e.target.value && setChosenDate(e.target.value)}
                aria-label={t("Night date")}
                className="rounded-xl border border-border bg-secondary px-3 py-1.5 text-foreground"
              />
            </label>
          )}
          <BeforeBedForm key={tonightEntry?.id || `new-bed-${nightDate}`} entry={tonightEntry} onSave={onSaveBed} saving={savingBed} blocked={askWhichNight} />
        </div>
      </section>

      {/* After-waking stage */}
      <section id="after-waking" className="space-y-3">
        <div className="flex items-center gap-2">
          <Sunrise className="h-5 w-5 text-[#34D399]" />
          <h2 className="font-heading text-xl font-bold">{t("After Waking")}</h2>
        </div>
        <div className="rounded-[1.25rem] border border-border bg-card p-5">
          <AfterWakingForm key={afterWakingEntry?.id || "new-wake"} entry={afterWakingEntry} onSave={onSaveWake} saving={savingWake} />
        </div>
      </section>

      {/* Trends */}
      <section className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold">{t("Trends")}</h2>
        <Link to="/trends" className="flex items-center gap-1 text-sm text-[#818CF8]">
          {t("View all")} <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </section>
      <TrendsCard entries={trends} />

      {/* Recent history */}
      <section className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold">{t("Recent nights")}</h2>
        <Link to="/history" className="flex items-center gap-1 text-sm text-[#818CF8]">
          {t("All entries")} <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </section>
      <HistoryList entries={recentEntries.slice(0, 5)} onEdit={(e) => setEditId(e.id)} />

      {/* Reminders */}
      <ReminderSettings settings={settings} onPatch={onPatch} />

      <EditEntrySheet entry={editEntry} open={!!editEntry} onOpenChange={(o) => !o && setEditId(undefined)} />
    </div>
  );
}