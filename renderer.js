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

    // Check for permission and request if not granted
    if (Notification.permission !== "granted") {
    Notification.requestPermission().then(permission => {
        console.log("Notification permission:", permission);
    });
    }
});