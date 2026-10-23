package com.uricorn.sleepy;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Restores the daily reminder alarms after a reboot or app update. Not exported. */
public final class BootReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context, Intent intent) {
        ReminderScheduler.scheduleAll(context);
    }
}
