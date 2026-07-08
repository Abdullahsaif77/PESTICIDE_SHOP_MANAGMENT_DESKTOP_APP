// electron/ipc/reports.ipc.js
const { ipcMain } = require("electron");
const ReportsService = require("../services/reports.service");
const reportsService = new ReportsService();

function setupReportsIpc() {
    console.log('🔧 Setting up Reports IPC handlers...');

    // Sales Report
    ipcMain.handle("report:sales", async (event, filters) => {
        try {
            console.log('📥 IPC: report:sales called with filters:', filters);
            const result = await reportsService.getSalesReport(filters);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in report:sales:', error);
            return { success: false, error: error.message };
        }
    });

    // Purchase Report
    ipcMain.handle("report:purchases", async (event, filters) => {
        try {
            console.log('📥 IPC: report:purchases called with filters:', filters);
            const result = await reportsService.getPurchaseReport(filters);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in report:purchases:', error);
            return { success: false, error: error.message };
        }
    });

    // Profit & Loss Report
    ipcMain.handle("report:profit-loss", async (event, filters) => {
        try {
            console.log('📥 IPC: report:profit-loss called with filters:', filters);
            const result = await reportsService.getProfitLossReport(filters);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in report:profit-loss:', error);
            return { success: false, error: error.message };
        }
    });

    // Inventory Report
    ipcMain.handle("report:inventory", async (event, filters) => {
        try {
            console.log('📥 IPC: report:inventory called with filters:', filters);
            const result = await reportsService.getInventoryReport(filters);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in report:inventory:', error);
            return { success: false, error: error.message };
        }
    });

    // Low Stock Report
    ipcMain.handle("report:low-stock", async (event, filters) => {
        try {
            console.log('📥 IPC: report:low-stock called with filters:', filters);
            const result = await reportsService.getLowStockReport(filters);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in report:low-stock:', error);
            return { success: false, error: error.message };
        }
    });

    // Expiry Report
    ipcMain.handle("report:expiry", async (event, filters) => {
        try {
            console.log('📥 IPC: report:expiry called with filters:', filters);
            const result = await reportsService.getExpiryReport(filters);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in report:expiry:', error);
            return { success: false, error: error.message };
        }
    });

    // Customer Ledger Report
    ipcMain.handle("report:customer-ledger", async (event, filters) => {
        try {
            console.log('📥 IPC: report:customer-ledger called with filters:', filters);
            const result = await reportsService.getCustomerLedgerReport(filters);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in report:customer-ledger:', error);
            return { success: false, error: error.message };
        }
    });

    // Customer Ledger Details
    ipcMain.handle("report:customer-ledger-details", async (event, customerId) => {
        try {
            console.log('📥 IPC: report:customer-ledger-details called for customer:', customerId);
            const result = await reportsService.getCustomerLedgerDetails(customerId);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in report:customer-ledger-details:', error);
            return { success: false, error: error.message };
        }
    });

    // Supplier Ledger Report
    ipcMain.handle("report:supplier-ledger", async (event, filters) => {
        try {
            console.log('📥 IPC: report:supplier-ledger called with filters:', filters);
            const result = await reportsService.getSupplierLedgerReport(filters);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in report:supplier-ledger:', error);
            return { success: false, error: error.message };
        }
    });

    // Supplier Ledger Details
    ipcMain.handle("report:supplier-ledger-details", async (event, supplierId) => {
        try {
            console.log('📥 IPC: report:supplier-ledger-details called for supplier:', supplierId);
            const result = await reportsService.getSupplierLedgerDetails(supplierId);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in report:supplier-ledger-details:', error);
            return { success: false, error: error.message };
        }
    });

    // Expense Report
    ipcMain.handle("report:expenses", async (event, filters) => {
        try {
            console.log('📥 IPC: report:expenses called with filters:', filters);
            const result = await reportsService.getExpenseReport(filters);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in report:expenses:', error);
            return { success: false, error: error.message };
        }
    });

    // Warehouse Report
    ipcMain.handle("report:warehouse", async (event, filters) => {
        try {
            console.log('📥 IPC: report:warehouse called with filters:', filters);
            const result = await reportsService.getWarehouseReport(filters);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in report:warehouse:', error);
            return { success: false, error: error.message };
        }
    });

    console.log('✅ Reports IPC handlers registered');
}

module.exports = { setupReportsIpc };