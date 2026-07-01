const db = require('../database/database');

class PurchaseRepository {
    // ==================== CREATE ====================
    create(data) {
        const {
            purchase_number,
            supplier_id,
            warehouse_id,
            total_amount,
            discount = 0,
            tax = 0,
            paid_amount = 0,
            due_amount = 0,
            status = 'pending',
            payment_method = null,
            purchase_date = null,
            notes = null,
            created_by = null
        } = data;

        const stmt = db.prepare(`
            INSERT INTO purchases (
                purchase_number, supplier_id, warehouse_id, total_amount,
                discount, tax, paid_amount, due_amount, status,
                payment_method, purchase_date, notes, created_by,
                created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);

        const result = stmt.run(
            purchase_number,
            supplier_id,
            warehouse_id,
            total_amount,
            discount,
            tax,
            paid_amount,
            due_amount,
            status,
            payment_method,
            purchase_date || new Date().toISOString(),
            notes,
            created_by
        );

        return this.getById(result.lastInsertRowid);
    }

    // ==================== READ ====================
    getById(id) {
        const stmt = db.prepare(`
            SELECT p.*, s.name as supplier_name, w.name as warehouse_name
            FROM purchases p
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            LEFT JOIN warehouses w ON p.warehouse_id = w.id
            WHERE p.id = ?
        `);
        return stmt.get(id) || null;
    }

    getByNumber(purchaseNumber) {
        const stmt = db.prepare(`
            SELECT p.*, s.name as supplier_name, w.name as warehouse_name
            FROM purchases p
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            LEFT JOIN warehouses w ON p.warehouse_id = w.id
            WHERE p.purchase_number = ?
        `);
        return stmt.get(purchaseNumber) || null;
    }

    getAll(filters = {}) {
        let query = `
            SELECT p.*, s.name as supplier_name, w.name as warehouse_name
            FROM purchases p
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            LEFT JOIN warehouses w ON p.warehouse_id = w.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.supplier_id) {
            query += ' AND p.supplier_id = ?';
            params.push(filters.supplier_id);
        }

        if (filters.warehouse_id) {
            query += ' AND p.warehouse_id = ?';
            params.push(filters.warehouse_id);
        }

        if (filters.status) {
            query += ' AND p.status = ?';
            params.push(filters.status);
        }

        if (filters.search) {
            query += ' AND (p.purchase_number LIKE ? OR s.name LIKE ?)';
            const search = `%${filters.search}%`;
            params.push(search, search);
        }

        if (filters.start_date) {
            query += ' AND p.purchase_date >= ?';
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            query += ' AND p.purchase_date <= ?';
            params.push(filters.end_date);
        }

        const sortBy = filters.sortBy || 'purchase_date';
        const sortOrder = filters.sortOrder || 'DESC';
        query += ` ORDER BY p.${sortBy} ${sortOrder}`;

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
        }

        const stmt = db.prepare(query);
        return stmt.all(...params);
    }

    getItems(purchaseId) {
        const stmt = db.prepare(`
            SELECT pi.*, p.name as product_name, p.code as product_code, u.abbreviation as unit
            FROM purchase_items pi
            LEFT JOIN products p ON pi.product_id = p.id
            LEFT JOIN units u ON p.unit_id = u.id
            WHERE pi.purchase_id = ?
        `);
        return stmt.all(purchaseId);
    }

    // ==================== UPDATE ====================
    update(id, data) {
        const updates = [];
        const params = [];

        const fields = [
            'supplier_id', 'warehouse_id', 'total_amount', 'discount',
            'tax', 'paid_amount', 'due_amount', 'status', 'payment_method',
            'purchase_date', 'notes'
        ];

        fields.forEach(field => {
            if (data[field] !== undefined) {
                updates.push(`${field} = ?`);
                params.push(data[field]);
            }
        });

        if (updates.length === 0) {
            return this.getById(id);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        const query = `UPDATE purchases SET ${updates.join(', ')} WHERE id = ?`;
        const stmt = db.prepare(query);
        const result = stmt.run(...params);

        if (result.changes === 0) {
            return null;
        }

        return this.getById(id);
    }

    updateStatus(id, status) {
        const stmt = db.prepare(`
            UPDATE purchases 
            SET status = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `);
        const result = stmt.run(status, id);
        if (result.changes === 0) {
            return null;
        }
        return this.getById(id);
    }

    // ==================== DELETE ====================
    delete(id) {
        // First delete purchase items
        const deleteItems = db.prepare('DELETE FROM purchase_items WHERE purchase_id = ?');
        deleteItems.run(id);

        const stmt = db.prepare('DELETE FROM purchases WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }

    // ==================== STATS ====================
    getStats(filters = {}) {
        let query = `
            SELECT 
                COUNT(*) as total,
                COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) as completed,
                COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending,
                COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelled,
                COALESCE(SUM(total_amount), 0) as total_amount,
                COALESCE(SUM(paid_amount), 0) as total_paid,
                COALESCE(SUM(due_amount), 0) as total_due
            FROM purchases
            WHERE 1=1
        `;
        const params = [];

        if (filters.start_date) {
            query += ' AND purchase_date >= ?';
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            query += ' AND purchase_date <= ?';
            params.push(filters.end_date);
        }

        const stmt = db.prepare(query);
        return stmt.get(...params);
    }

    // ==================== ITEMS ====================
    createItems(purchaseId, items) {
        const stmt = db.prepare(`
            INSERT INTO purchase_items (
                purchase_id, product_id, batch_id, quantity,
                purchase_price, sale_price, total, expiry_date,
                created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);

        const insertMany = db.transaction((items) => {
            for (const item of items) {
                stmt.run(
                    purchaseId,
                    item.product_id,
                    item.batch_id || null,
                    item.quantity,
                    item.purchase_price || 0,
                    item.sale_price || 0,
                    item.total || (item.quantity * item.purchase_price),
                    item.expiry_date || null
                );
            }
        });

        insertMany(items);
    }

    deleteItems(purchaseId) {
        const stmt = db.prepare('DELETE FROM purchase_items WHERE purchase_id = ?');
        stmt.run(purchaseId);
    }

    // ==================== GENERATE NUMBER ====================
    generateNumber() {
        const stmt = db.prepare(
            "SELECT purchase_number FROM purchases ORDER BY id DESC LIMIT 1"
        );
        const last = stmt.get();

        if (!last) {
            return 'PO-000001';
        }

        const lastNumber = parseInt(last.purchase_number.split('-')[1]);
        const newNumber = String(lastNumber + 1).padStart(6, '0');
        return `PO-${newNumber}`;
    }
}

module.exports = new PurchaseRepository();