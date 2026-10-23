package com.uricorn.sleepy;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/** Entirely offline WebView container. It has no INTERNET permission. */
public final class MainActivity extends Activity {
    private static final int IMPORT_FILE = 71;
    private static final int EXPORT_FILE = 72;
    private static final String HOST = "sleepy.local";
    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;
    private String pendingBackup;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(12, 16, 23));
        getWindow().setNavigationBarColor(Color.rgb(12, 16, 23));
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(12, 16, 23));
        setContentView(webView);
        // Respect system insets on Android 15 rather than covering controls with system bars.
        webView.setOnApplyWindowInsetsListener((view, insets) -> {
            view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets.consumeSystemWindowInsets();
        });
        webView.requestApplyInsets();
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setUserAgentString(settings.getUserAgentString() + " SleepyAndroid/1");
        webView.addJavascriptInterface(new BackupBridge(), "SleepyNative");
        webView.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (!"https".equals(uri.getScheme()) || !HOST.equals(uri.getHost()) || !"GET".equals(request.getMethod())) {
                    return blockedResponse();
                }
                String path = uri.getPath();
                if (path == null || path.equals("/")) path = "/index.html";
                if (path.contains("..") || path.contains("\\")) return blockedResponse();
                String asset = path.substring(1);
                try {
                    Map<String, String> headers = new HashMap<>();
                    headers.put("Cache-Control", "no-cache");
                    headers.put("X-Content-Type-Options", "nosniff");
                    return new WebResourceResponse(mimeType(asset), "UTF-8", 200, "OK", headers,
                        getAssets().open(asset));
                } catch (IOException error) {
                    return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", new HashMap<>(),
                        new ByteArrayInputStream(new byte[0]));
                }
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                return !"https".equals(uri.getScheme()) || !HOST.equals(uri.getHost());
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("*/*");
                intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"application/json", "text/plain", "application/octet-stream"});
                try { startActivityForResult(intent, IMPORT_FILE); }
                catch (Exception error) { fileCallback.onReceiveValue(null); fileCallback = null; }
                return true;
            }
        });
        if (state == null || webView.restoreState(state) == null) webView.loadUrl("https://" + HOST + "/");
    }

    private WebResourceResponse blockedResponse() {
        return new WebResourceResponse("text/plain", "UTF-8", 403, "Offline app", new HashMap<>(),
            new ByteArrayInputStream(new byte[0]));
    }

    private static String mimeType(String file) {
        String lower = file.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".html")) return "text/html";
        if (lower.endsWith(".js") || lower.endsWith(".mjs")) return "application/javascript";
        if (lower.endsWith(".css")) return "text/css";
        if (lower.endsWith(".json") || lower.endsWith(".webmanifest")) return "application/json";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".ico")) return "image/x-icon";
        if (lower.endsWith(".woff2")) return "font/woff2";
        return "application/octet-stream";
    }

    private final class BackupBridge {
        @JavascriptInterface public void saveBackup(String filename, String json) {
            if (json == null || json.length() > 20_000_000) return;
            runOnUiThread(() -> {
                if (pendingBackup != null) { backupResult(false); return; }
                pendingBackup = json;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("application/json");
                String safeName = filename == null ? "sleepy-backup.json" : filename.replaceAll("[^a-zA-Z0-9._-]", "_");
                intent.putExtra(Intent.EXTRA_TITLE, safeName);
                try { startActivityForResult(intent, EXPORT_FILE); }
                catch (Exception error) { pendingBackup = null; backupResult(false); }
            });
        }
    }

    private void backupResult(boolean success) {
        webView.evaluateJavascript("window.dispatchEvent(new CustomEvent('sleepy-backup-result',{detail:{success:"
            + success + "}}));", null);
    }

    @Override protected void onActivityResult(int request, int result, Intent intent) {
        super.onActivityResult(request, result, intent);
        if (request == IMPORT_FILE && fileCallback != null) {
            fileCallback.onReceiveValue(result == RESULT_OK && intent != null && intent.getData() != null
                ? new Uri[]{intent.getData()} : null);
            fileCallback = null;
        }
        if (request == EXPORT_FILE) {
            boolean success = false;
            if (result == RESULT_OK && intent != null && intent.getData() != null && pendingBackup != null) {
                try (OutputStream stream = getContentResolver().openOutputStream(intent.getData(), "wt")) {
                    if (stream != null) {
                        stream.write(pendingBackup.getBytes(StandardCharsets.UTF_8));
                        success = true;
                    }
                } catch (IOException error) {
                    Toast.makeText(this, "Could not save backup", Toast.LENGTH_LONG).show();
                }
            }
            pendingBackup = null;
            backupResult(success);
        }
    }

    @Override public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }
    @Override protected void onSaveInstanceState(Bundle state) {
        webView.saveState(state);
        super.onSaveInstanceState(state);
    }
    @Override protected void onDestroy() {
        if (fileCallback != null) fileCallback.onReceiveValue(null);
        webView.removeJavascriptInterface("SleepyNative");
        webView.destroy();
        super.onDestroy();
    }
}
