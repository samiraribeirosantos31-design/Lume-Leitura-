package com.lume.leitura;

import android.app.NotificationManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONObject;

@CapacitorPlugin(name = "ReadingTimer")
public class ReadingTimerPlugin extends Plugin {
    @PluginMethod
    public void publish(PluginCall call) {
        JSONObject session = call.getObject("session");
        if (session == null || session.optString("id").isEmpty()) {
            call.reject("Sessão inválida");
            return;
        }
        ReadingTimerReceiver.publish(getContext(), session);
        call.resolve();
    }

    @PluginMethod
    public void read(PluginCall call) {
        JSONObject session = ReadingTimerReceiver.read(getContext());
        JSObject answer = new JSObject();
        if (session != null) answer.put("session", session);
        call.resolve(answer);
    }

    @PluginMethod
    public void clear(PluginCall call) {
        ReadingTimerReceiver.clear(getContext(), call.getString("id", ""));
        call.resolve();
    }

    @PluginMethod
    public void hide(PluginCall call) {
        ((NotificationManager) getContext().getSystemService(android.content.Context.NOTIFICATION_SERVICE)).cancel(ReadingTimerReceiver.NOTIFICATION);
        call.resolve();
    }
}
