package com.uricorn.sleepy;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import java.util.Calendar;

/** Schedules the two daily reminders with inexact, Doze-friendly alarms (no exact-alarm permission). */
final class ReminderScheduler {
    static final String BEDTIME = "before_bed";
    static final String MORNING = "after_waking";
    private static final String PREFS = "reminders";

    private ReminderScheduler() {}

    /** time is "HH:MM" or null/empty to disable. */
    static void set(Context context, String stage, String time) {
        SharedPreferences.Editor editor = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit();
        if (time == null || !time.matches("\\d{1,2}:\\d{2}")) editor.remove(stage); else editor.putString(stage, time);
        editor.apply();
        schedule(context, stage);
    }

    static void scheduleAll(Context context) {
        schedule(context, BEDTIME);
        schedule(context, MORNING);
    }

    static void schedule(Context context, String stage) {
        AlarmManager alarms = context.getSystemService(AlarmManager.class);
        PendingIntent intent = pending(context, stage);
        String time = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(stage, null);
        if (alarms == null) return;
        alarms.cancel(intent);
        if (time == null) return;
        String[] parts = time.split(":");
        Calendar when = Calendar.getInstance();
        when.set(Calendar.HOUR_OF_DAY, Integer.parseInt(parts[0]) % 24);
        when.set(Calendar.MINUTE, Integer.parseInt(parts[1]) % 60);
        when.set(Calendar.SECOND, 0);
        when.set(Calendar.MILLISECOND, 0);
        if (when.getTimeInMillis() <= System.currentTimeMillis()) when.add(Calendar.DAY_OF_YEAR, 1);
        alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, when.getTimeInMillis(), intent);
    }

    private static PendingIntent pending(Context context, String stage) {
        Intent intent = new Intent(context, ReminderReceiver.class).putExtra("stage", stage);
        intent.setAction("com.uricorn.sleepy.REMINDER." + stage);
        return PendingIntent.getBroadcast(context, BEDTIME.equals(stage) ? 1 : 2, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}
