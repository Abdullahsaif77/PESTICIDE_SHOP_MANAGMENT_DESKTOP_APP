const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { registerProductIPC } = require("./ipc/product.ipc")
const { setupAuthIpc } = require("./ipc/user.ipc")
const { setupShopIpc } = require("./ipc/shop.ipc")
const { getBackUpIpc } = require("./ipc/backup.ipc")
const { SetWareHouseIPC } = require("./ipc/warehouse.ipc")
const { SetBatchIPC } = require("./ipc/batch.ipc")
const { SetInventoryIPC } = require("./ipc/inventory.ipc")
const { SetStockTransferIPC } = require("./ipc/stockTransfer.ipc")
const fs = require("fs")



const backUpFolderPath = path.join(__dirname, "backups");

function BackupFolderExists() {
  try {
    if (!fs.existsSync(backUpFolderPath)) {
      fs.mkdirSync(backUpFolderPath, { recursive: true })
      console.log('Backups folder created automatically at:', backUpFolderPath)
    } else {
      console.log('Backups folder already exists.');
    }
  } catch (error) {
    console.log("Error", error.message)
  }
}

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
  
  // Register all IPC handlers
  registerProductIPC()
  setupAuthIpc();
  setupShopIpc();
  getBackUpIpc()
  SetWareHouseIPC()
  SetBatchIPC()
  SetInventoryIPC()
  SetStockTransferIPC()
  
  BackupFolderExists();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});