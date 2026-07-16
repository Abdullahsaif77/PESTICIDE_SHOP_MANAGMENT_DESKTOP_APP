const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
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
const purchasePDFGenerator = require('./utils/pdfGenerator');
const salePDFGenerator = require('./utils/saleGenerator');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    icon: path.join(__dirname, "../src/assets/logo.png"),
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
  // ✅ Initialize database AFTER app is ready
  let db;
  try {
    console.log("🗄️ Initializing database...");
    db = require("./database/database"); // ← FIX: Changed from "database" to "init"
    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    dialog.showErrorBox(
      "Database Error",
      `Failed to initialize the database:\n\n${error.message}\n\nPlease ensure you have write permissions in:\n${app.getPath('userData')}`
    );
    app.quit();
    return;
  }

  createWindow();
  
  // Register all IPC handlers
  registerProductIPC();
  setupAuthIpc();
  setupShopIpc();
  getBackUpIpc();
  SetWareHouseIPC();
  SetBatchIPC();
  SetInventoryIPC();
  SetStockTransferIPC();
  SetSupplierIPC();
  registerCustomerIPC();
  registerPurchaseIPC();
  registerSalesIPC();
  registerLedgerIPC();
  registerPDFIPC();
  registerExpenseHandlers();
  registerDashboardHandlers();
  setupProductReturnIpc();
  setupReportsIpc();
  
  // PDF Generation IPC Handlers
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

  ipcMain.handle('purchase:generatePDF', async (event, purchaseData, items) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);
      return await purchasePDFGenerator.generateAndSavePurchase(purchaseData, items, window);
    } catch (error) {
      console.error('Purchase PDF generation error:', error);
      return { success: false, error: error.message };
    }
  });
  
  // ✅ REMOVED: Backup folder creation - Now handled by backup service
  // Backup folder will be created in userData by the backup service
  console.log('📁 User data path:', app.getPath('userData'));

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});