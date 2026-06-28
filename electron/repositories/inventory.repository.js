const db = require("../database/database")

class InventoryRepository {
    create(data) {
        const stmt = db.prepare(`
            INSERT INTO inventory (
                product_id,
                warehouse_id,
                batch_id,
                quantity,
                reserved_quantity,
                min_stock,
                max_stock
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        return stmt.run(
            data.product_id,
            data.warehouse_id,
            data.batch_id || null,
            data.quantity || 0,
            data.reserved_quantity || 0,
            data.min_stock || 0,
            data.max_stock || 0
        );
    }

    getById(id) {
        const stmt = db.prepare(`
            SELECT * FROM inventory WHERE id = ?
        `);
        return stmt.get(id);
    }

    getByProduct(productId) {
        const stmt = db.prepare(`
            SELECT i.*, w.name as warehouse_name, b.batch_number 
            FROM inventory i
            LEFT JOIN warehouses w ON i.warehouse_id = w.id
            LEFT JOIN batches b ON i.batch_id = b.id
            WHERE i.product_id = ?
            ORDER BY w.name ASC
        `);
        return stmt.all(productId);
    }

    getByWarehouse(warehouseId) {
        const stmt = db.prepare(`
            SELECT i.*, p.name as product_name, p.code as product_code, b.batch_number
            FROM inventory i
            LEFT JOIN products p ON i.product_id = p.id
            LEFT JOIN batches b ON i.batch_id = b.id
            WHERE i.warehouse_id = ?
            ORDER BY p.name ASC
        `);
        return stmt.all(warehouseId);
    }

    getByProductAndWarehouse(productId, warehouseId) {
        const stmt = db.prepare(`
            SELECT i.*, b.batch_number, b.expiry_date
            FROM inventory i
            LEFT JOIN batches b ON i.batch_id = b.id
            WHERE i.product_id = ? AND i.warehouse_id = ?
        `);
        return stmt.all(productId, warehouseId);
    }

    getByBatch(batchId) {
        const stmt = db.prepare(`
            SELECT i.*, p.name as product_name, w.name as warehouse_name
            FROM inventory i
            LEFT JOIN products p ON i.product_id = p.id
            LEFT JOIN warehouses w ON i.warehouse_id = w.id
            WHERE i.batch_id = ?
        `);
        return stmt.all(batchId);
    }

    update(id, data) {
        const updates = [];
        const params = [];

        if (data.quantity !== undefined) {
            updates.push('quantity = ?');
            params.push(data.quantity);
        }
        if (data.reserved_quantity !== undefined) {
            updates.push('reserved_quantity = ?');
            params.push(data.reserved_quantity);
        }
        if (data.min_stock !== undefined) {
            updates.push('min_stock = ?');
            params.push(data.min_stock);
        }
        if (data.max_stock !== undefined) {
            updates.push('max_stock = ?');
            params.push(data.max_stock);
        }
        if (data.batch_id !== undefined) {
            updates.push('batch_id = ?');
            params.push(data.batch_id);
        }

        if (updates.length === 0) {
            return { success: false, error: 'No fields to update' };
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        updates.push('last_updated = CURRENT_TIMESTAMP');
        params.push(id);

        const stmt = db.prepare(`
            UPDATE inventory SET ${updates.join(', ')} WHERE id = ?
        `);
        return stmt.run(...params);
    }

    updateQuantity(id, quantity) {
        const stmt = db.prepare(`
            UPDATE inventory 
            SET quantity = ?, 
                updated_at = CURRENT_TIMESTAMP,
                last_updated = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        return stmt.run(quantity, id);
    }

    reserveStock(id, quantity) {
        const stmt = db.prepare(`
            UPDATE inventory 
            SET reserved_quantity = reserved_quantity + ?,
                updated_at = CURRENT_TIMESTAMP,
                last_updated = CURRENT_TIMESTAMP
            WHERE id = ? AND (quantity - reserved_quantity) >= ?
        `);
        return stmt.run(quantity, id, quantity);
    }

    releaseReservedStock(id, quantity) {
        const stmt = db.prepare(`
            UPDATE inventory 
            SET reserved_quantity = reserved_quantity - ?
            WHERE id = ? AND reserved_quantity >= ?
        `);
        return stmt.run(quantity, id, quantity);
    }

    getLowStock() {
        const stmt = db.prepare(`
            SELECT 
                i.*,
                p.name as product_name,
                p.code as product_code,
                p.reorder_level,
                w.name as warehouse_name,
                (i.quantity - i.reserved_quantity) as available_stock
            FROM inventory i
            LEFT JOIN products p ON i.product_id = p.id
            LEFT JOIN warehouses w ON i.warehouse_id = w.id
            WHERE (i.quantity - i.reserved_quantity) <= p.reorder_level
            AND p.reorder_level > 0
            AND i.quantity > 0
            ORDER BY available_stock ASC
        `);
        return stmt.all();
    }

    getStockSummary() {
        const stmt = db.prepare(`
            SELECT 
                COUNT(DISTINCT product_id) as total_products,
                SUM(quantity) as total_quantity,
                SUM(reserved_quantity) as total_reserved,
                SUM(quantity - reserved_quantity) as total_available,
                COUNT(DISTINCT warehouse_id) as total_warehouses,
                COUNT(CASE WHEN quantity <= min_stock AND min_stock > 0 THEN 1 END) as low_stock_items
            FROM inventory
            WHERE quantity > 0
        `);
        return stmt.get();
    }

    getWarehouseStockSummary(warehouseId) {
        const stmt = db.prepare(`
            SELECT 
                w.name as warehouse_name,
                COUNT(DISTINCT i.product_id) as total_products,
                SUM(i.quantity) as total_quantity,
                SUM(i.reserved_quantity) as total_reserved,
                SUM(i.quantity - i.reserved_quantity) as total_available,
                COUNT(CASE WHEN i.quantity <= i.min_stock AND i.min_stock > 0 THEN 1 END) as low_stock_items
            FROM inventory i
            LEFT JOIN warehouses w ON i.warehouse_id = w.id
            WHERE i.warehouse_id = ?
            GROUP BY i.warehouse_id
        `);
        return stmt.get(warehouseId);
    }

    // Additional helper method to get available quantity
    getAvailableQuantity(productId, warehouseId) {
        const stmt = db.prepare(`
            SELECT 
                SUM(quantity - reserved_quantity) as available_quantity
            FROM inventory
            WHERE product_id = ? AND warehouse_id = ?
        `);
        const result = stmt.get(productId, warehouseId);
        return result ? result.available_quantity || 0 : 0;
    }

    // Get inventory with product details for a specific warehouse
    getDetailedWarehouseInventory(warehouseId) {
        const stmt = db.prepare(`
            SELECT 
                i.*,
                p.name as product_name,
                p.code as product_code,
                p.sale_price,
                p.purchase_price,
                b.batch_number,
                b.expiry_date,
                (i.quantity - i.reserved_quantity) as available_quantity
            FROM inventory i
            LEFT JOIN products p ON i.product_id = p.id
            LEFT JOIN batches b ON i.batch_id = b.id
            WHERE i.warehouse_id = ?
            AND i.quantity > 0
            ORDER BY p.name ASC
        `);
        return stmt.all(warehouseId);
    }
}

module.exports = new InventoryRepository();