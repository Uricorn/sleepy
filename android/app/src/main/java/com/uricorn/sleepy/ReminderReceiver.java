package com.uricorn.sleepy;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Shows the reminder notification and schedules the next day's alarm. Not exported. */
public final class ReminderReceiver extends BroadcastReceiver {
    private static final String CHANNEL = "reminders";

    @Override public void onReceive(Context context, Intent intent) {
        String stage = intent.getStringExtra("stage");
        if (stage == null) return;
        ReminderScheduler.schedule(context, stage);
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        manager.createNotificationChannel(new NotificationChannel(CHANNEL,
            context.getString(R.string.reminder_channel), NotificationManager.IMPORTANCE_DEFAULT));
        boolean bed = ReminderScheduler.BEDTIME.equals(stage);
        Intent open = new Intent(context, MainActivity.class).putExtra("stage", stage)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent tap = PendingIntent.getActivity(context, bed ? 1 : 2, open,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification note = new Notification.Builder(context, CHANNEL)
            .setSmallIcon(R.drawable.sleepy_icon)
            .setContentTitle(context.getString(bed ? R.string.reminder_bed_title : R.string.reminder_morning_title))
            .setContentText(context.getString(bed ? R.string.reminder_bed_text : R.string.reminder_morning_text))
            .setContentIntent(tap).setAutoCancel(true).build();
        manager.notify(bed ? 1 : 2, note);
    }
}
