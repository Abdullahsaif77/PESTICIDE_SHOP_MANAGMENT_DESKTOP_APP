const WareHouseService = require("../services/warehouse.service");
const { ipcMain } = require("electron");

// Import purchase service for warehouse inventory
const purchaseService = require("../services/purchase.service");

function SetWareHouseIPC() {
    console.log("Setting up warehouse IPC handlers...");

    ipcMain.handle("warehouse:create", async (event, data) => {
        try {
            return await WareHouseService.createWarehouse(data);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("warehouse:getById", async (event, id) => {
        try {
            return await WareHouseService.getWarehouseById(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("warehouse:update", async (event, id, data) => {
        try {
            return await WareHouseService.updateWarehouse(id, data);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("warehouse:delete", async (event, id) => {
        try {
            return await WareHouseService.deleteWarehouse(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("warehouse:ActiveOnly", async () => {
        try {
            return await WareHouseService.getOnlyActive();
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==========================================
    // ✅ NEW: Get Warehouse Inventory
    // ==========================================
    ipcMain.handle("warehouse:getInventory", async (event, warehouseId) => {
        try {
            console.log(`📦 Fetching inventory for warehouse: ${warehouseId}`);
            const inventory = await purchaseService.getWarehouseInventory(warehouseId);
            return inventory;
        } catch (error) {
            console.error("Error fetching warehouse inventory:", error);
            return { success: false, error: error.message, data: [] };
        }
    });

    console.log("✅ Warehouse IPC handlers registered successfully");
}

// Export both as a function and as an object
module.exports = { SetWareHouseIPC };