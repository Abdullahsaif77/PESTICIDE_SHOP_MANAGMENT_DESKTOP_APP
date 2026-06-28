const db = require("../database/database")

class BatchRepository {
    create(data) {
        const stmt = db.prepare(`
            INSERT INTO batches (
                product_id, 
                batch_number, 
                purchase_price, 
                sale_price, 
                quantity, 
                expiry_date, 
                is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        return stmt.run(
            data.product_id,
            data.batch_number,
            data.purchase_price || 0,
            data.sale_price || 0,
            data.quantity,
            data.expiry_date || null,
            data.is_active !== undefined ? data.is_active : 1
        );
    }

    getById(id) {
        const stmt = db.prepare(`
            SELECT * FROM batches WHERE id = ?
        `);
        return stmt.get(id);
    }

    getByProductId(productId) {
        const stmt = db.prepare(`
            SELECT * FROM batches 
            WHERE product_id = ? 
            ORDER BY created_at DESC
        `);
        return stmt.all(productId);
    }

    getActiveByProductId(productId) {
        const stmt = db.prepare(`
            SELECT * FROM batches 
            WHERE product_id = ? AND is_active = 1 
            ORDER BY created_at DESC
        `);
        return stmt.all(productId);
    }

    update(id, data) {
        const updates = [];
        const params = [];

        if (data.batch_number !== undefined) {
            updates.push('batch_number = ?');
            params.push(data.batch_number);
        }
        if (data.purchase_price !== undefined) {
            updates.push('purchase_price = ?');
            params.push(data.purchase_price);
        }
        if (data.sale_price !== undefined) {
            updates.push('sale_price = ?');
            params.push(data.sale_price);
        }
        if (data.quantity !== undefined) {
            updates.push('quantity = ?');
            params.push(data.quantity);
        }
        if (data.expiry_date !== undefined) {
            updates.push('expiry_date = ?');
            params.push(data.expiry_date);
        }
        if (data.is_active !== undefined) {
            updates.push('is_active = ?');
            params.push(data.is_active);
        }

        if (updates.length === 0) {
            return { success: false, error: 'No fields to update' };
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        const stmt = db.prepare(`
            UPDATE batches SET ${updates.join(', ')} WHERE id = ?
        `);
        return stmt.run(...params);
    }

    delete(id) {
        const stmt = db.prepare(`
            UPDATE batches 
            SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `);
        return stmt.run(id);
    }

    getExpiringBatches(days) {
        const stmt = db.prepare(`
            SELECT * FROM batches 
            WHERE expiry_date IS NOT NULL 
            AND expiry_date <= date('now', '+' || ? || ' days')
            AND is_active = 1
            ORDER BY expiry_date ASC
        `);
        return stmt.all(days);
    }

    getExpiredBatches() {
        const stmt = db.prepare(`
            SELECT * FROM batches 
            WHERE expiry_date IS NOT NULL 
            AND expiry_date < date('now')
            AND is_active = 1
            ORDER BY expiry_date ASC
        `);
        return stmt.all();
    }

    updateQuantity(id, quantity) {
        const stmt = db.prepare(`
            UPDATE batches 
            SET quantity = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `);
        return stmt.run(quantity, id);
    }

    getBatchByNumber(batchNumber) {
        const stmt = db.prepare(`
            SELECT * FROM batches WHERE batch_number = ?
        `);
        return stmt.get(batchNumber);
    }
}

module.exports = new BatchRepository();