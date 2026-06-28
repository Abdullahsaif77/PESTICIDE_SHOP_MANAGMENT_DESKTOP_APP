// electron/ipc/customer.ipc.js

const { ipcMain } = require('electron');
const customerService = require('../services/customer.service');

function registerCustomerIPC() {
    // ==================== CRUD ====================
    ipcMain.handle('customer:create', async (event, data) => {
        try {
            return await customerService.createCustomer(data);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('customer:getAll', async (event, filters) => {
        try {
            return await customerService.getAllCustomers(filters);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('customer:getById', async (event, id) => {
        try {
            return await customerService.getCustomerById(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('customer:update', async (event, id, data) => {
        try {
            return await customerService.updateCustomer(id, data);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('customer:delete', async (event, id) => {
        try {
            return await customerService.deleteCustomer(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== READ OPERATIONS ====================
    ipcMain.handle('customer:getActive', async () => {
        try {
            return await customerService.getActiveCustomers();
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('customer:search', async (event, query) => {
        try {
            return await customerService.searchCustomers(query);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== BALANCE ====================
    ipcMain.handle('customer:getBalance', async (event, id) => {
        try {
            return await customerService.getCustomerBalance(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('customer:updateBalance', async (event, id, amount) => {
        try {
            return await customerService.updateCustomerBalance(id, amount);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== STATS ====================
    ipcMain.handle('customer:getStats', async () => {
        try {
            return await customerService.getCustomerStats();
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('customer:getTop', async (event, limit) => {
        try {
            return await customerService.getTopCustomers(limit);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('customer:getWithSales', async (event, id) => {
        try {
            return await customerService.getCustomerWithSales(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== EXPORT ====================
    ipcMain.handle('customer:export', async (event, filters) => {
        try {
            return await customerService.exportCustomers(filters);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
}

module.exports = { registerCustomerIPC };