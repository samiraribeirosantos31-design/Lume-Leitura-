package com.lume.leitura;

import android.app.NotificationManager;
import android.content.Intent;
import android.view.Window;
import android.view.WindowManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONObject;

@CapacitorPlugin(name = "ReadingTimer")
public class ReadingTimerPlugin extends Plugin {
    private Float previousBrightness;

    @PluginMethod
    public void setNightBrightness(PluginCall call) {
        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", false));
        getActivity().runOnUiThread(() -> {
            Window window = getActivity().getWindow();
            WindowManager.LayoutParams attributes = window.getAttributes();
            if (enabled && previousBrightness == null) {
                previousBrightness = attributes.screenBrightness;
                attributes.screenBrightness = 0.01f;
                window.setAttributes(attributes);
            } else if (!enabled && previousBrightness != null) {
                attributes.screenBrightness = previousBrightness;
                previousBrightness = null;
                window.setAttributes(attributes);
            }
            call.resolve();
        });
    }

    private JSObject consumeOpenSession(Intent intent) {
        JSObject result = new JSObject();
        if (intent != null) {
            String id = intent.getStringExtra(ReadingTimerReceiver.OPEN_SESSION);
            if (id != null) {
                intent.removeExtra(ReadingTimerReceiver.OPEN_SESSION);
                result.put("id", id);
            }
        }
        return result;
    }

    @PluginMethod
    public void takeOpenSession(PluginCall call) {
        getActivity().runOnUiThread(() -> call.resolve(consumeOpenSession(getActivity().getIntent())));
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        JSObject result = consumeOpenSession(intent);
        if (result.has("id")) notifyListeners("openSession", result, true);
    }

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
