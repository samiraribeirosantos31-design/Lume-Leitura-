package com.lume.leitura;

import android.os.Bundle;
import android.content.Intent;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ReadingTimerPlugin.class);
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onBackPressed() {
        if (getBridge() == null) {
            super.onBackPressed();
            return;
        }
        getBridge().getWebView().evaluateJavascript("Boolean(window.lumeHandleBack && window.lumeHandleBack())", handled -> {
            if (!"true".equals(handled)) super.onBackPressed();
        });
    }

    @Override
    protected void onNewIntent(Intent intent) {
        setIntent(intent);
        super.onNewIntent(intent);
    }
}
