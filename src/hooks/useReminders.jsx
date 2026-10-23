import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { getReminderCheckState } from "@/lib/sleep-fns";
import { nowInTz } from "@/lib/sleep-utils";

// In the Android app the schedule is handed to native alarms (they fire even when
// the app is closed). In a browser, reminders fire only while the page is open.
// Browser-based reminders. Fires a Notification when the wall-clock time in the
// user's timezone matches a configured reminder, the relevant stage is not yet
// done, and the app is open in the browser. A native mobile build (with push
// enabled) is required for reliable background delivery.
export function useReminders() {
  const navigate = useNavigate();
  const fired = useRef({});
  const synced = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const check = async () => {
      try {
        const s = await getReminderCheckState();
        if (!s) return;
        if (window.SleepyNative?.setReminders) {
          const bed = s.bedtimeEnabled ? s.bedtimeTime || "" : "";
          const morning = s.morningEnabled ? s.morningTime || "" : "";
          const sig = `${bed}|${morning}`;
          if (synced.current !== sig) {
            synced.current = sig;
            window.SleepyNative.setReminders(bed, morning);
          }
          return;
        }
        const now = nowInTz(s.timezone);

        const maybeFire = (type, enabled, time, skip) => {
          if (!enabled || !time || skip || document.visibilityState !== "visible") return;
          if (now.hhmm !== time) return;
          const key = `${now.date}|${type}`;
          if (fired.current[key]) return;
          fired.current[key] = true;
          const isBed = type === "bedtime";
          if (window.SleepyNative || !("Notification" in window) || Notification.permission !== "granted") {
            toast(isBed ? "Time to log before bed" : "Complete last night's sleep entry", {
              duration: 15000,
              action: { label: "Open", onClick: () => navigate({ to: "/", search: { stage: isBed ? "before_bed" : "after_waking" } }) },
            });
            return;
          }
          const n = new Notification(isBed ? "Time to log before bed" : "Complete last night's sleep entry", {
            body: isBed ? "Tap to record your before-bed notes." : "Tap to finish your morning entry.",
            tag: `lull-${type}`,
          });
          n.onclick = () => {
            window.focus();
            navigate({ to: "/", search: { stage: isBed ? "before_bed" : "after_waking" } });
          };
        };

        maybeFire("bedtime", s.bedtimeEnabled, s.bedtimeTime, s.todayBeforeBedDone);
        maybeFire("morning", s.morningEnabled, s.morningTime, s.latestAfterWakingDone);
      } catch {
        /* never disrupt the app over reminder checks */
      }
    };

    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, [navigate]);
}