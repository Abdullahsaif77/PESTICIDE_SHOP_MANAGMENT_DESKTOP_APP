const db = require("../database/database")

class ProductRepository {
    // ==================== PRODUCT METHODS ====================
    getAll() {
        return db.prepare("SELECT * FROM products ORDER BY id DESC").all()
    }

    create(name, category_id, unit_id, purchase_price, sale_price, code = null, brand = null, barcode = null, description = null, stock_quantity = 0, reorder_level = 0) {
    const result = db
        .prepare(`INSERT INTO products 
            (name, category_id, unit_id, purchase_price, sale_price, code, brand, barcode, description, stock_quantity, reorder_level) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(name, category_id, unit_id, purchase_price, sale_price, code, brand, barcode, description, stock_quantity, reorder_level);
    
    // Return the created product with all data
    return this.getById(result.lastInsertRowid);
}

    // electron/repositories/product.repository.js

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
        return this.getById(id);  // Return existing product if no fields to update
    }
    
    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);
    
    const result = db
        .prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`)
        .run(...values);
    
    if (result.changes === 0) {
        return null;
    }
    
    // Return the updated product
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
        // Check if category has products
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
        // Check if unit is used in products
        const count = db.prepare("SELECT COUNT(*) as count FROM products WHERE unit_id = ?").get(id);
        if (count.count > 0) {
            throw new Error('Cannot delete unit with existing products');
        }
        return db.prepare("DELETE FROM units WHERE id = ?").run(id);
    }
}

module.exports = new ProductRepository()