const StockTransferService = require("../services/stockTransfer.service")
const { ipcMain } = require("electron")

function SetStockTransferIPC() {
    console.log("Setting up stock transfer IPC handlers...")

    ipcMain.handle("transfer:create", async (event, data) => {
        try {
            return await StockTransferService.createTransfer(data)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("transfer:getAll", async (event, filters) => {
        try {
            return await StockTransferService.getAllTransfers(filters || {})
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("transfer:getById", async (event, id) => {
        try {
            return await StockTransferService.getTransferById(id)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("transfer:complete", async (event, id) => {
        try {
            return await StockTransferService.completeTransfer(id)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("transfer:cancel", async (event, id) => {
        try {
            return await StockTransferService.cancelTransfer(id)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("transfer:delete", async (event, id) => {
        try {
            return await StockTransferService.deleteTransfer(id)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("transfer:getPending", async () => {
        try {
            return await StockTransferService.getPendingTransfers()
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("transfer:getHistory", async (event, limit) => {
        try {
            return await StockTransferService.getTransferHistory(limit || 50)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("transfer:getByProduct", async (event, productId) => {
        try {
            return await StockTransferService.getTransfersByProduct(productId)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("transfer:getFromWarehouse", async (event, warehouseId) => {
        try {
            return await StockTransferService.getTransfersFromWarehouse(warehouseId)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("transfer:getToWarehouse", async (event, warehouseId) => {
        try {
            return await StockTransferService.getTransfersToWarehouse(warehouseId)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("transfer:getStats", async () => {
        try {
            return await StockTransferService.getTransferStats()
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("transfer:getByDateRange", async (event, startDate, endDate) => {
        try {
            return await StockTransferService.getTransfersByDateRange(startDate, endDate)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    console.log("Stock Transfer IPC handlers registered successfully")
}

module.exports = { SetStockTransferIPC }