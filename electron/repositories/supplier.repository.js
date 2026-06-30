const db = require("../database/database");

class SupplierRepository {
    create(data) {
        const stmt = db.prepare(`
            INSERT INTO suppliers (
                name,
                phone,
                email,
                address,
                cnic,
                credit,
                debit,
                notes,
                is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        return stmt.run(
            data.name,
            data.phone || null,
            data.email || null,
            data.address || null,
            data.cnic || null,
            data.credit || 0,
            data.debit || 0,
            data.notes || null,
            data.is_active !== undefined ? data.is_active : 1
        );
    }

    getAll(filters = {}) {
        let query = `
            SELECT 
                s.*,
                (s.credit - s.debit) as balance,
                COUNT(p.id) as purchase_count,
                SUM(p.total_amount) as total_purchases
            FROM suppliers s
            LEFT JOIN purchases p ON s.id = p.supplier_id AND p.status != 'cancelled'
            WHERE 1=1
        `;
        const params = [];

        if (filters.name) {
            query += ' AND s.name LIKE ?';
            params.push(`%${filters.name}%`);
        }
        if (filters.phone) {
            query += ' AND s.phone LIKE ?';
            params.push(`%${filters.phone}%`);
        }
        if (filters.email) {
            query += ' AND s.email LIKE ?';
            params.push(`%${filters.email}%`);
        }
        if (filters.is_active !== undefined) {
            query += ' AND s.is_active = ?';
            params.push(filters.is_active);
        }
        if (filters.min_balance) {
            query += ' AND (s.credit - s.debit) >= ?';
            params.push(filters.min_balance);
        }
        if (filters.max_balance) {
            query += ' AND (s.credit - s.debit) <= ?';
            params.push(filters.max_balance);
        }

        query += ' GROUP BY s.id ORDER BY s.name ASC';

        const stmt = db.prepare(query);
        return stmt.all(...params);
    }

    getById(id) {
        const stmt = db.prepare(`
            SELECT 
                s.*,
                (s.credit - s.debit) as balance,
                COUNT(p.id) as purchase_count,
                SUM(p.total_amount) as total_purchases,
                SUM(p.paid_amount) as total_paid,
                SUM(p.due_amount) as total_due
            FROM suppliers s
            LEFT JOIN purchases p ON s.id = p.supplier_id AND p.status != 'cancelled'
            WHERE s.id = ?
            GROUP BY s.id
        `);
        return stmt.get(id);
    }

    getByName(name) {
        const stmt = db.prepare('SELECT *, (credit - debit) as balance FROM suppliers WHERE LOWER(name) = LOWER(?)');
        return stmt.get(name);
    }

    getByPhone(phone) {
        const stmt = db.prepare('SELECT *, (credit - debit) as balance FROM suppliers WHERE phone = ?');
        return stmt.get(phone);
    }

    getByCNIC(cnic) {
        const stmt = db.prepare('SELECT *, (credit - debit) as balance FROM suppliers WHERE cnic = ?');
        return stmt.get(cnic);
    }

    update(id, data) {
        const updates = [];
        const params = [];

        if (data.name !== undefined) {
            updates.push('name = ?');
            params.push(data.name);
        }
        if (data.phone !== undefined) {
            updates.push('phone = ?');
            params.push(data.phone);
        }
        if (data.email !== undefined) {
            updates.push('email = ?');
            params.push(data.email);
        }
        if (data.address !== undefined) {
            updates.push('address = ?');
            params.push(data.address);
        }
        if (data.cnic !== undefined) {
            updates.push('cnic = ?');
            params.push(data.cnic);
        }
        if (data.credit !== undefined) {
            updates.push('credit = ?');
            params.push(data.credit);
        }
        if (data.debit !== undefined) {
            updates.push('debit = ?');
            params.push(data.debit);
        }
        if (data.notes !== undefined) {
            updates.push('notes = ?');
            params.push(data.notes);
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
            UPDATE suppliers SET ${updates.join(', ')} WHERE id = ?
        `);
        return stmt.run(...params);
    }

    delete(id) {
        const stmt = db.prepare(`
            UPDATE suppliers 
            SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `);
        return stmt.run(id);
    }

    hardDelete(id) {
        const stmt = db.prepare('DELETE FROM suppliers WHERE id = ?');
        return stmt.run(id);
    }

    getActive() {
        const stmt = db.prepare(`
            SELECT *, (credit - debit) as balance FROM suppliers 
            WHERE is_active = 1 
            ORDER BY name ASC
        `);
        return stmt.all();
    }

