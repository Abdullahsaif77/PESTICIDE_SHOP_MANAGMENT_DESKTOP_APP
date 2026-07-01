const db = require('../database/database');

class SalesRepository {
    // ==================== CREATE ====================
    create(data) {
        const {
            invoice_number,
            customer_id,
            warehouse_id,
            total_amount,
            discount = 0,
            tax = 0,
            paid_amount = 0,
            due_amount = 0,
            status = 'completed',
            payment_method = null,
            sale_date = null,
            notes = null,
            created_by = null
        } = data;

        const stmt = db.prepare(`
            INSERT INTO sales (
                invoice_number, customer_id, warehouse_id, total_amount,
                discount, tax, paid_amount, due_amount, status,
                payment_method, sale_date, notes, created_by,
                created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);

        const result = stmt.run(
            invoice_number,
            customer_id,
            warehouse_id,
            total_amount,
            discount,
            tax,
            paid_amount,
            due_amount,
            status,
            payment_method,
            sale_date || new Date().toISOString(),
            notes,
            created_by
        );

        return this.getById(result.lastInsertRowid);
    }

    // ==================== READ ====================
    getById(id) {
        const stmt = db.prepare(`
            SELECT s.*, c.name as customer_name, w.name as warehouse_name
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.id
            LEFT JOIN warehouses w ON s.warehouse_id = w.id
            WHERE s.id = ?
        `);
        return stmt.get(id) || null;
    }

    getByInvoiceNumber(invoiceNumber) {
        const stmt = db.prepare(`
            SELECT s.*, c.name as customer_name, w.name as warehouse_name
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.id
            LEFT JOIN warehouses w ON s.warehouse_id = w.id
            WHERE s.invoice_number = ?
        `);
        return stmt.get(invoiceNumber) || null;
    }

    getAll(filters = {}) {
        let query = `
            SELECT s.*, c.name as customer_name, w.name as warehouse_name
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.id
            LEFT JOIN warehouses w ON s.warehouse_id = w.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.customer_id) {
            query += ' AND s.customer_id = ?';
            params.push(filters.customer_id);
        }

        if (filters.warehouse_id) {
            query += ' AND s.warehouse_id = ?';
            params.push(filters.warehouse_id);
        }

        if (filters.status) {
            query += ' AND s.status = ?';
            params.push(filters.status);
        }

        if (filters.search) {
            query += ' AND (s.invoice_number LIKE ? OR c.name LIKE ?)';
            const search = `%${filters.search}%`;
            params.push(search, search);
        }

        if (filters.start_date) {
            query += ' AND s.sale_date >= ?';
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            query += ' AND s.sale_date <= ?';
            params.push(filters.end_date);
        }

        const sortBy = filters.sortBy || 'sale_date';
        const sortOrder = filters.sortOrder || 'DESC';
        query += ` ORDER BY s.${sortBy} ${sortOrder}`;

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
        }

        if (filters.offset) {
            query += ' OFFSET ?';
            params.push(filters.offset);
        }

        const stmt = db.prepare(query);
        return stmt.all(...params);
    }

    getItems(saleId) {
        const stmt = db.prepare(`
            SELECT si.*, 
                   p.name as product_name, 
                   p.code as product_code, 
                   u.abbreviation as unit,
                   b.batch_number
            FROM sale_items si
            LEFT JOIN products p ON si.product_id = p.id
            LEFT JOIN units u ON p.unit_id = u.id
            LEFT JOIN batches b ON si.batch_id = b.id
            WHERE si.sale_id = ?
        `);
        return stmt.all(saleId);
    }

    // ==================== UPDATE ====================
    update(id, data) {
        const updates = [];
        const params = [];

        const fields = [
            'customer_id', 'warehouse_id', 'total_amount', 'discount',
            'tax', 'paid_amount', 'due_amount', 'status', 'payment_method',
            'sale_date', 'notes'
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

        const query = `UPDATE sales SET ${updates.join(', ')} WHERE id = ?`;
        const stmt = db.prepare(query);
        const result = stmt.run(...params);

        if (result.changes === 0) {
            return null;
        }

        return this.getById(id);
    }

    updateStatus(id, status) {
        const stmt = db.prepare(`
            UPDATE sales 
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
        const deleteItems = db.prepare('DELETE FROM sale_items WHERE sale_id = ?');
        deleteItems.run(id);

        const stmt = db.prepare('DELETE FROM sales WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }

    deleteItems(saleId) {
        const stmt = db.prepare('DELETE FROM sale_items WHERE sale_id = ?');
        stmt.run(saleId);
    }

    // ==================== ITEMS ====================
    createItems(saleId, items) {
        const stmt = db.prepare(`
            INSERT INTO sale_items (
                sale_id, product_id, batch_id, quantity,
                sale_price, purchase_price, discount, total,
                created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);

        const insertMany = db.transaction((items) => {
            for (const item of items) {
                stmt.run(
                    saleId,
                    item.product_id,
                    item.batch_id || null,
                    item.quantity,
                    item.sale_price || 0,
                    item.purchase_price || 0,
                    item.discount || 0,
                    item.total || (item.quantity * item.sale_price)
                );
            }
        });

        insertMany(items);
    }

    // ==================== GENERATE NUMBER ====================
    generateNumber() {
        const stmt = db.prepare(
            "SELECT invoice_number FROM sales ORDER BY id DESC LIMIT 1"
        );
        const last = stmt.get();

        if (!last) {
            return 'INV-000001';
        }

        const lastNumber = parseInt(last.invoice_number.split('-')[1]);
        const newNumber = String(lastNumber + 1).padStart(6, '0');
        return `INV-${newNumber}`;
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
            FROM sales
            WHERE 1=1
        `;
        const params = [];

        if (filters.start_date) {
            query += ' AND sale_date >= ?';
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            query += ' AND sale_date <= ?';
            params.push(filters.end_date);
        }

        const stmt = db.prepare(query);
        return stmt.get(...params);
    }
}

module.exports = new SalesRepository();