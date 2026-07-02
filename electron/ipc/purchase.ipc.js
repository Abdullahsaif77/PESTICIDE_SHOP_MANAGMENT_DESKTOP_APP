// electron/ipc/purchase.ipc.js

const { ipcMain } = require('electron');
const purchaseService = require('../services/purchase.service');

function registerPurchaseIPC() {
    console.log("Setting up Purchase IPC handlers...");

    // ==================== CREATE ====================
    ipcMain.handle('purchase:create', async (event, data) => {
        try {
            console.log('📦 Creating purchase with data:', JSON.stringify({
                supplier_id: data.supplier_id,
                warehouse_id: data.warehouse_id,
                items_count: data.items?.length,
                total: data.items?.reduce((sum, i) => sum + (i.quantity * i.purchase_price), 0)
            }));
            
            const result = await purchaseService.createPurchase(data);
            console.log('✅ Purchase created:', result.success ? 'Success' : 'Failed');
            return result;
        } catch (error) {
            console.error('❌ Purchase creation error:', error);
            return { success: false, error: error.message };
        }
    });

    // ==================== READ ====================
    ipcMain.handle('purchase:getAll', async (event, filters) => {
        try {
            console.log('📋 Getting all purchases with filters:', filters);
            const result = await purchaseService.getAllPurchases(filters);
            return result;
        } catch (error) {
            console.error('Error getting purchases:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('purchase:getById', async (event, id) => {
        try {
            console.log(`📋 Getting purchase by ID: ${id}`);
            const result = await purchaseService.getPurchaseById(id);
            return result;
        } catch (error) {
            console.error('Error getting purchase by ID:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('purchase:getByNumber', async (event, number) => {
        try {
            console.log(`📋 Getting purchase by number: ${number}`);
            const result = await purchaseService.getPurchaseByNumber(number);
            return result;
        } catch (error) {
            console.error('Error getting purchase by number:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('purchase:getBySupplier', async (event, supplierId) => {
        try {
            console.log(`📋 Getting purchases for supplier: ${supplierId}`);
            const result = await purchaseService.getSupplierPurchases(supplierId);
            return result;
        } catch (error) {
            console.error('Error getting supplier purchases:', error);
            return { success: false, error: error.message };
        }
    });

    // ==================== UPDATE ====================
    ipcMain.handle('purchase:update', async (event, id, data) => {
        try {
            console.log(`✏️ Updating purchase: ${id}`);
            const result = await purchaseService.updatePurchase(id, data);
            return result;
        } catch (error) {
            console.error('Error updating purchase:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('purchase:updateStatus', async (event, id, status) => {
        try {
            console.log(`📊 Updating purchase status: ${id} → ${status}`);
            const result = await purchaseService.updatePurchaseStatus(id, status);
            return result;
        } catch (error) {
            console.error('Error updating purchase status:', error);
            return { success: false, error: error.message };
        }
    });

    // ==================== DELETE ====================
    ipcMain.handle('purchase:delete', async (event, id) => {
        try {
            console.log(`🗑️ Deleting purchase: ${id}`);
            const result = await purchaseService.deletePurchase(id);
            return result;
        } catch (error) {
            console.error('Error deleting purchase:', error);
            return { success: false, error: error.message };
        }
    });

    // ==================== STATS ====================
    ipcMain.handle('purchase:getStats', async (event, filters) => {
        try {
            console.log('📊 Getting purchase stats with filters:', filters);
            const result = await purchaseService.getPurchaseStats(filters);
            return result;
        } catch (error) {
            console.error('Error getting purchase stats:', error);
            return { success: false, error: error.message };
        }
    });

    // ==================== GENERATE NUMBER ====================
    ipcMain.handle('purchase:generateNumber', async () => {
        try {
            console.log('🔢 Generating purchase number');
            const result = await purchaseService.generatePurchaseNumber();
            return result;
        } catch (error) {
            console.error('Error generating purchase number:', error);
            return { success: false, error: error.message };
        }
    });

    // ==================== GET WAREHOUSE INVENTORY ====================
    ipcMain.handle('purchase:getWarehouseInventory', async (event, warehouseId) => {
        try {
            console.log(`🏢 Getting warehouse inventory for warehouse: ${warehouseId}`);
            const result = purchaseService.getWarehouseInventory(warehouseId);
            return result;
        } catch (error) {
            console.error('Error getting warehouse inventory:', error);
            return { success: false, error: error.message, data: [] };
        }
    });

    console.log("✅ Purchase IPC handlers registered successfully");
}

module.exports = { registerPurchaseIPC };