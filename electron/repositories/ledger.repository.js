// electron/repositories/ledger.repository.js

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
            created_by = null,
            entry_date = null // ✅ ADD THIS PARAMETER
        } = data;

        const stmt = db.prepare(`
            INSERT INTO ledger (
                customer_id, supplier_id, entry_type, amount,
                description, reference_type, reference_id,
                balance_after, created_by, entry_date,
                created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
            created_by,
            entry_date || new Date().toISOString() // ✅ Use entry_date or current date
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

    // electron/repositories/ledger.repository.js

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

    // ✅ Order by date ASC for correct running balance
    query += ' ORDER BY l.entry_date ASC, l.id ASC';

    const stmt = db.prepare(query);
    const entries = stmt.all(...params);

    // ✅ Recalculate running balance
    let runningBalance = 0;
    const result = entries.map(entry => {
        if (entry.entry_type === 'debit') {
            runningBalance += entry.amount;
        } else if (entry.entry_type === 'credit') {
            runningBalance -= entry.amount;
        }
        
        return {
            ...entry,
            balance_after: runningBalance
        };
    });

    // ✅ Return in DESC order for display
    return result.reverse();
}

   // electron/repositories/ledger.repository.js

getSupplierLedger(supplierId, filters = {}) {
    // ✅ FIRST: Get all entries in CHRONOLOGICAL order (oldest first)
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

    // ✅ CRITICAL: Order by date ASC (oldest first) for correct running balance
    query += ' ORDER BY l.entry_date ASC, l.id ASC';

    const stmt = db.prepare(query);
    const entries = stmt.all(...params);

    // ✅ Recalculate running balance for each entry
    let runningBalance = 0;
    const result = entries.map(entry => {
        // For DEBIT: balance increases (we owe more)
        // For CREDIT: balance decreases (we owe less)
        if (entry.entry_type === 'debit') {
            runningBalance += entry.amount;
        } else if (entry.entry_type === 'credit') {
            runningBalance -= entry.amount;
        }
        
        // ✅ Return entry with recalculated balance
        return {
            ...entry,
            balance_after: runningBalance  // ✅ Correct running balance
        };
    });

    // ✅ Return in DESC order for display (newest first)
    return result.reverse();
}

   // electron/repositories/ledger.repository.js

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

    // ✅ Order by date ASC for correct running balance
    query += ' ORDER BY l.entry_date ASC, l.id ASC';

    if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
    }

    const stmt = db.prepare(query);
    const entries = stmt.all(...params);

    // ✅ Recalculate running balance for all entries
    let runningBalance = 0;
    const result = entries.map(entry => {
        if (entry.entry_type === 'debit') {
            runningBalance += entry.amount;
        } else if (entry.entry_type === 'credit') {
            runningBalance -= entry.amount;
        }
        
        return {
            ...entry,
            balance_after: runningBalance
        };
    });

    // ✅ Return in DESC order for display
    return result.reverse();
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
            COUNT(*) as totalEntries,
            COALESCE(SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE 0 END), 0) as totalDebit,
            COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END), 0) as totalCredit,
            COUNT(DISTINCT customer_id) as totalCustomers,
            COUNT(DISTINCT supplier_id) as totalSuppliers
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
    const result = stmt.get(...params);
    
    // ✅ Ensure all fields exist with defaults (camelCase)
    return {
        totalEntries: result?.totalEntries || 0,
        totalDebit: result?.totalDebit || 0,
        totalCredit: result?.totalCredit || 0,
        totalCustomers: result?.totalCustomers || 0,
        totalSuppliers: result?.totalSuppliers || 0
    };
}

   // electron/repositories/ledger.repository.js

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
    const result = stmt.get(customerId);
    
    // ✅ Calculate remaining debit and credit
    const remainingDebit = Math.max(0, result.total_debit - result.total_credit);
    const remainingCredit = Math.max(0, result.total_credit - result.total_debit);
    
    return {
        ...result,
        remaining_debit: remainingDebit,
        remaining_credit: remainingCredit,
        balance: result.total_debit - result.total_credit
    };
}

   // electron/repositories/ledger.repository.js

getSupplierLedgerSummary(supplierId) {
    const stmt = db.prepare(`
        SELECT 
            COUNT(*) as total_entries,
            COALESCE(SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE 0 END), 0) as total_debit,
            COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END), 0) as total_credit,
            COALESCE(SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE -amount END), 0) as balance
        FROM ledger
        WHERE supplier_id = ?
    `);
    const result = stmt.get(supplierId);
    
    // ✅ Calculate the correct remaining debit
    // Remaining debit = total_debit - total_credit (but not negative)
    const remainingDebit = Math.max(0, result.total_debit - result.total_credit);
    // Remaining credit = total_credit - total_debit (but not negative)
    const remainingCredit = Math.max(0, result.total_credit - result.total_debit);
    
    return {
        ...result,
        remaining_debit: remainingDebit,   // ✅ What you still owe
        remaining_credit: remainingCredit, // ✅ What they owe you
        balance: result.total_debit - result.total_credit
    };
}
}

module.exports = new LedgerRepository();