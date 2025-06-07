document.addEventListener("DOMContentLoaded", () => {
    const webview = document.getElementById("fb-view");
    webview.addEventListener("did-finish-load", () => {
        console.log("Webview finished loading:", webview.src);
    });

    // REMOVE TOP FACEBOOK BANNER
    if (webview) {
        webview.addEventListener('dom-ready', () => {
        webview.executeJavaScript(`
        const banner = document.querySelector('div[role="banner"]');
        if (banner) {
            banner.remove();
        }
        "Banner removed";
        `).then(result => {
        console.log("executeJavaScript result:", result);
        }).catch(err => {
        console.error("Error executing script:", err);
        });
    });
    } else {
    console.error("webview element not found");
    }

    // Hide missing top banner
    webview.addEventListener('dom-ready', () => {
    const hideHeightRem = 1.8;
    
    // Move the whole document body and webview sidebar upward so the first 100px are off-screen.
    webview.insertCSS(`
        html, body {
            margin-top: -${hideHeightRem}rem !important;
            height: calc(100% + ${hideHeightRem}rem) !important;
        }

        /* Move the sidebar up */
        div[aria-label="Marketplace sidebar"] > div:first-of-type {
            margin-top: -${hideHeightRem+1.2}rem !important;
            height: calc(100% + ${hideHeightRem+1.2}rem) !important;
        }
        
        `);


});
    // Check for permission and request if not granted
    if (Notification.permission !== "granted") {
    Notification.requestPermission().then(permission => {
        console.log("Notification permission:", permission);
    });
    }
});