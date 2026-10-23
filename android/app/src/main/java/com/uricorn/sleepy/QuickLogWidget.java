package com.uricorn.sleepy;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

/** Home-screen widget with two buttons that open the diary at "before bed" / "after waking". */
public final class QuickLogWidget extends AppWidgetProvider {
    @Override public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_quick_log);
            views.setOnClickPendingIntent(R.id.widget_before_bed, launch(context, "before_bed", 1));
            views.setOnClickPendingIntent(R.id.widget_after_waking, launch(context, "after_waking", 2));
            manager.updateAppWidget(id, views);
        }
    }

    private static PendingIntent launch(Context context, String stage, int requestCode) {
        Intent intent = new Intent(context, MainActivity.class)
            .setAction(Intent.ACTION_VIEW)
            .putExtra("stage", stage)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(context, requestCode, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}
