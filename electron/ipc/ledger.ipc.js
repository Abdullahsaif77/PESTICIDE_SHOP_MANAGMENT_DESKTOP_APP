// electron/ipc/ledger.ipc.js

const { ipcMain } = require('electron');
const ledgerService = require('../services/ledger.service');

function registerLedgerIPC() {
    // ==================== CREATE ====================
    ipcMain.handle('ledger:create', async (event, data) => {
        try {
            return await ledgerService.createLedgerEntry(data);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== READ ====================
    ipcMain.handle('ledger:getAll', async (event, filters) => {
        try {
            return await ledgerService.getAllLedger(filters);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('ledger:getById', async (event, id) => {
        try {
            return await ledgerService.getLedgerById(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('ledger:getCustomer', async (event, customerId, filters) => {
        try {
            return await ledgerService.getCustomerLedger(customerId, filters);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('ledger:getSupplier', async (event, supplierId, filters) => {
        try {
            return await ledgerService.getSupplierLedger(supplierId, filters);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== BALANCE ====================
    ipcMain.handle('ledger:getCustomerBalance', async (event, customerId) => {
        try {
            return await ledgerService.getCustomerBalance(customerId);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('ledger:getSupplierBalance', async (event, supplierId) => {
        try {
            return await ledgerService.getSupplierBalance(supplierId);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== STATS ====================
    ipcMain.handle('ledger:getStats', async (event, filters) => {
        try {
            return await ledgerService.getLedgerStats(filters);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== DELETE ====================
    ipcMain.handle('ledger:delete', async (event, id) => {
        try {
            return await ledgerService.deleteLedgerEntry(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== AUTO CREATE ====================
    // These are internal methods called by other modules
    // Not exposed via IPC directly
}

module.exports = { registerLedgerIPC };