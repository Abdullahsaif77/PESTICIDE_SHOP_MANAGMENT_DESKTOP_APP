// electron/repositories/customer.repository.js

const db = require("../database/database")

class CustomerRepository {
    // ==================== CREATE ====================
    create(data) {
        const { name, phone, email, address, cnic, credit = 0, debit = 0, credit_limit = 0, notes } = data;
        
        const stmt = db.prepare(`
            INSERT INTO customers (name, phone, email, address, cnic, credit, debit, credit_limit, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
        
        const result = stmt.run(
            name,
            phone || null,
            email || null,
            address || null,
            cnic || null,
            credit,
            debit,
            credit_limit,
            notes || null
        );
        
        return this.getById(result.lastInsertRowid);
    }

    // ==================== READ ====================
    getAll(filters = {}) {
        let query = 'SELECT *, (credit - debit) as balance FROM customers WHERE 1=1';
        const params = [];

        if (filters.search) {
            query += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
            const search = `%${filters.search}%`;
            params.push(search, search, search);
        }

        if (filters.status === 'active') {
            query += ' AND is_active = 1';
        } else if (filters.status === 'inactive') {
            query += ' AND is_active = 0';
        }

        const sortBy = filters.sortBy || 'name';
        const sortOrder = filters.sortOrder || 'ASC';
        query += ` ORDER BY ${sortBy} ${sortOrder}`;

        const stmt = db.prepare(query);
        return stmt.all(...params);
    }

    getById(id) {
        const stmt = db.prepare('SELECT *, (credit - debit) as balance FROM customers WHERE id = ?');
        return stmt.get(id) || null;
    }

    getByName(name) {
        const stmt = db.prepare('SELECT *, (credit - debit) as balance FROM customers WHERE LOWER(name) = LOWER(?)');
        return stmt.get(name) || null;
    }

    getByPhone(phone) {
        const stmt = db.prepare('SELECT *, (credit - debit) as balance FROM customers WHERE phone = ?');
        return stmt.get(phone) || null;
    }

    getByCNIC(cnic) {
        const stmt = db.prepare('SELECT *, (credit - debit) as balance FROM customers WHERE cnic = ?');
        return stmt.get(cnic) || null;
    }

    getActive() {
        const stmt = db.prepare('SELECT *, (credit - debit) as balance FROM customers WHERE is_active = 1 ORDER BY name ASC');
        return stmt.all();
    }

    search(query) {
        const stmt = db.prepare(`
            SELECT *, (credit - debit) as balance FROM customers 
            WHERE name LIKE ? OR phone LIKE ? OR email LIKE ? OR cnic LIKE ?
            ORDER BY name ASC
        `);
        const search = `%${query}%`;
        return stmt.all(search, search, search, search);
    }

    // ==================== UPDATE ====================
    update(id, data) {
        const updates = [];
        const params = [];

        const fields = ['name', 'phone', 'email', 'address', 'cnic', 'credit', 'debit', 'credit_limit', 'notes'];
        fields.forEach(field => {
            if (data[field] !== undefined) {
                updates.push(`${field} = ?`);
                params.push(data[field]);
            }
        });

        if (data.is_active !== undefined) {
            updates.push('is_active = ?');
            params.push(data.is_active);
        }

        if (updates.length === 0) {
            return this.getById(id);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        const query = `UPDATE customers SET ${updates.join(', ')} WHERE id = ?`;
        const stmt = db.prepare(query);
        const result = stmt.run(...params);

        if (result.changes === 0) {
            return null;
        }

        return this.getById(id);
    }

    // ==================== DELETE ====================
    delete(id) {
        const stmt = db.prepare(`
            UPDATE customers 
            SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `);
        const result = stmt.run(id);
        return result.changes > 0;
    }

    hardDelete(id) {
        // Check if customer has sales before hard delete
        const checkStmt = db.prepare('SELECT COUNT(*) as count FROM sales WHERE customer_id = ?');
        const result = checkStmt.get(id);
        
        if (result.count > 0) {
            throw new Error('Cannot delete customer with existing sales');
        }

        const stmt = db.prepare('DELETE FROM customers WHERE id = ?');
        const deleteResult = stmt.run(id);
        return deleteResult.changes > 0;
    }

    // ==================== BALANCE (Credit/Debit) ====================
    getBalance(id) {
        const stmt = db.prepare('SELECT credit, debit, (credit - debit) as balance FROM customers WHERE id = ?');
        return stmt.get(id);
    }

    updateCredit(id, amount) {
        const stmt = db.prepare(`
            UPDATE customers 
            SET credit = credit + ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `);
        const result = stmt.run(amount, id);
        if (result.changes === 0) {
            return null;
        }
        return this.getBalance(id);
    }

    updateDebit(id, amount) {
        const stmt = db.prepare(`
            UPDATE customers 
            SET debit = debit + ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `);
        const result = stmt.run(amount, id);
        if (result.changes === 0) {
            return null;
        }
        return this.getBalance(id);
    }

    updateBalance(id, amount) {
        // For backward compatibility - updates credit (positive) or debit (negative)
        if (amount >= 0) {
            return this.updateCredit(id, amount);
        } else {
            return this.updateDebit(id, Math.abs(amount));
        }
    }

    // ==================== STATS ====================
    getStats() {
        const stmt = db.prepare(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive,
                COALESCE(SUM(credit), 0) as totalCredit,
                COALESCE(SUM(debit), 0) as totalDebit,
                COALESCE(SUM(credit - debit), 0) as totalBalance
            FROM customers
        `);
        return stmt.get();
    }

