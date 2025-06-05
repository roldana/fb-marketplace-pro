// Using event delegation for sidebar navigation clicks
document.querySelector('#sidebar').addEventListener('click', function(e) {
    console.log("Sidebar click event:", e);
    if(e.target.tagName.toLowerCase() === 'a'){
    e.preventDefault();
    const targetHref = e.target.getAttribute('href');
    console.log("Navigating to:", targetHref);
    if(window.electronAPI && typeof window.electronAPI.navigate === 'function') {
        window.electronAPI.navigate(targetHref);
    } else {
        console.error("navigate function not available");
    }
    }
});
// Event listener for the Copy URL button
document.getElementById("copyUrlBtn").addEventListener("click", function() {
    const urlText = document.querySelector(".url-display").innerText;
    if (navigator.clipboard) {
    navigator.clipboard.writeText(urlText).then(() => {
        alert("URL copied to clipboard!");
    }).catch(err => {
        console.error("Failed to copy URL: ", err);
    });
    } else {
    // Fallback for browsers without navigator.clipboard
    const textArea = document.createElement("textarea");
    textArea.value = urlText;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand("copy");
        alert("URL copied to clipboard!");
    } catch (err) {
        console.error("Fallback: Unable to copy", err);
    }
    document.body.removeChild(textArea);
    }
});
    document.addEventListener("DOMContentLoaded", function() {
    const copyBtn = document.getElementById("copyUrlBtn");
    if (!copyBtn) {
        console.error("copyUrlBtn element not found");
        return;
    }
    copyBtn.addEventListener("click", function() {
        console.log("Copy URL button clicked");
        const urlText = document.getElementById("current-url").innerText;
        if (window.electronAPI && typeof window.electronAPI.copyText === 'function') {
        window.electronAPI.copyText(urlText);
        alert("URL copied to clipboard!");
        } else {
        console.error("copyText function not available");
        }
    });
    });
// Handle search execution
document.getElementById('executeSearch').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value;
    if (query.trim() !== "") {
    window.electronAPI.navigate('/marketplace/search/?query=' + encodeURIComponent(query));
    }
});

// Handle saving the search
document.getElementById('saveSearch').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value;
    if (query.trim() !== "") {
    window.electronAPI.saveSearch(query);
    }
});

// Display saved searches when received from the main process
function updateSavedSearches(searches) {
    const list = document.getElementById('savedSearchList');
    list.innerHTML = '';
    searches.forEach(search => {
    const li = document.createElement('li');
    li.innerText = search;
    // Clicking a saved search executes the search
    li.addEventListener('click', () => {
        window.electronAPI.navigate('/marketplace/search/?query=' + encodeURIComponent(search));
    });
    list.appendChild(li);
    });
}

// Listen for IPC events updating the saved searches
window.electronAPI.onSearchSaved((data) => {
    updateSavedSearches(data);
});
window.electronAPI.onReceiveSavedSearches((data) => {
    updateSavedSearches(data);
});

// Request saved searches when the page loads
window.electronAPI.requestSavedSearches();
// SIDEBAR TOGGLING
document.addEventListener("DOMContentLoaded", function() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggle-btn');

    toggleBtn.addEventListener('click', () => {
    const nowCollapsed = sidebar.classList.toggle('collapsed');
    if (window.electronAPI && typeof window.electronAPI.toggleSidebar === 'function') {
        window.electronAPI.toggleSidebar(nowCollapsed);
    }
    });
});
document.addEventListener('DOMContentLoaded', () => {
// Grab the <webview> one time
const webview = document.getElementById('facebook-view');
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggle-btn');

// Now reuse `webview` in any handler below:

sidebar.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'a') {
    e.preventDefault();
    const targetHref = e.target.href;
    webview.loadURL(targetHref);
    }
});

toggleBtn.addEventListener('click', () => {
    console.log("toggle-btn clicked")
    const nowCollapsed = sidebar.classList.toggle('collapsed');
    window.electronAPI.toggleSidebar(nowCollapsed);
    // If you needed to do something to the webview when collapsing, you could use `webview` directly.
});
});