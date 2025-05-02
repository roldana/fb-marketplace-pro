const { ipcRenderer, contextBridge } = require('electron');
const { contextBridge, clipboard } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  navigate: (url) => ipcRenderer.send('navigate', url),
  saveSearch: (query) => ipcRenderer.send('save-search', query),
  requestSavedSearches: () => ipcRenderer.send('get-saved-searches'),
  onSearchSaved: (callback) =>
    ipcRenderer.on('search-saved', (event, data) => callback(data)),
  onReceiveSavedSearches: (callback) =>
    ipcRenderer.on('saved-searches', (event, data) => callback(data)),
  copyText: (text) => ipcRenderer.send('copy-to-clipboard', text)
});