// electron/ipc/productReturn.ipc.js
const { ipcMain } = require("electron");
const ProductReturnService = require("../services/ProductReturn.service");
const returnService = new ProductReturnService();

function setupProductReturnIpc() {
    console.log('🔧 Setting up Product Return IPC handlers...');

    // Create return
    ipcMain.handle("return:create", async (event, data) => {
        try {
            console.log('📥 IPC: return:create called with data:', data);
            const result = await returnService.createReturn(data);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in return:create:', error);
            return { 
                error: true, 
                message: error.message || "Failed to create return" 
            };
        }
    });

    // Get return by ID
    ipcMain.handle("return:getById", async (event, id) => {
        try {
            console.log('📥 IPC: return:getById called for id:', id);
            const result = returnService.getReturnById(id);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in return:getById:', error);
            return { 
                error: true, 
                message: error.message || "Failed to get return" 
            };
        }
    });

    // Get return by number
    ipcMain.handle("return:getByNumber", async (event, returnNumber) => {
        try {
            console.log('📥 IPC: return:getByNumber called:', returnNumber);
            const result = returnService.getReturnByNumber(returnNumber);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in return:getByNumber:', error);
            return { 
                error: true, 
                message: error.message || "Failed to get return" 
            };
        }
    });

    // Get all returns
    ipcMain.handle("return:getAll", async (event, filters) => {
        try {
            console.log('📥 IPC: return:getAll called with filters:', filters);
            const result = returnService.getAllReturns(filters || {});
            return result;
        } catch (error) {
            console.error('❌ IPC Error in return:getAll:', error);
            return { 
                error: true, 
                message: error.message || "Failed to get returns" 
            };
        }
    });

    // Update return
    ipcMain.handle("return:update", async (event, id, data) => {
        try {
            console.log('📥 IPC: return:update called for id:', id);
            const result = returnService.updateReturn(id, data);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in return:update:', error);
            return { 
                error: true, 
                message: error.message || "Failed to update return" 
            };
        }
    });

    // Update return status
    ipcMain.handle("return:updateStatus", async (event, id, status) => {
        try {
            console.log('📥 IPC: return:updateStatus called:', { id, status });
            const result = returnService.updateReturnStatus(id, status);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in return:updateStatus:', error);
            return { 
                error: true, 
                message: error.message || "Failed to update return status" 
            };
        }
    });

    // Delete return
    ipcMain.handle("return:delete", async (event, id) => {
        try {
            console.log('📥 IPC: return:delete called for id:', id);
            const result = returnService.deleteReturn(id);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in return:delete:', error);
            return { 
                error: true, 
                message: error.message || "Failed to delete return" 
            };
        }
    });

    // Get returns by customer
    ipcMain.handle("return:getByCustomer", async (event, customerId) => {
        try {
            console.log('📥 IPC: return:getByCustomer called:', customerId);
            const result = returnService.getCustomerReturns(customerId);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in return:getByCustomer:', error);
            return { 
                error: true, 
                message: error.message || "Failed to get customer returns" 
            };
        }
    });

    // Get return summary
    ipcMain.handle("return:getSummary", async () => {
        try {
            console.log('📥 IPC: return:getSummary called');
            const result = returnService.getReturnSummary();
            return result;
        } catch (error) {
            console.error('❌ IPC Error in return:getSummary:', error);
            return { 
                error: true, 
                message: error.message || "Failed to get return summary" 
            };
        }
    });

    // Get top returned products
    ipcMain.handle("return:getTopProducts", async (event, limit) => {
        try {
            console.log('📥 IPC: return:getTopProducts called');
            const result = returnService.getTopReturnedProducts(limit || 10);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in return:getTopProducts:', error);
            return { 
                error: true, 
                message: error.message || "Failed to get top returned products" 
            };
        }
    });

    // Process return
    ipcMain.handle("return:process", async (event, id) => {
        try {
            console.log('📥 IPC: return:process called for id:', id);
            const result = await returnService.processReturn(id);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in return:process:', error);
            return { 
                error: true, 
                message: error.message || "Failed to process return" 
            };
        }
    });

    // Check if sale can be returned
    ipcMain.handle("return:canReturn", async (event, saleId) => {
        try {
            const result = ProductReturnRepository.canReturn(saleId);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in return:canReturn:', error);
            return { 
                allowed: false, 
                reason: error.message || "Failed to check return eligibility" 
            };
        }
    });

    console.log('✅ Product Return IPC handlers registered');
}

module.exports = { setupProductReturnIpc };