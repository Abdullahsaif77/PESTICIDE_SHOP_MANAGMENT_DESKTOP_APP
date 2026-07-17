// electron/ipc/reports.ipc.js

const { ipcMain } = require('electron');
const ReportsService = require('../services/reports.service');

const reportsService = new ReportsService();

/**
 * Setup Reports IPC handlers
 */
function setupReportsIpc() {
    // ============================================
    // SALES REPORT
    // ============================================
    ipcMain.handle('report:sales', async (event, filters) => {
        try {
            const result = await reportsService.getSalesReport(filters);
            return result;
        } catch (error) {
            console.error('Error in report:sales:', error);
            return { success: false, error: error.message };
        }
    });

    // ============================================
    // PURCHASE REPORT
    // ============================================
    ipcMain.handle('report:purchases', async (event, filters) => {
        try {
            const result = await reportsService.getPurchaseReport(filters);
            return result;
        } catch (error) {
            console.error('Error in report:purchases:', error);
            return { success: false, error: error.message };
        }
    });

    // ============================================
    // PROFIT & LOSS REPORT
    // ============================================
    ipcMain.handle('report:profit-loss', async (event, filters) => {
        try {
            const result = await reportsService.getProfitLossReport(filters);
            return result;
        } catch (error) {
            console.error('Error in report:profit-loss:', error);
            return { success: false, error: error.message };
        }
    });

    // ============================================
    // INVENTORY REPORT
    // ============================================
    ipcMain.handle('report:inventory', async (event, filters) => {
        try {
            const result = await reportsService.getInventoryReport(filters);
            return result;
        } catch (error) {
            console.error('Error in report:inventory:', error);
            return { success: false, error: error.message };
        }
    });

    // ============================================
    // LOW STOCK REPORT
    // ============================================
    ipcMain.handle('report:low-stock', async (event, filters) => {
        try {
            const result = await reportsService.getLowStockReport(filters);
            return result;
        } catch (error) {
            console.error('Error in report:low-stock:', error);
            return { success: false, error: error.message };
        }
    });

    // ============================================
    // EXPIRY REPORT
    // ============================================
    ipcMain.handle('report:expiry', async (event, filters) => {
        try {
            const result = await reportsService.getExpiryReport(filters);
            return result;
        } catch (error) {
            console.error('Error in report:expiry:', error);
            return { success: false, error: error.message };
        }
    });

    // ============================================
    // CUSTOMER LEDGER REPORT - FIXED ✅
    // ============================================
    ipcMain.handle('report:customer-ledger', async (event, filters) => {
        try {
            console.log('📊 [IPC] report:customer-ledger called with filters:', filters);
            const result = await reportsService.getCustomerLedgerReport(filters);
            console.log('📊 [IPC] report:customer-ledger result:', result.success ? 'success' : 'failed');
            return result;
        } catch (error) {
            console.error('Error in report:customer-ledger:', error);
            return { success: false, error: error.message };
        }
    });

    // ============================================
    // CUSTOMER LEDGER DETAILS - FIXED ✅
    // ============================================
    ipcMain.handle('report:customer-ledger-details', async (event, customerId, filters) => {
        try {
            console.log(`📊 [IPC] report:customer-ledger-details called for customer ${customerId}`);
            const result = await reportsService.getCustomerLedgerDetails(customerId, filters || {});
            return result;
        } catch (error) {
            console.error('Error in report:customer-ledger-details:', error);
            return { success: false, error: error.message };
        }
    });

    // ============================================
    // SUPPLIER LEDGER REPORT
    // ============================================
    ipcMain.handle('report:supplier-ledger', async (event, filters) => {
        try {
            const result = await reportsService.getSupplierLedgerReport(filters);
            return result;
        } catch (error) {
            console.error('Error in report:supplier-ledger:', error);
            return { success: false, error: error.message };
        }
    });

    // ============================================
    // SUPPLIER LEDGER DETAILS
    // ============================================
    ipcMain.handle('report:supplier-ledger-details', async (event, supplierId) => {
        try {
            const result = await reportsService.getSupplierLedgerDetails(supplierId);
            return result;
        } catch (error) {
            console.error('Error in report:supplier-ledger-details:', error);
            return { success: false, error: error.message };
        }
    });

    // ============================================
    // EXPENSE REPORT
    // ============================================
    ipcMain.handle('report:expenses', async (event, filters) => {
        try {
            const result = await reportsService.getExpenseReport(filters);
            return result;
        } catch (error) {
            console.error('Error in report:expenses:', error);
            return { success: false, error: error.message };
        }
    });

    // ============================================
    // WAREHOUSE REPORT
    // ============================================
    ipcMain.handle('report:warehouse', async (event, filters) => {
        try {
            const result = await reportsService.getWarehouseReport(filters);
            return result;
        } catch (error) {
            console.error('Error in report:warehouse:', error);
            return { success: false, error: error.message };
        }
    });

    console.log('✅ Reports IPC handlers registered');
}

module.exports = { setupReportsIpc };