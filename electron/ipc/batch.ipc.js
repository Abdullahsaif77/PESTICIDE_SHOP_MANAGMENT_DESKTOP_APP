const BatchService = require("../services/batch.service")
const { ipcMain } = require("electron")

function SetBatchIPC() {
    console.log("Setting up batch IPC handlers...")

    ipcMain.handle("batch:create", async (event, data) => {
        try {
            return await BatchService.createBatch(data)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("batch:getAll", async (event, filters) => {
        try {
            return await BatchService.getAllBatches(filters || {})
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("batch:getById", async (event, id) => {
        try {
            return await BatchService.getBatchById(id)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("batch:getByProduct", async (event, productId) => {
        try {
            return await BatchService.getBatchesByProduct(productId)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("batch:update", async (event, id, data) => {
        try {
            return await BatchService.updateBatch(id, data)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("batch:delete", async (event, id) => {
        try {
            return await BatchService.deleteBatch(id)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("batch:getExpiring", async (event, days) => {
        try {
            return await BatchService.getExpiringBatches(days || 30)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("batch:getExpired", async () => {
        try {
            return await BatchService.getExpiredBatches()
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    console.log("Batch IPC handlers registered successfully")
}

module.exports = { SetBatchIPC }