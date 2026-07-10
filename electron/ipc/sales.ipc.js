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

    // ==================== PDF GENERATION ====================
   // electron/ipc/sales.ipc.js

// ==================== PDF GENERATION ====================
ipcMain.handle('sale:generatePDF', async (event, saleData, items) => {
    console.log('🟢 [SalesIPC] sale:generatePDF handler called');
    console.log('🟢 [SalesIPC] saleData:', JSON.stringify(saleData, null, 2));
    console.log('🟢 [SalesIPC] items count:', items?.length || 0);
    console.log('🟢 [SalesIPC] event.sender exists?', !!event.sender);
    
    try {
        // ✅ Get the window from the event
        let window = null;
        try {
            const { BrowserWindow } = require('electron');
            window = BrowserWindow.fromWebContents(event.sender);
            console.log('🟢 [SalesIPC] window obtained:', window ? 'yes' : 'no');
        } catch (err) {
            console.log('🟢 [SalesIPC] Could not get window:', err.message);
        }
        
        console.log('🟢 [SalesIPC] Calling salesService.generateAndSavePDF...');
        const result = await salesService.generateAndSavePDF(saleData, items, window);
        console.log('🟢 [SalesIPC] Result from service:', result);
        return result;
    } catch (error) {
        console.error('❌ [SalesIPC] PDF generation error:', error);
        console.error('❌ Error stack:', error.stack);
        return { success: false, error: error.message };
    }
});
}

module.exports = { registerSalesIPC };