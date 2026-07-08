// electron/ipc/expenseHandlers.js
const { ipcMain } = require('electron');
const expenseService = require("../services/expense.service")

function registerExpenseHandlers() {
    
    // === CATEGORY HANDLERS ===
    ipcMain.handle('expense:getCategories', (event, includeInactive = false) => {
        try {
            return expenseService.getCategories(includeInactive);
        } catch (error) {
            console.error('Error in expense:getCategories:', error);
            throw error;
        }
    });

    ipcMain.handle('expense:createCategory', (event, data) => {
        try {
            return expenseService.createCategory(data.name, data.description);
        } catch (error) {
            console.error('Error in expense:createCategory:', error);
            throw error;
        }
    });

    ipcMain.handle('expense:updateCategory', (event, data) => {
        try {
            return expenseService.updateCategory(data.id, data.name, data.description, data.is_active);
        } catch (error) {
            console.error('Error in expense:updateCategory:', error);
            throw error;
        }
    });

    // === EXPENSE HANDLERS ===
    ipcMain.handle('expense:getAll', (event, limit = 100, offset = 0) => {
        try {
            return expenseService.getExpenses(limit, offset);
        } catch (error) {
            console.error('Error in expense:getAll:', error);
            throw error;
        }
    });

    ipcMain.handle('expense:getById', (event, id) => {
        try {
            return expenseService.getExpense(id);
        } catch (error) {
            console.error('Error in expense:getById:', error);
            throw error;
        }
    });

    ipcMain.handle('expense:create', (event, data) => {
        try {
            return expenseService.createExpense(data);
        } catch (error) {
            console.error('Error in expense:create:', error);
            throw error;
        }
    });

    ipcMain.handle('expense:update', (event, data) => {
        try {
            return expenseService.updateExpense(data.id, data);
        } catch (error) {
            console.error('Error in expense:update:', error);
            throw error;
        }
    });

    ipcMain.handle('expense:delete', (event, id) => {
        try {
            return expenseService.deleteExpense(id);
        } catch (error) {
            console.error('Error in expense:delete:', error);
            throw error;
        }
    });
    
    ipcMain.handle('expense:getTotal', (event, startDate, endDate) => {
        try {
            return expenseService.getTotalExpenses(startDate, endDate);
        } catch (error) {
            console.error('Error in expense:getTotal:', error);
            throw error;
        }
    });
}

module.exports = { registerExpenseHandlers };