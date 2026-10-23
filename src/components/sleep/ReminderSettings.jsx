import { Switch } from "@/components/ui/switch";
import { Bell, Moon, Sunrise, Info } from "lucide-react";
import { useI18n } from "@/i18n";

function ReminderRow({ icon: Icon, indigo, label, desc, enabled, time, onToggle, onTime }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${indigo ? "bg-[#818CF8]/15 text-[#818CF8]" : "bg-[#34D399]/15 text-[#34D399]"}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
      {enabled && (
        <input
          type="time"
          value={time || ""}
          onChange={(e) => onTime(e.target.value)}
          className="h-12 w-full rounded-2xl border border-border bg-secondary px-4 font-heading text-base focus:outline-none focus:ring-2 focus:ring-[#818CF8]"
        />
      )}
    </div>
  );
}

export function ReminderSettings({ settings, onPatch }) {
  const { t } = useI18n();
  return (
    <div className="space-y-5 rounded-[1.25rem] border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-[#818CF8]" />
        <h3 className="font-heading text-lg font-bold">{t("Reminders")}</h3>
      </div>
      <ReminderRow
        icon={Moon}
        indigo
        label={t("Bedtime reminder")}
        desc={t("A gentle nudge to log before bed.")}
        enabled={settings.bedtime_reminder_enabled}
        time={settings.bedtime_reminder_time}
        onToggle={(v) => onPatch({ bedtime_reminder_enabled: v })}
        onTime={(t) => onPatch({ bedtime_reminder_time: t })}
      />
      <ReminderRow
        icon={Sunrise}
        label={t("Morning reminder")}
        desc={t("Remember to complete last night's entry.")}
        enabled={settings.morning_reminder_enabled}
        time={settings.morning_reminder_time}
        onToggle={(v) => onPatch({ morning_reminder_enabled: v })}
        onTime={(t) => onPatch({ morning_reminder_time: t })}
      />
      <div className="flex gap-2 rounded-2xl bg-secondary p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          {typeof window !== "undefined" && window.SleepyNative?.setReminders
            ? t("Reminders are sent as daily notifications, even when Sleepy is closed. Android may deliver them a few minutes late to save battery.")
            : t("In a browser, reminders appear only while Sleepy is open and visible.")} {settings.timezone ? t("Timezone: {tz}.", { tz: settings.timezone }) : ""}
        </p>
      </div>
    </div>
  );
}