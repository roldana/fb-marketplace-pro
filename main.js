const { app, BrowserWindow, BrowserView, ipcMain, clipboard, session} = require('electron');
const path = require('path');

// Base URL for Facebook
const BASE_URL = "https://www.facebook.com";
const LOGIN_URL = "/login";
const DASHBOARD_URL = "/marketplace/you/dashboard";

const SEARCH_URL = "https://www.facebook.com/marketplace/search/?query=";
const SEARCH_INPUT_SELECTOR = 'input[placeholder="Search Marketplace"]';  
const SEARCH_BUTTON_SELECTOR = 'button[type="submit"]';
const SEARCH_RESULTS_SELECTOR = '.searchResults';
const SEARCH_ITEM_SELECTOR = '.searchResult';

// Classes used to extract product information from the loaded page
const PRODUCT_ITEM_CLASS = 'productItem';    // Placeholder class for product items
const PRODUCT_TITLE_CLASS = 'productTitle';  // Placeholder class for product title
const PRODUCT_PRICE_CLASS = 'productPrice';  // Placeholder class for product price

const DEFAULT_SIDEBAR_WIDTH = 250;
let sidebarWidth = DEFAULT_SIDEBAR_WIDTH;

let mainWindow;
let view;

async function isLoggedIn() {
  const cookies = await session.defaultSession.cookies.get({
    name: 'c_user',
    domain: 'facebook.com'
  });
  return cookies.length > 0;
}

function resizeView() {
  if (!mainWindow || !view) return;

  const [windowWidth, windowHeight] = mainWindow.getSize();

  const topBarHeight = 0;
  const bottomOffset = 36;
  const urlBarHeight = 0;

  view.setBounds({
    x: sidebarWidth,
    y: topBarHeight + urlBarHeight,
    width: windowWidth - sidebarWidth,
    height: windowHeight - topBarHeight - urlBarHeight - bottomOffset
  });
  view.setAutoResize({ width: true, height: true });

}

function createWindow() {
  console.log('[main] createWindow() running');
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.reactapp.fb-marketplace');
  }

  let savedSearches = [];

  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('[main] preload will be loaded from:', preloadPath);

  mainWindow = new BrowserWindow({
    width: 1300,
    height: 900,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // If you have a preload (optional)
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      devTools: true,
      webviewTag: true
    }
  });

  // Load the local HTML with the updated navigation bar
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // open Dev tools in new window
  mainWindow.webContents.openDevTools({ mode: 'detach' });

  // BrowserView for the main content

  // view = new BrowserView({
  //   webPreferences: {
  //     nodeIntegration: false,
  //     contextIsolation: true,
  //     enableRemoteModule: false,
  //     session: session.defaultSession
  //   }
  // });
  // mainWindow.setBrowserView(view);

  // Handle window resize
  mainWindow.on('resize', () => {
    resizeView();
  });

  const initial_url = '';
  
  // isLoggedIn()
  //   .then(loggedIn => {
  //     console.log('checking if user is logged in')
  //     view.webContents.loadURL(loggedIn ? BASE_URL + DASHBOARD_URL : BASE_URL + LOGIN_URL )
  //   })
  //   .catch(err => {
  //     console.error('Cookie check failed:', err);
  //     view.webContents.loadURL(BASE_URL+LOGIN_URL);
  //   });

  resizeView();

  // Initial load
  // view.webContents.loadURL(BASE_URL + DASHBOARD_URL);

  // Handle notification permissions
  const ses = view.webContents.session;
  ses.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'notifications') {
      callback(true);
    } else {
      callback(false);
    }
  });

  // Update URL display whenever navigation happens
  const updateURLDisplay = () => {
    const currentURL = view.webContents.getURL();
    console.log("Navigated to:", currentURL); // Print to terminal
    mainWindow.webContents.executeJavaScript(`
      document.getElementById('current-url').innerText = ${JSON.stringify(currentURL)};
    `);
  };

  view.webContents.on('did-navigate', updateURLDisplay);
  view.webContents.on('did-navigate-in-page', updateURLDisplay);

  // After the page finishes loading, attempt to extract products and update the sidebar
  // view.webContents.on('did-finish-load', () => {
  //   // Update the URL display
  //   updateURLDisplay();

  //   // Extract product data from the page
  //   // Adjust these selectors to match actual elements on the Marketplace page
  //   const script = `
  //     (function() {
  //       const items = Array.from(document.querySelectorAll('.${PRODUCT_ITEM_CLASS}'));
  //       return items.map(item => {
  //         const titleEl = item.querySelector('.${PRODUCT_TITLE_CLASS}');
  //         const priceEl = item.querySelector('.${PRODUCT_PRICE_CLASS}');
  //         const linkEl = item.querySelector('a');
  //         return {
  //           url: linkEl ? linkEl.href : '',
  //           title: titleEl ? titleEl.innerText.trim() : '',
  //           price: priceEl ? priceEl.innerText.trim() : ''
  //         };
  //       });
  //     })();
  //   `;
  //   view.webContents.executeJavaScript(script).then(products => {
  //     let productHTML = '';
  //     products.forEach(p => {
  //       productHTML += `
  //         <li>
  //           <span class="product-title">${p.title}</span>
  //           <span class="product-price">${p.price}</span><br/>
  //           <a href="${p.url}" target="_blank">${p.url}</a>
  //         </li>
  //       `;
  //     });

  //     mainWindow.webContents.executeJavaScript(`
  //       const ul = document.querySelector('.saved-products .products-list');
  //       if (ul) ul.innerHTML = ${JSON.stringify(productHTML)};
  //     `);
  //   }).catch(err => {
  //     console.error('Error extracting products:', err);
  //   });
  // });

  // IPC listener for navigation requests from the renderer
  ipcMain.on('navigate', (event, relativePath) => {
    console.log("Navigating to:", relativePath); // Print to terminal
    const targetURL = BASE_URL + relativePath;
    console.log("Target URL:", targetURL); // Print to terminal
    view.webContents.loadURL(targetURL);
  });

  ipcMain.on('save-search', (event, query) => {
    // Here you would insert the search term into your database.
    // For this demo, we simply push it into the array.
    savedSearches.push(query);
    console.log("Saved search:", query);
    event.reply('search-saved', savedSearches);
  });
  
  ipcMain.on('get-saved-searches', (event) => {
    event.reply('saved-searches', savedSearches);
  });

  ipcMain.on('copy-to-clipboard', (event, text) => {
    // Use the clipboard module to copy text to the clipboard
    clipboard.writeText(text);
  });

  ipcMain.on('sidebar-toggled', (event, collapsed) => {
    sidebarWidth = collapsed ? 0 : DEFAULT_SIDEBAR_WIDTH;
    resizeView();
  });
}

// When app is ready, create the window
app.whenReady().then(createWindow);

// On macOS, recreate a window when the dock icon is clicked and no other windows are open.
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
