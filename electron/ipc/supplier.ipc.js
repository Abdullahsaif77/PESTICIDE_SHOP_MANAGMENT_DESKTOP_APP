const SupplierService = require("../services/supplier.service");
const { ipcMain } = require("electron");

function SetSupplierIPC() {
    console.log("Setting up supplier IPC handlers...");

    // Create new supplier
    ipcMain.handle("supplier:create", async (event, data) => {
        try {
            return await SupplierService.createSupplier(data);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Get all suppliers with filters
    ipcMain.handle("supplier:getAll", async (event, filters) => {
        try {
            return await SupplierService.getAllSuppliers(filters || {});
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Get supplier by ID
    ipcMain.handle("supplier:getById", async (event, id) => {
        try {
            return await SupplierService.getSupplierById(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Update supplier
    ipcMain.handle("supplier:update", async (event, id, data) => {
        try {
            return await SupplierService.updateSupplier(id, data);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Delete supplier (soft delete)
    ipcMain.handle("supplier:delete", async (event, id) => {
        try {
            return await SupplierService.deleteSupplier(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Get active suppliers only
    ipcMain.handle("supplier:getActive", async () => {
        try {
            return await SupplierService.getActiveSuppliers();
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Search suppliers
    ipcMain.handle("supplier:search", async (event, query) => {
        try {
            return await SupplierService.searchSuppliers(query);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Get supplier balance
    ipcMain.handle("supplier:getBalance", async (event, id) => {
        try {
            return await SupplierService.getSupplierBalance(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Update supplier balance
    ipcMain.handle("supplier:updateBalance", async (event, id, amount) => {
        try {
            return await SupplierService.updateSupplierBalance(id, amount);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Get supplier statistics
    ipcMain.handle("supplier:getStats", async () => {
        try {
            return await SupplierService.getSupplierStats();
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Get suppliers with high balance
    ipcMain.handle("supplier:getHighBalance", async (event, minBalance) => {
        try {
            return await SupplierService.getSuppliersWithHighBalance(minBalance || 10000);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Get top suppliers
    ipcMain.handle("supplier:getTop", async (event, limit) => {
        try {
            return await SupplierService.getTopSuppliers(limit || 10);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Get supplier summary
    ipcMain.handle("supplier:getSummary", async () => {
        try {
            return await SupplierService.getSupplierSummary();
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Export suppliers
    ipcMain.handle("supplier:export", async (event, filters) => {
        try {
            return await SupplierService.exportSuppliers(filters || {});
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Get supplier purchases
    ipcMain.handle("supplier:getPurchases", async (event, id) => {
        try {
            const purchases = await SupplierService.getSupplierPurchases(id);
            return { success: true, data: purchases };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Get supplier with most purchases
    ipcMain.handle("supplier:getMostPurchases", async () => {
        try {
            return await SupplierService.getSupplierWithMostPurchases();
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    console.log("Supplier IPC handlers registered successfully");
}

module.exports = { SetSupplierIPC };