// electron/repositories/product.repository.js

const db = require("../database/database");

class ProductRepository {
    // ==================== PRODUCT METHODS ====================
    getAll() {
        return db.prepare("SELECT * FROM products ORDER BY id DESC").all();
    }

    create(name, category_id, unit_id, purchase_price, sale_price, code = null, brand = null, barcode = null, description = null, stock_quantity = 0, reorder_level = 0) {
        const result = db
            .prepare(`INSERT INTO products 
                (name, category_id, unit_id, purchase_price, sale_price, code, brand, barcode, description, stock_quantity, reorder_level) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(name, category_id, unit_id, purchase_price, sale_price, code, brand, barcode, description, stock_quantity, reorder_level);
        
        return this.getById(result.lastInsertRowid);
    }

    update(id, updates) {
        const fields = [];
        const values = [];
        
        const allowedFields = [
            'name', 'category_id', 'unit_id', 'purchase_price', 'sale_price',
            'code', 'brand', 'barcode', 'description', 'stock_quantity', 
            'reorder_level', 'is_active'
        ];
        
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(updates[field]);
            }
        }
        
        if (fields.length === 0) {
            return this.getById(id);
        }
        
        fields.push("updated_at = CURRENT_TIMESTAMP");
        values.push(id);
        
        const result = db
            .prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`)
            .run(...values);
        
        if (result.changes === 0) {
            return null;
        }
        
        return this.getById(id);
    }

    delete(id) {
        return db.prepare("DELETE FROM products WHERE id = ?").run(id);
    }

    getById(id) {
        return db.prepare("SELECT * FROM products WHERE id = ?").get(id);
    }

    getByCode(code) {
        return db.prepare("SELECT * FROM products WHERE code = ?").get(code);
    }

    // ✅ ADD THIS MISSING METHOD
    getByBarcode(barcode) {
        return db.prepare("SELECT * FROM products WHERE barcode = ?").get(barcode);
    }

