document.addEventListener("DOMContentLoaded", () => {
  // Grab elements
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("toggle-btn");
  const webview = document.getElementById("fb-view");

  // Helper: update the layout of the webview based on sidebar state.
  // function updateLayout() {
  //   if (sidebar.classList.contains("collapsed")) {
  //     // Sidebar hidden; webview takes full width.
  //     webview.style.left = "0";
  //     webview.style.width = "100%";
  //   } else {
  //     // Sidebar visible; webview shifted to the right.
  //     webview.style.left = "250px"; // or use your DEFAULT_SIDEBAR_WIDTH value
  //     webview.style.width = "calc(100% - 250px)";
  //   }
  // }

  // Sidebar navigation: handle clicks on links in the sidebar.
  sidebar.addEventListener("click", (event) => {
    if (event.target.tagName.toLowerCase() === "a") {
      event.preventDefault();
      const targetHref = event.target.getAttribute("href");
      console.log("Navigating to:", targetHref);
      // Instruct the webview to navigate.
      if (webview && typeof webview.loadURL === "function") {
        webview.loadURL(targetHref);
      } else {
        // As a fallback, update the `src` attribute.
        webview.src = targetHref;
      }
    }
  });

  // Toggle sidebar on button click.
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    // updateLayout();
    // Optionally notify the main process.
    // if (
    //   window.electronAPI &&
    //   typeof window.electronAPI.toggleSidebar === "function"
    // ) {
    //   window.electronAPI.toggleSidebar(sidebar.classList.contains("collapsed"));
    // }
  });

  // URL Copy functionality (assumes one copy button exists).
  const copyUrlBtn = document.getElementById("copyUrlBtn");
  if (copyUrlBtn) {
    copyUrlBtn.addEventListener("click", () => {
      const urlText = document.getElementById("current-url").innerText;
      if (
        window.electronAPI &&
        typeof window.electronAPI.copyText === "function"
      ) {
        window.electronAPI.copyText(urlText);
        alert("URL copied to clipboard!");
      } else if (navigator.clipboard) {
        navigator.clipboard
          .writeText(urlText)
          .then(() => alert("URL copied to clipboard!"))
          .catch((err) => console.error("Failed to copy URL:", err));
      } else {
        console.error("Clipboard API not available.");
      }
    });
  }

  // Handle search execution.
  document.getElementById("executeSearch").addEventListener("click", () => {
    const query = document.getElementById("searchInput").value;
    if (query.trim() !== "" && window.electronAPI.navigate) {
      window.electronAPI.navigate(
        "/marketplace/search/?query=" + encodeURIComponent(query)
      );
    }
  });

  // Handle saving search actions.
  document.getElementById("saveSearch").addEventListener("click", () => {
    const query = document.getElementById("searchInput").value;
    if (query.trim() !== "" && window.electronAPI.saveSearch) {
      window.electronAPI.saveSearch(query);
    }
  });

  // IPC listeners for updating saved searches.
  window.electronAPI.onSearchSaved((data) => {
    updateSavedSearches(data);
  });
  window.electronAPI.onReceiveSavedSearches((data) => {
    updateSavedSearches(data);
  });
  window.electronAPI.requestSavedSearches();

  // Helper: update saved searches list
  function updateSavedSearches(searches) {
    const list = document.getElementById("savedSearchList");
    if (!list) return;
    list.innerHTML = "";
    searches.forEach((search) => {
      const li = document.createElement("li");
      li.innerText = search;
      li.addEventListener("click", () => {
        if (window.electronAPI.navigate) {
          window.electronAPI.navigate(
            "/marketplace/search/?query=" + encodeURIComponent(search)
          );
        }
      });
      list.appendChild(li);
    });
  }

  // Initial layout update.
  // updateLayout();
});