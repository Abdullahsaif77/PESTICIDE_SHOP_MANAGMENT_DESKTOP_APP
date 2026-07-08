// electron/repositories/shop.repository.js
const db = require("../database/database");

class ShopRepository {
    get() {
        try {
            const shop = db.prepare("SELECT * FROM shop_settings WHERE id = 1").get();
            console.log('📊 Shop fetched:', shop || 'No shop found');
            return shop;
        } catch (error) {
            console.error('❌ Error fetching shop:', error);
            return null;
        }
    }

    createDefault(data) {
        try {
            const stmt = db.prepare(`
                INSERT OR IGNORE INTO shop_settings 
                (id, shop_name, address, phone, email, license_number, gst_number, currency)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            const result = stmt.run(
                1,
                data.shop_name || 'My Shop',
                data.address || '',
                data.phone || '',
                data.email || '',
                data.license_number || '',
                data.gst_number || '',
                data.currency || 'USD'
            );
            
            console.log('✅ Shop created:', result);
            return result;
        } catch (error) {
            console.error('❌ Error creating shop:', error);
            throw error;
        }
    }

    update(data) {
        try {
            const stmt = db.prepare(`
                UPDATE shop_settings
                SET shop_name = ?,
                    address = ?,
                    phone = ?,
                    email = ?,
                    license_number = ?,
                    gst_number = ?,
                    currency = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = 1
            `);
            
            const result = stmt.run(
                data.shop_name,
                data.address,
                data.phone,
                data.email,
                data.license_number,
                data.gst_number,
                data.currency
            );
            
            console.log('✅ Shop updated:', result);
            return result;
        } catch (error) {
            console.error('❌ Error updating shop:', error);
            throw error;
        }
    }

    // Additional helper method
    getOrCreate() {
        let shop = this.get();
        if (!shop) {
            console.log('⚠️ No shop found, creating default...');
            this.createDefault({
                shop_name: 'My Shop',
                address: '123 Main St',
                phone: '555-0123',
                email: 'shop@example.com',
                license_number: 'LIC-001',
                gst_number: 'GST-001',
                currency: 'USD'
            });
            shop = this.get();
        }
        return shop;
    }
}

module.exports = ShopRepository;