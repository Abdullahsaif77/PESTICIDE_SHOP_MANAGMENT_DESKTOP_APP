const db = require("../database/database")

class ProductRepository {
    getAll() {
        return db.prepare("SELECT * FROM products ORDER BY id DESC").all()
    }

    create(name, category_id, unit_id, purchase_price, sale_price, code = null, brand = null, barcode = null, description = null, stock_quantity = 0, reorder_level = 0) {
        return db
            .prepare(`INSERT INTO products 
                (name, category_id, unit_id, purchase_price, sale_price, code, brand, barcode, description, stock_quantity, reorder_level) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(name, category_id, unit_id, purchase_price, sale_price, code, brand, barcode, description, stock_quantity, reorder_level);
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
            return { changes: 0 };
        }
        
        fields.push("updated_at = CURRENT_TIMESTAMP");
        values.push(id);
        
        return db
            .prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`)
            .run(...values);
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

    // --- CATEGORY METHODS ---
    createCategory(name) {
        return db
            .prepare("INSERT INTO categories (name) VALUES (?)")
            .run(name, description);
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
        
        if (fields.length === 0) {
            return { changes: 0 };
        }
        
        fields.push("updated_at = CURRENT_TIMESTAMP");
        values.push(id);
        
        return db
            .prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`)
            .run(...values);
    }

    deleteCategory(id) {
        return db.prepare("DELETE FROM categories WHERE id = ?").run(id);
    }

    getCategoryProductCount(category_id) {
        return db
            .prepare("SELECT COUNT(*) as count FROM products WHERE category_id = ?")
            .get(category_id);
    }

    // --- UNIT METHODS ---
    createUnit(name,) {
        return db
            .prepare("INSERT INTO units (name) VALUES (?)")
            .run(name);
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
        if (fields.length === 0) {
            return { changes: 0 };
        }
        
        values.push(id);
        
        return db
            .prepare(`UPDATE units SET ${fields.join(', ')} WHERE id = ?`)
            .run(...values);
    }

    deleteUnit(id) {
        return db.prepare("DELETE FROM units WHERE id = ?").run(id);
    }
}

module.exports = new ProductRepository()