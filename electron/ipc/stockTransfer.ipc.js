// electron/ipc/stockTransfer.ipc.js

const StockTransferService = require("../services/stockTransfer.service");
const { ipcMain } = require("electron");

function SetStockTransferIPC() {
    console.log("Setting up stock transfer IPC handlers...");

    // ==================== CREATE ====================
    ipcMain.handle("transfer:create", async (event, data) => {
        try {
            console.log("📦 Creating transfer with data:", JSON.stringify(data, null, 2));
            const result = await StockTransferService.createTransfer(data);
            console.log("✅ Transfer result:", result);
            return result;
        } catch (error) {
            console.error("❌ Transfer creation error:", error);
            return { success: false, error: error.message };
        }
    });

    // ==================== READ ====================
    ipcMain.handle("transfer:getAll", async (event, filters) => {
        try {
            const result = await StockTransferService.getAllTransfers(filters || {});
            return result;
        } catch (error) {
            console.error("Error getting transfers:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("transfer:getById", async (event, id) => {
        try {
            const result = await StockTransferService.getTransferById(id);
            return result;
        } catch (error) {
            console.error("Error getting transfer by ID:", error);
            return { success: false, error: error.message };
        }
    });

    // ==================== UPDATE ====================
    ipcMain.handle("transfer:complete", async (event, id) => {
        try {
            console.log(`✅ Completing transfer: ${id}`);
            const result = await StockTransferService.completeTransfer(id);
            return result;
        } catch (error) {
            console.error("Error completing transfer:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("transfer:cancel", async (event, id) => {
        try {
            console.log(`❌ Cancelling transfer: ${id}`);
            const result = await StockTransferService.cancelTransfer(id);
            return result;
        } catch (error) {
            console.error("Error cancelling transfer:", error);
            return { success: false, error: error.message };
        }
    });

    // ==================== DELETE ====================
    ipcMain.handle("transfer:delete", async (event, id) => {
        try {
            console.log(`🗑️ Deleting transfer: ${id}`);
            const result = await StockTransferService.deleteTransfer(id);
            return result;
        } catch (error) {
            console.error("Error deleting transfer:", error);
            return { success: false, error: error.message };
        }
    });

    // ==================== QUERIES ====================
    ipcMain.handle("transfer:getPending", async () => {
        try {
            return await StockTransferService.getPendingTransfers();
        } catch (error) {
            console.error("Error getting pending transfers:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("transfer:getHistory", async (event, limit) => {
        try {
            return await StockTransferService.getTransferHistory(limit || 50);
        } catch (error) {
            console.error("Error getting transfer history:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("transfer:getByProduct", async (event, productId) => {
        try {
            return await StockTransferService.getTransfersByProduct(productId);
        } catch (error) {
            console.error("Error getting transfers by product:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("transfer:getFromWarehouse", async (event, warehouseId) => {
        try {
            return await StockTransferService.getTransfersFromWarehouse(warehouseId);
        } catch (error) {
            console.error("Error getting transfers from warehouse:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("transfer:getToWarehouse", async (event, warehouseId) => {
        try {
            return await StockTransferService.getTransfersToWarehouse(warehouseId);
        } catch (error) {
            console.error("Error getting transfers to warehouse:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("transfer:getStats", async () => {
        try {
            return await StockTransferService.getTransferStats();
        } catch (error) {
            console.error("Error getting transfer stats:", error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("transfer:getByDateRange", async (event, startDate, endDate) => {
        try {
            return await StockTransferService.getTransfersByDateRange(startDate, endDate);
        } catch (error) {
            console.error("Error getting transfers by date range:", error);
            return { success: false, error: error.message };
        }
    });

    console.log("✅ Stock Transfer IPC handlers registered successfully");
}

module.exports = { SetStockTransferIPC };