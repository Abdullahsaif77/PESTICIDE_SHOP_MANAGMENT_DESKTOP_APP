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
const { SetSupplierIPC } = require("./ipc/supplier.ipc")
const { registerCustomerIPC } = require("./ipc/customer.ipc.js")
const { registerPurchaseIPC } = require("./ipc/purchase.ipc.js")
const { registerSalesIPC } = require("./ipc/sales.ipc.js")
const { registerLedgerIPC } = require("./ipc/ledger.ipc.js")
const { registerPDFIPC } = require('./ipc/pdf.ipc');
const pdfGenerator = require('./utils/pdfGenerator'); // Add this import
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
  SetSupplierIPC()
  registerCustomerIPC()
  registerPurchaseIPC()
  registerSalesIPC()
  registerLedgerIPC()
  registerPDFIPC();
  
  // ===== ADD PDF GENERATION IPC HANDLER =====
  // This handles the save dialog for PDFs
  ipcMain.handle('generate-and-save-pdf', async (event, type, data, items) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);
      
      if (type === 'sale') {
        return await pdfGenerator.generateAndSave(data, items, window);
      } else if (type === 'purchase') {
        return await pdfGenerator.generateAndSavePurchase(data, items, window);
      } else {
        throw new Error(`Unknown PDF type: ${type}`);
      }
    } catch (error) {
      console.error('PDF generation IPC error:', error);
      return { success: false, error: error.message };
    }
  });
  
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