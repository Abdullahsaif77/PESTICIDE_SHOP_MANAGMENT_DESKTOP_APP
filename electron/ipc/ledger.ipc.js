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

    // ==================== PAYMENT / RECEIPT ====================
    ipcMain.handle('ledger:recordCustomerPayment', async (event, customerId, amount, paymentMethod, referenceId, notes) => {
        try {
            return await ledgerService.recordCustomerPayment(customerId, amount, paymentMethod, referenceId, notes);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('ledger:recordSupplierPayment', async (event, supplierId, amount, paymentMethod, referenceId, notes) => {
        try {
            return await ledgerService.recordSupplierPayment(supplierId, amount, paymentMethod, referenceId, notes);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('ledger:recordReceipt', async (event, customerId, amount, paymentMethod, referenceId, notes) => {
        try {
            return await ledgerService.recordReceipt(customerId, amount, paymentMethod, referenceId, notes);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== ADJUSTMENTS ====================
    ipcMain.handle('ledger:adjustCustomerBalance', async (event, customerId, amount, reason, referenceId) => {
        try {
            return await ledgerService.adjustCustomerBalance(customerId, amount, reason, referenceId);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('ledger:adjustSupplierBalance', async (event, supplierId, amount, reason, referenceId) => {
        try {
            return await ledgerService.adjustSupplierBalance(supplierId, amount, reason, referenceId);
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
            const result = await ledgerService.getLedgerStats(filters);
            return result;
        } catch (error) {
            console.error('Error in ledger:getStats:', error);
            return {
                success: false,
                data: {
                    totalEntries: 0,
                    totalDebit: 0,
                    totalCredit: 0,
                    totalCustomers: 0,
                    totalSuppliers: 0
                },
                error: error.message
            };
        }
    });

    // ==================== ✅ NEW: CUSTOMER LEDGER STATS ====================
    ipcMain.handle('ledger:getCustomerLedgerStats', async (event, customerId) => {
        try {
            const result = await ledgerService.getCustomerLedgerStats(customerId);
            return result;
        } catch (error) {
            console.error('Error in ledger:getCustomerLedgerStats:', error);
            return {
                success: false,
                error: error.message,
                data: {
                    totalEntries: 0,
                    totalDebit: 0,
                    totalCredit: 0,
                    netBalance: 0,
                    totalSales: 0,
                    totalSalesAmount: 0
                }
            };
        }
    });

    ipcMain.handle('ledger:getAllCustomerLedgerStats', async (event) => {
        try {
            const result = await ledgerService.getAllCustomerLedgerStats();
            return result;
        } catch (error) {
            console.error('Error in ledger:getAllCustomerLedgerStats:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    });

    // ==================== ✅ NEW: SUPPLIER LEDGER STATS ====================
    ipcMain.handle('ledger:getSupplierLedgerStats', async (event, supplierId) => {
        try {
            const result = await ledgerService.getSupplierLedgerStats(supplierId);
            return result;
        } catch (error) {
            console.error('Error in ledger:getSupplierLedgerStats:', error);
            return {
                success: false,
                error: error.message,
                data: {
                    totalEntries: 0,
                    totalDebit: 0,
                    totalCredit: 0,
                    netBalance: 0,
                    totalPurchases: 0,
                    totalPurchasesAmount: 0
                }
            };
        }
    });

    ipcMain.handle('ledger:getAllSupplierLedgerStats', async (event) => {
        try {
            const result = await ledgerService.getAllSupplierLedgerStats();
            return result;
        } catch (error) {
            console.error('Error in ledger:getAllSupplierLedgerStats:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
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
}

module.exports = { registerLedgerIPC };