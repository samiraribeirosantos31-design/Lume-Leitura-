package com.lume.leitura;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import java.util.Locale;
import org.json.JSONException;
import org.json.JSONObject;

public class ReadingTimerReceiver extends BroadcastReceiver {
    static final int NOTIFICATION = 1927;
    static final String OPEN_SESSION = "com.lume.leitura.OPEN_READING_SESSION";
    static final String RESUME_SESSION = "com.lume.leitura.RESUME_READING_SESSION";
    private static final String CHANNEL = "lume-reading-timer-v1";
    private static final String PREFS = "lume-reading-timer";

    static synchronized JSONObject read(Context context) {
        String stored = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("session", null);
        if (stored == null) return null;
        try { return new JSONObject(stored); }
        catch (JSONException error) { return null; }
    }

    static synchronized void publish(Context context, JSONObject session) {
        JSONObject previous = read(context);
        if (previous != null && previous.optString("id").equals(session.optString("id"))
                && previous.optLong("changedAt") > session.optLong("changedAt")) return;
        store(context, session);
    }

    private static void store(Context context, JSONObject session) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit().putString("session", session.toString()).commit();
        show(context, session);
    }

    static synchronized void clear(Context context, String id) {
        JSONObject current = read(context);
        if (current == null || !current.optString("id").equals(id)) return;
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().remove("session").commit();
        ((NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE)).cancel(NOTIFICATION);
    }

    private static PendingIntent action(Context context, String action, JSONObject session, int code) {
        Intent intent = new Intent(context, ReadingTimerReceiver.class)
                .setAction("com.lume.leitura.timer." + action).putExtra("id", session.optString("id"));
        return PendingIntent.getBroadcast(context, code, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static void show(Context context, JSONObject session) {
        NotificationManager manager = ((NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE));
        if (!session.optBoolean("notify", true) || !NotificationManagerCompat.from(context).areNotificationsEnabled()) {
            manager.cancel(NOTIFICATION);
            return;
        }
        if (Build.VERSION.SDK_INT >= 26) {
            manager.createNotificationChannel(new NotificationChannel(CHANNEL, "Cronômetro de leitura", NotificationManager.IMPORTANCE_LOW));
        }
        boolean running = session.optBoolean("running"), finished = session.optBoolean("fin");
        long accumulated = session.optLong("acc");
        long seconds = accumulated / 1000;
        String elapsed = String.format(Locale.ROOT, "%02d:%02d", seconds / 60, seconds % 60);
        Intent open = new Intent(context, MainActivity.class)
                .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP)
                .putExtra(OPEN_SESSION, session.optString("id"));
        PendingIntent openApp = PendingIntent.getActivity(context, 70, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        String title = running ? "Leitura em andamento" : finished ? "Tempo pronto para registrar" : "Leitura pausada";
        String book = session.optString("title", "Livro");
        String details = running ? "Cronômetro ativo. Toque para abrir a sessão."
                : finished ? elapsed + " · Toque para registrar a leitura." : elapsed + " · Continue quando quiser.";
        NotificationCompat.Builder notification = new NotificationCompat.Builder(context, CHANNEL)
                .setSmallIcon(android.R.drawable.ic_menu_recent_history)
                .setColor(0xff69539b)
                .setContentTitle(title).setContentText(running ? book : book + " · " + elapsed)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(book + "\n" + details))
                .setContentIntent(openApp).setOnlyAlertOnce(true).setOngoing(!finished)
                .setVisibility(NotificationCompat.VISIBILITY_PRIVATE).setPriority(NotificationCompat.PRIORITY_LOW)
                .setShowWhen(running).setUsesChronometer(running);
        if (running) notification.setWhen(session.optLong("t0") - accumulated);
        if (!finished) {
            if (running) {
                notification.addAction(0, "Pausar", action(context, "pause", session, 71));
            } else {
                Intent resume = new Intent(open).putExtra(RESUME_SESSION, true);
                PendingIntent resumeApp = PendingIntent.getActivity(context, 73, resume, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                notification.addAction(0, "Retomar leitura", resumeApp);
            }
            notification.addAction(0, "Encerrar", action(context, "stop", session, 72));
        }
        notification.addAction(0, finished ? "Registrar" : "Abrir sessão", openApp);
        try { manager.notify(NOTIFICATION, notification.build()); }
        catch (SecurityException ignored) {}
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        synchronized (ReadingTimerReceiver.class) {
            JSONObject session = read(context);
            String action = intent.getAction();
            if (session == null || action == null || !session.optString("id").equals(intent.getStringExtra("id"))
                    || session.optBoolean("fin")) return;
            long now = System.currentTimeMillis();
            boolean running = session.optBoolean("running");
            try {
                if (action.equals("com.lume.leitura.timer.pause") && running) {
                    session.put("acc", session.optLong("acc") + Math.max(0, now - session.optLong("t0")));
                    session.put("running", false);
                } else if (action.equals("com.lume.leitura.timer.stop")) {
                    if (running) session.put("acc", session.optLong("acc") + Math.max(0, now - session.optLong("t0")));
                    session.put("running", false).put("fin", true);
                } else return;
                session.put("changedAt", Math.max(now, session.optLong("changedAt") + 1));
                store(context, session);
            } catch (JSONException ignored) {}
        }
    }
}
