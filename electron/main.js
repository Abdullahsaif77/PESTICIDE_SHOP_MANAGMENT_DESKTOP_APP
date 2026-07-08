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
const { registerExpenseHandlers } = require("./ipc/expense.ipc.js")
const { registerDashboardHandlers } = require('./ipc/dashboard.ipc.js');
const { setupProductReturnIpc } = require("./ipc/productReturn.ipc.js")
const { setupReportsIpc } = require('./ipc/reports.ipc');
const purchasePDFGenerator = require('./utils/pdfGenerator'); // Purchase PDF generator
const salePDFGenerator = require('./utils/saleGenerator'); // ✅ Sale PDF generator
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
  registerSalesIPC()  // This registers sale:generatePDF
  registerLedgerIPC()
  registerPDFIPC();
  registerExpenseHandlers()
  registerDashboardHandlers();
  setupProductReturnIpc();
  setupReportsIpc();
  
  // ===== PDF GENERATION IPC HANDLERS =====
  
  // Generic handler for both purchase and sale PDFs
  ipcMain.handle('generate-and-save-pdf', async (event, type, data, items) => {
    console.log('🔵 [Main] generate-and-save-pdf called with type:', type);
    try {
      const window = BrowserWindow.fromWebContents(event.sender);
      
      if (type === 'sale') {
        console.log('🔵 [Main] Using sale PDF generator');
        return await salePDFGenerator.generateAndSaveSale(data, items, window);
      } else if (type === 'purchase') {
        console.log('🔵 [Main] Using purchase PDF generator');
        return await purchasePDFGenerator.generateAndSavePurchase(data, items, window);
      } else {
        throw new Error(`Unknown PDF type: ${type}`);
      }
    } catch (error) {
      console.error('❌ [Main] PDF generation IPC error:', error);
      return { success: false, error: error.message };
    }
  });

  // ✅ REMOVED: Duplicate sale:generatePDF handler - now handled by sales.ipc.js
  
  // Purchase-specific PDF handler (if needed separately)
  ipcMain.handle('purchase:generatePDF', async (event, purchaseData, items) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);
      return await purchasePDFGenerator.generateAndSavePurchase(purchaseData, items, window);
    } catch (error) {
      console.error('Purchase PDF generation error:', error);
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