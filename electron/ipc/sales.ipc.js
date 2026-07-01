// electron/ipc/sales.ipc.js

const { ipcMain } = require('electron');
const salesService = require('../services/sales.service');

function registerSalesIPC() {
    // ==================== CREATE ====================
    ipcMain.handle('sale:create', async (event, data) => {
        try {
            return await salesService.createSale(data);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== READ ====================
    ipcMain.handle('sale:getAll', async (event, filters) => {
        try {
            return await salesService.getAllSales(filters);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('sale:getById', async (event, id) => {
        try {
            return await salesService.getSaleById(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('sale:getByInvoice', async (event, number) => {
        try {
            return await salesService.getSaleByInvoiceNumber(number);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('sale:getByCustomer', async (event, customerId) => {
        try {
            return await salesService.getCustomerSales(customerId);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== UPDATE ====================
    ipcMain.handle('sale:update', async (event, id, data) => {
        try {
            return await salesService.updateSale(id, data);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('sale:updateStatus', async (event, id, status) => {
        try {
            return await salesService.updateSaleStatus(id, status);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== DELETE ====================
    ipcMain.handle('sale:delete', async (event, id) => {
        try {
            return await salesService.deleteSale(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== STATS ====================
    ipcMain.handle('sale:getStats', async (event, filters) => {
        try {
            return await salesService.getSaleStats(filters);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== GENERATE NUMBER ====================
    ipcMain.handle('sale:generateNumber', async () => {
        try {
            return await salesService.generateInvoiceNumber();
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
}

module.exports = { registerSalesIPC };