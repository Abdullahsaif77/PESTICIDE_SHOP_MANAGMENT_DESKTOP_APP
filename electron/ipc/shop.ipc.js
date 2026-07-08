// electron/ipc/shop.ipc.js
const { ipcMain } = require("electron");
const ShopService = require("../services/shop.service");
const shopService = new ShopService();

function setupShopIpc() {
    console.log('🔧 Setting up Shop IPC handlers...');

    // Get shop
    ipcMain.handle("shop:get", async () => {
        try {
            console.log('📥 IPC: shop:get called');
            const result = shopService.getShop();
            console.log('📤 IPC: shop:get returning:', result);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in shop:get:', error);
            // Return error object instead of throwing
            return { 
                error: true, 
                message: error.message || "Failed to get shop" 
            };
        }
    });

    // Create shop
    ipcMain.handle("shop:create", async (event, data) => {
        try {
            console.log('📥 IPC: shop:create called with data:', data);
            const result = shopService.createShop(data);
            console.log('📤 IPC: shop:create returning:', result);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in shop:create:', error);
            return { 
                error: true, 
                message: error.message || "Failed to create shop" 
            };
        }
    });

    // Update shop
    ipcMain.handle("shop:update", async (event, data) => {
        try {
            console.log('📥 IPC: shop:update called with data:', data);
            const result = shopService.updateShop(data);
            console.log('📤 IPC: shop:update returning:', result);
            return result;
        } catch (error) {
            console.error('❌ IPC Error in shop:update:', error);
            return { 
                error: true, 
                message: error.message || "Failed to update shop" 
            };
        }
    });

    // Check if shop exists
    ipcMain.handle("shop:exists", async () => {
        try {
            const exists = shopService.shopExists();
            return { exists };
        } catch (error) {
            console.error('❌ IPC Error in shop:exists:', error);
            return { exists: false, error: error.message };
        }
    });

    console.log('✅ Shop IPC handlers registered');
}

module.exports = { setupShopIpc };