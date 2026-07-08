// electron/services/expenseService.js
const expenseRepository = require("../repositories/expense.repository")

class ExpenseService {
    
    // --- Categories ---
    getCategories(includeInactive = false) {
        return expenseRepository.getAllCategories(includeInactive);
    }

    createCategory(name, description) {
        if (!name || name.trim() === '') {
            throw new Error('Category name is required');
        }
        return expenseRepository.createCategory(name.trim(), description);
    }

    updateCategory(id, name, description, is_active) {
        if (!id) throw new Error('Category ID is required');
        return expenseRepository.updateCategory(id, name, description, is_active);
    }

    // --- Expenses ---
    getExpenses(limit = 100, offset = 0) {
        return expenseRepository.getAllExpenses(limit, offset);
    }

    getExpense(id) {
        const expense = expenseRepository.getExpenseById(id);
        if (!expense) throw new Error('Expense not found');
        return expense;
    }

    createExpense(expenseData) {
        // Validation
        if (!expenseData.amount || expenseData.amount <= 0) {
            throw new Error('Valid amount is required');
        }
        if (!expenseData.category_id) {
            throw new Error('Category is required');
        }

        // Generate unique expense number (EXP-2026-0001)
        const date = new Date();
        const year = date.getFullYear();
        const prefix = `EXP-${year}-`;
        
        // Find the latest expense number to increment it
        const allExpenses = expenseRepository.getAllExpenses(1, 0);
        let nextNumber = 1;
        if (allExpenses.length > 0) {
            const lastExpense = allExpenses[0];
            if (lastExpense.expense_number && lastExpense.expense_number.startsWith(prefix)) {
                const numPart = parseInt(lastExpense.expense_number.split('-')[2], 10);
                if (!isNaN(numPart)) {
                    nextNumber = numPart + 1;
                }
            }
        }
        const expenseNumber = `${prefix}${String(nextNumber).padStart(4, '0')}`;

        // Set default date to today if not provided
        const expenseDate = expenseData.expense_date || new Date().toISOString().split('T')[0];

        return expenseRepository.createExpense({
            ...expenseData,
            expense_number: expenseNumber,
            expense_date: expenseDate,
            created_by: expenseData.created_by || 1 // Default to admin if not provided
        });
    }

    updateExpense(id, expenseData) {
        const existing = this.getExpense(id);
        if (!existing) throw new Error('Expense not found');

        return expenseRepository.updateExpense(id, expenseData);
    }

    deleteExpense(id) {
        return expenseRepository.deleteExpense(id);
    }

    getTotalExpenses(startDate, endDate) {
        return expenseRepository.getTotalExpensesForDateRange(startDate, endDate);
    }
}

module.exports = new ExpenseService();