    search(query) {
        const searchTerm = `%${query}%`;
        const stmt = db.prepare(`
            SELECT *, (credit - debit) as balance FROM suppliers 
            WHERE is_active = 1 
            AND (
                name LIKE ? OR 
                phone LIKE ? OR 
                email LIKE ? OR 
                address LIKE ? OR 
                cnic LIKE ?
            )
            ORDER BY name ASC
        `);
        return stmt.all(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    getWithPurchaseCount() {
        const stmt = db.prepare(`
            SELECT 
                s.*,
                (s.credit - s.debit) as balance,
                COUNT(p.id) as purchase_count,
                SUM(p.total_amount) as total_purchases,
                SUM(p.paid_amount) as total_paid,
                SUM(p.due_amount) as total_due
            FROM suppliers s
            LEFT JOIN purchases p ON s.id = p.supplier_id AND p.status != 'cancelled'
            WHERE s.is_active = 1
            GROUP BY s.id
            ORDER BY purchase_count DESC
        `);
        return stmt.all();
    }

    getBalance(id) {
        const stmt = db.prepare(`
            SELECT 
                credit,
                debit,
                (credit - debit) as balance,
                (SELECT SUM(due_amount) FROM purchases WHERE supplier_id = ? AND status != 'cancelled') as pending_due
            FROM suppliers 
            WHERE id = ?
        `);
        return stmt.get(id, id);
    }

    updateCredit(id, amount) {
        const stmt = db.prepare(`
            UPDATE suppliers 
            SET credit = credit + ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `);
        return stmt.run(amount, id);
    }

    updateDebit(id, amount) {
        const stmt = db.prepare(`
            UPDATE suppliers 
            SET debit = debit + ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `);
        return stmt.run(amount, id);
    }

    updateBalance(id, amount) {
        // Backward compatible - positive adds to credit, negative adds to debit
        if (amount >= 0) {
            return this.updateCredit(id, amount);
        } else {
            return this.updateDebit(id, Math.abs(amount));
        }
    }

    // Additional helper methods
    getTotalSuppliers() {
        const stmt = db.prepare(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive,
                SUM(credit) as total_credit,
                SUM(debit) as total_debit,
                SUM(credit - debit) as total_balance
            FROM suppliers
        `);
        return stmt.get();
    }

    getRecentSuppliers(limit = 10) {
        const stmt = db.prepare(`
            SELECT *, (credit - debit) as balance FROM suppliers 
            WHERE is_active = 1 
            ORDER BY created_at DESC 
            LIMIT ?
        `);
        return stmt.all(limit);
    }

    getSupplierStats() {
        const stmt = db.prepare(`
            SELECT 
                COUNT(DISTINCT s.id) as total_suppliers,
                SUM(s.credit) as total_credit,
                SUM(s.debit) as total_debit,
                SUM(s.credit - s.debit) as total_balance,
                COUNT(DISTINCT p.id) as total_purchases,
                SUM(p.total_amount) as total_purchase_amount,
                COALESCE(AVG(p.total_amount), 0) as avg_purchase_amount
            FROM suppliers s
            LEFT JOIN purchases p ON s.id = p.supplier_id AND p.status != 'cancelled'
            WHERE s.is_active = 1
        `);
        return stmt.get();
    }

    getSuppliersWithHighBalance(minBalance = 10000) {
        const stmt = db.prepare(`
            SELECT *, (credit - debit) as balance FROM suppliers 
            WHERE is_active = 1 AND (credit - debit) >= ?
            ORDER BY balance DESC
        `);
        return stmt.all(minBalance);
    }

    getSuppliersByDateRange(startDate, endDate) {
        const stmt = db.prepare(`
            SELECT 
                s.*,
                (s.credit - s.debit) as balance,
                COUNT(p.id) as purchase_count,
                SUM(p.total_amount) as total_purchases
            FROM suppliers s
            LEFT JOIN purchases p ON s.id = p.supplier_id 
                AND p.status != 'cancelled'
                AND DATE(p.purchase_date) BETWEEN DATE(?) AND DATE(?)
            WHERE s.is_active = 1
            GROUP BY s.id
            ORDER BY total_purchases DESC
        `);
        return stmt.all(startDate, endDate);
    }

    getSupplierWithMostPurchases() {
        const stmt = db.prepare(`
            SELECT 
                s.*,
                (s.credit - s.debit) as balance,
                COUNT(p.id) as purchase_count,
                SUM(p.total_amount) as total_purchases
            FROM suppliers s
            LEFT JOIN purchases p ON s.id = p.supplier_id AND p.status != 'cancelled'
            WHERE s.is_active = 1
            GROUP BY s.id
            ORDER BY purchase_count DESC
            LIMIT 1
        `);
        return stmt.get();
    }

    // Additional methods for credit/debit filtering
    getSuppliersWithCredit() {
        const stmt = db.prepare(`
            SELECT *, (credit - debit) as balance FROM suppliers 
            WHERE is_active = 1 AND credit > 0 
            ORDER BY credit DESC
        `);
        return stmt.all();
    }

    getSuppliersWithDebit() {
        const stmt = db.prepare(`
            SELECT *, (credit - debit) as balance FROM suppliers 
            WHERE is_active = 1 AND debit > 0 
            ORDER BY debit DESC
        `);
        return stmt.all();
    }

    getSuppliersWithBalance() {
        const stmt = db.prepare(`
            SELECT *, (credit - debit) as balance FROM suppliers 
            WHERE is_active = 1 AND credit != debit 
            ORDER BY balance DESC
        `);
        return stmt.all();
    }
}

module.exports = new SupplierRepository();