    search(query) {
        const searchTerm = `%${query}%`;
        return db
            .prepare(`SELECT * FROM products 
                WHERE name LIKE ? 
                OR code LIKE ? 
                OR brand LIKE ? 
                OR barcode LIKE ? 
                OR description LIKE ?
                ORDER BY name`)
            .all(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    getActive() {
        return db.prepare("SELECT * FROM products WHERE is_active = 1 ORDER BY name").all();
    }

    getLowStock(threshold = 10) {
        return db
            .prepare("SELECT * FROM products WHERE stock_quantity <= ? AND is_active = 1 ORDER BY stock_quantity ASC")
            .all(threshold);
    }

    getByCategory(category_id) {
        return db
            .prepare("SELECT * FROM products WHERE category_id = ? AND is_active = 1 ORDER BY name")
            .all(category_id);
    }

    getByUnit(unit_id) {
        return db
            .prepare("SELECT * FROM products WHERE unit_id = ? AND is_active = 1 ORDER BY name")
            .all(unit_id);
    }

    updateStock(id, quantity) {
        return db
            .prepare("UPDATE products SET stock_quantity = stock_quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
            .run(quantity, id);
    }

    toggleActive(id) {
        return db
            .prepare(`UPDATE products 
                SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END, 
                    updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?`)
            .run(id);
    }

    updateStockQuantity(productId) {
        try {
            const stmt = db.prepare(`
                SELECT COALESCE(SUM(quantity), 0) as total_stock
                FROM inventory
                WHERE product_id = ?
            `);
            const result = stmt.get(productId);
            const totalStock = result?.total_stock || 0;

            const updateStmt = db.prepare(`
                UPDATE products 
                SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `);
            return updateStmt.run(totalStock, productId);
        } catch (error) {
            console.error('Error updating product stock quantity:', error);
            throw error;
        }
    }

    getStockQuantity(productId) {
        const stmt = db.prepare(`
            SELECT stock_quantity FROM products WHERE id = ?
        `);
        const result = stmt.get(productId);
        return result?.stock_quantity || 0;
    }

    // ==================== CATEGORY METHODS ====================
    createCategory(name, description = null) {
        const result = db
            .prepare("INSERT INTO categories (name, description) VALUES (?, ?)")
            .run(name, description);
        
        return this.getCategoryById(result.lastInsertRowid);
    }

    getAllCategories() {
        return db.prepare("SELECT * FROM categories ORDER BY name").all();
    }

    getCategoryById(id) {
        return db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
    }

    updateCategory(id, updates) {
        const fields = [];
        const values = [];
        
        if (updates.name !== undefined) {
            fields.push("name = ?");
            values.push(updates.name);
        }
        if (updates.description !== undefined) {
            fields.push("description = ?");
            values.push(updates.description);
        }
        
        if (fields.length === 0) {
            return { changes: 0 };
        }
        
        fields.push("updated_at = CURRENT_TIMESTAMP");
        values.push(id);
        
        const result = db
            .prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`)
            .run(...values);
            
        if (result.changes === 0) return null;
        return this.getCategoryById(id);
    }

    deleteCategory(id) {
        const count = db.prepare("SELECT COUNT(*) as count FROM products WHERE category_id = ?").get(id);
        if (count.count > 0) {
            throw new Error('Cannot delete category with existing products');
        }
        return db.prepare("DELETE FROM categories WHERE id = ?").run(id);
    }

    getCategoryProductCount(category_id) {
        return db
            .prepare("SELECT COUNT(*) as count FROM products WHERE category_id = ?")
            .get(category_id);
    }

    // ==================== UNIT METHODS ====================
    createUnit(name, abbreviation = null) {
        const result = db
            .prepare("INSERT INTO units (name, abbreviation) VALUES (?, ?)")
            .run(name, abbreviation);
        
        return this.getUnitById(result.lastInsertRowid);
    }

    getAllUnits() {
        return db.prepare("SELECT * FROM units ORDER BY name").all();
    }

    getUnitById(id) {
        return db.prepare("SELECT * FROM units WHERE id = ?").get(id);
    }

    updateUnit(id, updates) {
        const fields = [];
        const values = [];
        
        if (updates.name !== undefined) {
            fields.push("name = ?");
            values.push(updates.name);
        }
        if (updates.abbreviation !== undefined) {
            fields.push("abbreviation = ?");
            values.push(updates.abbreviation);
        }
        
        if (fields.length === 0) {
            return { changes: 0 };
        }
        
        fields.push("updated_at = CURRENT_TIMESTAMP");
        values.push(id);
        
        const result = db
            .prepare(`UPDATE units SET ${fields.join(', ')} WHERE id = ?`)
            .run(...values);
            
        if (result.changes === 0) return null;
        return this.getUnitById(id);
    }

    deleteUnit(id) {
        const count = db.prepare("SELECT COUNT(*) as count FROM products WHERE unit_id = ?").get(id);
        if (count.count > 0) {
            throw new Error('Cannot delete unit with existing products');
        }
        return db.prepare("DELETE FROM units WHERE id = ?").run(id);
    }

    // ==================== EXPORT ====================
    exportData(filters = {}) {
        let query = `
            SELECT p.id, p.code, p.name, p.brand, 
                   c.name as category, 
                   u.name as unit, u.abbreviation as unit_abbr,
                   p.purchase_price, p.sale_price, p.stock_quantity, 
                   p.reorder_level, p.barcode, p.is_active,
                   p.created_at, p.updated_at
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN units u ON p.unit_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.is_active !== undefined) {
            query += ' AND p.is_active = ?';
            params.push(filters.is_active);
        }

        if (filters.category_id) {
            query += ' AND p.category_id = ?';
            params.push(filters.category_id);
        }

        query += ' ORDER BY p.name ASC';

        const stmt = db.prepare(query);
        return stmt.all(...params);
    }

    getStats() {
        const stmt = db.prepare(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive,
                COUNT(DISTINCT category_id) as total_categories,
                COUNT(DISTINCT unit_id) as total_units,
                COALESCE(SUM(stock_quantity * purchase_price), 0) as total_inventory_value,
                COALESCE(SUM(stock_quantity), 0) as total_stock_quantity
            FROM products
        `);
        return stmt.get();
    }
}

module.exports = new ProductRepository();