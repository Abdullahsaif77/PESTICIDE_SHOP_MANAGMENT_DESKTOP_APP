// electron/ipc/purchase.ipc.js

const { ipcMain } = require('electron');
const purchaseService = require('../services/purchase.service');

function registerPurchaseIPC() {
    // ==================== CREATE ====================
    ipcMain.handle('purchase:create', async (event, data) => {
        try {
            return await purchaseService.createPurchase(data);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== READ ====================
    ipcMain.handle('purchase:getAll', async (event, filters) => {
        try {
            return await purchaseService.getAllPurchases(filters);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('purchase:getById', async (event, id) => {
        try {
            return await purchaseService.getPurchaseById(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('purchase:getByNumber', async (event, number) => {
        try {
            return await purchaseService.getPurchaseByNumber(number);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('purchase:getBySupplier', async (event, supplierId) => {
        try {
            return await purchaseService.getSupplierPurchases(supplierId);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== UPDATE ====================
    ipcMain.handle('purchase:update', async (event, id, data) => {
        try {
            return await purchaseService.updatePurchase(id, data);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('purchase:updateStatus', async (event, id, status) => {
        try {
            return await purchaseService.updatePurchaseStatus(id, status);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== DELETE ====================
    ipcMain.handle('purchase:delete', async (event, id) => {
        try {
            return await purchaseService.deletePurchase(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== STATS ====================
    ipcMain.handle('purchase:getStats', async (event, filters) => {
        try {
            return await purchaseService.getPurchaseStats(filters);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== GENERATE NUMBER ====================
    ipcMain.handle('purchase:generateNumber', async () => {
        try {
            return await purchaseService.generatePurchaseNumber();
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
}

module.exports = { registerPurchaseIPC };