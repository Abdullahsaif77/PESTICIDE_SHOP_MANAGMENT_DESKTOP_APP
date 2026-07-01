const db = require('../database/database');

class LedgerRepository {
    // ==================== CREATE ====================
    create(data) {
        const {
            customer_id,
            supplier_id,
            entry_type, // 'debit' or 'credit'
            amount,
            description,
            reference_type, // 'sale', 'purchase', 'payment', 'receipt'
            reference_id,
            balance_after,
            created_by = null
        } = data;

        const stmt = db.prepare(`
            INSERT INTO ledger (
                customer_id, supplier_id, entry_type, amount,
                description, reference_type, reference_id,
                balance_after, created_by, entry_date,
                created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);

        const result = stmt.run(
            customer_id || null,
            supplier_id || null,
            entry_type,
            amount,
            description || null,
            reference_type || null,
            reference_id || null,
            balance_after,
            created_by
        );

        return this.getById(result.lastInsertRowid);
    }

    // ==================== READ ====================
    getById(id) {
        const stmt = db.prepare(`
            SELECT l.*,
                   c.name as customer_name,
                   s.name as supplier_name,
                   u.full_name as created_by_name
            FROM ledger l
            LEFT JOIN customers c ON l.customer_id = c.id
            LEFT JOIN suppliers s ON l.supplier_id = s.id
            LEFT JOIN users u ON l.created_by = u.id
            WHERE l.id = ?
        `);
        return stmt.get(id) || null;
    }

    getCustomerLedger(customerId, filters = {}) {
        let query = `
            SELECT l.*,
                   c.name as customer_name,
                   u.full_name as created_by_name
            FROM ledger l
            LEFT JOIN customers c ON l.customer_id = c.id
            LEFT JOIN users u ON l.created_by = u.id
            WHERE l.customer_id = ?
        `;
        const params = [customerId];

        if (filters.start_date) {
            query += ' AND l.entry_date >= ?';
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            query += ' AND l.entry_date <= ?';
            params.push(filters.end_date);
        }

        if (filters.reference_type) {
            query += ' AND l.reference_type = ?';
            params.push(filters.reference_type);
        }

        query += ' ORDER BY l.entry_date DESC, l.id DESC';

        const stmt = db.prepare(query);
        return stmt.all(...params);
    }

    getSupplierLedger(supplierId, filters = {}) {
        let query = `
            SELECT l.*,
                   s.name as supplier_name,
                   u.full_name as created_by_name
            FROM ledger l
            LEFT JOIN suppliers s ON l.supplier_id = s.id
            LEFT JOIN users u ON l.created_by = u.id
            WHERE l.supplier_id = ?
        `;
        const params = [supplierId];

        if (filters.start_date) {
            query += ' AND l.entry_date >= ?';
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            query += ' AND l.entry_date <= ?';
            params.push(filters.end_date);
        }

        if (filters.reference_type) {
            query += ' AND l.reference_type = ?';
            params.push(filters.reference_type);
        }

        query += ' ORDER BY l.entry_date DESC, l.id DESC';

        const stmt = db.prepare(query);
        return stmt.all(...params);
    }

    getAll(filters = {}) {
        let query = `
            SELECT l.*,
                   c.name as customer_name,
                   s.name as supplier_name,
                   u.full_name as created_by_name
            FROM ledger l
            LEFT JOIN customers c ON l.customer_id = c.id
            LEFT JOIN suppliers s ON l.supplier_id = s.id
            LEFT JOIN users u ON l.created_by = u.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.customer_id) {
            query += ' AND l.customer_id = ?';
            params.push(filters.customer_id);
        }

        if (filters.supplier_id) {
            query += ' AND l.supplier_id = ?';
            params.push(filters.supplier_id);
        }

        if (filters.entry_type) {
            query += ' AND l.entry_type = ?';
            params.push(filters.entry_type);
        }

        if (filters.reference_type) {
            query += ' AND l.reference_type = ?';
            params.push(filters.reference_type);
        }

        if (filters.start_date) {
            query += ' AND l.entry_date >= ?';
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            query += ' AND l.entry_date <= ?';
            params.push(filters.end_date);
        }

        query += ' ORDER BY l.entry_date DESC, l.id DESC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
        }

        const stmt = db.prepare(query);
        return stmt.all(...params);
    }

    getCustomerBalance(customerId) {
        const stmt = db.prepare(`
            SELECT 
                COALESCE(SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE 0 END), 0) as total_debit,
                COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END), 0) as total_credit,
                COALESCE(SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE -amount END), 0) as balance
            FROM ledger
            WHERE customer_id = ?
        `);
        return stmt.get(customerId);
    }

    getSupplierBalance(supplierId) {
        const stmt = db.prepare(`
            SELECT 
                COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END), 0) as total_credit,
                COALESCE(SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE 0 END), 0) as total_debit,
                COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE -amount END), 0) as balance
            FROM ledger
            WHERE supplier_id = ?
        `);
        return stmt.get(supplierId);
    }

    // ==================== DELETE ====================
    delete(id) {
        const stmt = db.prepare('DELETE FROM ledger WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }

    deleteByReference(referenceType, referenceId) {
        const stmt = db.prepare('DELETE FROM ledger WHERE reference_type = ? AND reference_id = ?');
        const result = stmt.run(referenceType, referenceId);
        return result.changes > 0;
    }

    // ==================== STATS ====================
    getStats(filters = {}) {
        let query = `
            SELECT 
                COUNT(*) as total_entries,
                COALESCE(SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE 0 END), 0) as total_debit,
                COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END), 0) as total_credit,
                COUNT(DISTINCT customer_id) as total_customers,
                COUNT(DISTINCT supplier_id) as total_suppliers
            FROM ledger
            WHERE 1=1
        `;
        const params = [];

        if (filters.start_date) {
            query += ' AND entry_date >= ?';
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            query += ' AND entry_date <= ?';
            params.push(filters.end_date);
        }

        const stmt = db.prepare(query);
        return stmt.get(...params);
    }

    getCustomerLedgerSummary(customerId) {
        const stmt = db.prepare(`
            SELECT 
                COUNT(*) as total_entries,
                COALESCE(SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE 0 END), 0) as total_debit,
                COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END), 0) as total_credit,
                COALESCE(SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE -amount END), 0) as balance
            FROM ledger
            WHERE customer_id = ?
        `);
        return stmt.get(customerId);
    }

    getSupplierLedgerSummary(supplierId) {
        const stmt = db.prepare(`
            SELECT 
                COUNT(*) as total_entries,
                COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END), 0) as total_credit,
                COALESCE(SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE 0 END), 0) as total_debit,
                COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE -amount END), 0) as balance
            FROM ledger
            WHERE supplier_id = ?
        `);
        return stmt.get(supplierId);
    }
}

module.exports = new LedgerRepository();