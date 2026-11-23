package com.lume.leitura;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.mlkit.common.model.DownloadConditions;
import com.google.mlkit.nl.languageid.LanguageIdentification;
import com.google.mlkit.nl.languageid.LanguageIdentifier;
import com.google.mlkit.nl.translate.TranslateLanguage;
import com.google.mlkit.nl.translate.Translation;
import com.google.mlkit.nl.translate.Translator;
import com.google.mlkit.nl.translate.TranslatorOptions;

@CapacitorPlugin(name = "BookTranslator")
public class BookTranslatorPlugin extends Plugin {
    private static final int MAX_LENGTH = 6000;

    private String synopsis(PluginCall call) {
        String text = call.getString("text", "").trim();
        if (text.isEmpty() || text.length() > MAX_LENGTH) {
            call.reject("Sinopse inválida.");
            return null;
        }
        return text;
    }

    @PluginMethod
    public void identify(PluginCall call) {
        String text = synopsis(call);
        if (text == null) return;
        LanguageIdentifier identifier = LanguageIdentification.getClient();
        identifier.identifyLanguage(text).addOnCompleteListener(result -> {
            identifier.close();
            if (result.isSuccessful()) {
                JSObject data = new JSObject();
                data.put("language", result.getResult());
                call.resolve(data);
            } else {
                call.reject("Não foi possível identificar o idioma.");
            }
        });
    }

    @PluginMethod
    public void translate(PluginCall call) {
        String text = synopsis(call);
        if (text == null) return;
        TranslatorOptions options = new TranslatorOptions.Builder()
                .setSourceLanguage(TranslateLanguage.ENGLISH)
                .setTargetLanguage(TranslateLanguage.PORTUGUESE)
                .build();
        Translator translator = Translation.getClient(options);
        translator.downloadModelIfNeeded(new DownloadConditions.Builder().build())
                .continueWithTask(download -> {
                    download.getResult();
                    return translator.translate(text);
                })
                .addOnCompleteListener(result -> {
                    translator.close();
                    if (result.isSuccessful()) {
                        JSObject data = new JSObject();
                        data.put("text", result.getResult());
                        call.resolve(data);
                    } else {
                        call.reject("Não foi possível traduzir. O primeiro uso precisa de internet.");
                    }
                });
    }
}
