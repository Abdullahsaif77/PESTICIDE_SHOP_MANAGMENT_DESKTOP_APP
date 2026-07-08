// electron/database/repositories/expenseRepository.js
const db = require("../database/database")

class ExpenseRepository {
    // ===========================
    // EXPENSE CATEGORIES
    // ===========================
    getAllCategories(includeInactive = false) {
        let query = `SELECT * FROM expense_categories`;
        if (!includeInactive) {
            query += ` WHERE is_active = 1`;
        }
        query += ` ORDER BY name ASC`;
        // better-sqlite3 uses prepare().all()
        return db.prepare(query).all();
    }

    getCategoryById(id) {
        return db.prepare(`SELECT * FROM expense_categories WHERE id = ?`).get(id);
    }

    createCategory(name, description) {
        const stmt = db.prepare(
            `INSERT INTO expense_categories (name, description) VALUES (?, ?)`
        );
        const info = stmt.run(name, description);
        return { id: info.lastInsertRowid, name, description };
    }

    updateCategory(id, name, description, is_active) {
        const stmt = db.prepare(
            `UPDATE expense_categories SET name = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        );
        stmt.run(name, description, is_active, id);
        return this.getCategoryById(id);
    }

    // ===========================
    // EXPENSES
    // ===========================
    getAllExpenses(limit = 100, offset = 0) {
        const query = `
            SELECT e.*, c.name as category_name 
            FROM expenses e
            LEFT JOIN expense_categories c ON e.category_id = c.id
            ORDER BY e.expense_date DESC, e.id DESC
            LIMIT ? OFFSET ?
        `;
        return db.prepare(query).all(limit, offset);
    }

    getExpenseById(id) {
        const query = `
            SELECT e.*, c.name as category_name 
            FROM expenses e
            LEFT JOIN expense_categories c ON e.category_id = c.id
            WHERE e.id = ?
        `;
        return db.prepare(query).get(id);
    }

    getExpenseByNumber(expenseNumber) {
        return db.prepare(`SELECT * FROM expenses WHERE expense_number = ?`).get(expenseNumber);
    }

    createExpense(expenseData) {
        const { 
            expense_number, category_id, amount, description, 
            expense_date, payment_method, receipt_image, created_by 
        } = expenseData;

        const stmt = db.prepare(
            `INSERT INTO expenses 
            (expense_number, category_id, amount, description, expense_date, payment_method, receipt_image, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        );
        
        const info = stmt.run(expense_number, category_id, amount, description, expense_date, payment_method, receipt_image, created_by);
        
        return this.getExpenseById(info.lastInsertRowid);
    }

    updateExpense(id, expenseData) {
        const { 
            category_id, amount, description, expense_date, 
            payment_method, receipt_image 
        } = expenseData;

        const stmt = db.prepare(
            `UPDATE expenses SET 
            category_id = ?, amount = ?, description = ?, expense_date = ?, 
            payment_method = ?, receipt_image = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?`
        );
        
        stmt.run(category_id, amount, description, expense_date, payment_method, receipt_image, id);
        
        return this.getExpenseById(id);
    }

    deleteExpense(id) {
        db.prepare(`DELETE FROM expenses WHERE id = ?`).run(id);
        return { success: true };
    }
    
    getTotalExpensesForDateRange(startDate, endDate) {
        const query = `
            SELECT COALESCE(SUM(amount), 0) as total 
            FROM expenses 
            WHERE date(expense_date) BETWEEN date(?) AND date(?)
        `;
        const result = db.prepare(query).get(startDate, endDate);
        return result.total;
    }
}

module.exports = new ExpenseRepository();