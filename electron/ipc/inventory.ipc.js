const InventoryService = require("../services/inventory.service")
const { ipcMain } = require("electron")

function SetInventoryIPC() {
    console.log("Setting up inventory IPC handlers...")

    ipcMain.handle("inventory:getByProduct", async (event, productId) => {
        try {
            return await InventoryService.getInventoryByProduct(productId)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("inventory:getByWarehouse", async (event, warehouseId) => {
        try {
            return await InventoryService.getInventoryByWarehouse(warehouseId)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("inventory:getProductStock", async (event, productId, warehouseId) => {
        try {
            return await InventoryService.getProductStockInWarehouse(productId, warehouseId)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("inventory:addStock", async (event, productId, warehouseId, batchId, quantity) => {
        try {
            return await InventoryService.addStock(productId, warehouseId, batchId, quantity)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("inventory:removeStock", async (event, productId, warehouseId, batchId, quantity) => {
        try {
            return await InventoryService.removeStock(productId, warehouseId, batchId, quantity)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("inventory:reserve", async (event, productId, warehouseId, batchId, quantity) => {
        try {
            return await InventoryService.reserveStock(productId, warehouseId, batchId, quantity)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("inventory:release", async (event, productId, warehouseId, batchId, quantity) => {
        try {
            return await InventoryService.releaseReservedStock(productId, warehouseId, batchId, quantity)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("inventory:getLowStock", async () => {
        try {
            return await InventoryService.getLowStock()
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("inventory:getSummary", async () => {
        try {
            return await InventoryService.getInventorySummary()
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("inventory:updateMinMax", async (event, productId, warehouseId, minStock, maxStock) => {
        try {
            return await InventoryService.updateMinMax(productId, warehouseId, minStock, maxStock)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("inventory:getStockValue", async () => {
        try {
            return await InventoryService.getStockValue()
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("inventory:getDetailedWarehouse", async (event, warehouseId) => {
        try {
            return await InventoryService.getDetailedWarehouseInventory(warehouseId)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("inventory:getAvailableQuantity", async (event, productId, warehouseId) => {
        try {
            return await InventoryService.getAvailableQuantity(productId, warehouseId)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    console.log("Inventory IPC handlers registered successfully")
}

module.exports = { SetInventoryIPC }