    getTopCustomers(limit = 10) {
        const stmt = db.prepare(`
            SELECT 
                c.*,
                (c.credit - c.debit) as balance,
                COUNT(s.id) as sale_count,
                COALESCE(SUM(s.total_amount), 0) as total_sales
            FROM customers c
            LEFT JOIN sales s ON c.id = s.customer_id AND s.status != 'cancelled'
            WHERE c.is_active = 1
            GROUP BY c.id
            ORDER BY total_sales DESC
            LIMIT ?
        `);
        return stmt.all(limit);
    }

    getCustomerWithSales(id) {
        const customer = this.getById(id);
        if (!customer) return null;

        const salesStmt = db.prepare(`
            SELECT 
                s.*,
                COUNT(si.id) as item_count
            FROM sales s
            LEFT JOIN sale_items si ON s.id = si.sale_id
            WHERE s.customer_id = ?
            GROUP BY s.id
            ORDER BY s.sale_date DESC
        `);
        const sales = salesStmt.all(id);

        return { ...customer, sales };
    }

    // ==================== EXPORT ====================
    exportData(filters = {}) {
        let query = 'SELECT id, name, phone, email, address, cnic, credit, debit, (credit - debit) as balance, is_active, created_at FROM customers WHERE 1=1';
        const params = [];

        if (filters.is_active !== undefined) {
            query += ' AND is_active = ?';
            params.push(filters.is_active);
        }

        query += ' ORDER BY name ASC';
        const stmt = db.prepare(query);
        return stmt.all(...params);
    }

    // ==================== ADDITIONAL HELPERS ====================
    getCustomersWithCredit() {
        const stmt = db.prepare('SELECT *, (credit - debit) as balance FROM customers WHERE credit > 0 ORDER BY credit DESC');
        return stmt.all();
    }

    getCustomersWithDebit() {
        const stmt = db.prepare('SELECT *, (credit - debit) as balance FROM customers WHERE debit > 0 ORDER BY debit DESC');
        return stmt.all();
    }

    getCustomersWithBalance() {
        const stmt = db.prepare(`
            SELECT *, (credit - debit) as balance 
            FROM customers 
            WHERE credit != debit 
            ORDER BY balance DESC
        `);
        return stmt.all();
    }
}

module.exports = new CustomerRepository();