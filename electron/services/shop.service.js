// electron/services/shop.service.js
const ShopRepository = require("../repositories/shop.repository");
const shopRepository = new ShopRepository();

class ShopService {
    getShop() {
        try {
            console.log('🔍 Getting shop...');
            const shop = shopRepository.get();

            if (!shop) {
                console.log('⚠️ No shop found, creating default...');
                // Create default shop
                this.createShop({
                    shop_name: 'My Shop',
                    address: '123 Main St',
                    phone: '555-0123',
                    email: 'shop@example.com',
                    license_number: 'LIC-001',
                    gst_number: 'GST-001',
                    currency: 'USD'
                });
                
                // Fetch the newly created shop
                const newShop = shopRepository.get();
                if (!newShop) {
                    throw new Error("Failed to create shop");
                }
                return newShop;
            }

            return shop;
        } catch (error) {
            console.error('❌ Error in getShop:', error);
            throw new Error(`Failed to get shop: ${error.message}`);
        }
    }

    createShop(data) {
        try {
            console.log('🔄 Creating shop with data:', data);
            const result = shopRepository.createDefault(data);

            if (!result || result.changes === 0) {
                // Check if shop already exists
                const existing = shopRepository.get();
                if (existing) {
                    throw new Error("Shop already exists");
                }
                throw new Error("Failed to create shop");
            }

            console.log('✅ Shop created successfully');
            return { success: true, data: result };
        } catch (error) {
            console.error('❌ Error in createShop:', error);
            throw error;
        }
    }

    updateShop(data) {
        try {
            console.log('🔄 Updating shop with data:', data);
            
            // Check if shop exists first
            const existing = shopRepository.get();
            if (!existing) {
                throw new Error("Shop not found. Please create shop first.");
            }

            const result = shopRepository.update(data);

            if (!result || result.changes === 0) {
                throw new Error("Failed to update shop info");
            }

            console.log('✅ Shop updated successfully');
            return { success: true, data: result };
        } catch (error) {
            console.error('❌ Error in updateShop:', error);
            throw error;
        }
    }

    // Helper method to check if shop exists
    shopExists() {
        try {
            const shop = shopRepository.get();
            return shop !== null && shop !== undefined;
        } catch (error) {
            console.error('❌ Error checking shop existence:', error);
            return false;
        }
    }
}

module.exports = ShopService;