# Keep WebView and JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.tappy.user.** { *; }

# WebView
-keep class android.webkit.WebView { *; }
-keep class android.webkit.WebViewClient { *; }
-keep class android.webkit.WebChromeClient { *; }
