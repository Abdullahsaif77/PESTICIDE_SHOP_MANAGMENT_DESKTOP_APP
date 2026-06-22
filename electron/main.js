const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const registerProductIPC = require("./ipc/product.ipc")
const { setupAuthIpc } = require("./ipc/user.ipc")


let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false, 
    },
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

}

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  registerProductIPC()
  setupAuthIpc();

   const result = productService.createProduct({
    name: "Test Product",
    category_id: 1,
    unit_id: 1,
    purchase_price: 100,
    sale_price: 150,
  });

  console.log("CREATE RESULT:", result);

  console.log("ALL PRODUCTS:", productService.getProduct());

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    
  }
});