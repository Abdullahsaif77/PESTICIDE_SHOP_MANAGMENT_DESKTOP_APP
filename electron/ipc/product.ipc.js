// electron/ipc/product.ipc.js

const { ipcMain } = require("electron");
const productService = require("../services/product.service");

function registerProductIPC() {
    // ==================== PRODUCT HANDLERS ====================
    ipcMain.handle("product:get", () => {
        try {
            return productService.getProducts();
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("product:getById", (event, id) => {
        try {
            const result = productService.getProductById(id);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("product:getByCode", (event, code) => {
        try {
            const result = productService.getProductByCode(code);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("product:search", (event, query) => {
        try {
            const result = productService.searchProducts(query);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("product:add", async (event, data) => {
        try {
            const result = productService.createProduct(data);
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("product:update", async (event, id, data) => {
        try {
            const result = productService.updateProduct(id, data);
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("product:delete", (event, id) => {
        try {
            const result = productService.deleteProduct(id);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("product:getByCategory", (event, category_id) => {
        try {
            const result = productService.getProductsByCategory(category_id);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("product:getByUnit", (event, unit_id) => {
        try {
            const result = productService.getProductsByUnit(unit_id);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== PRODUCT STOCK HANDLERS ====================
    ipcMain.handle("product:updateStockQuantity", async (event, productId) => {
        try {
            const result = productService.updateStockQuantity(productId);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("product:getStockQuantity", (event, productId) => {
        try {
            const result = productService.getStockQuantity(productId);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("product:getLowStock", (event, threshold) => {
        try {
            const result = productService.getLowStock(threshold || 10);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("product:getStats", () => {
        try {
            const result = productService.getStats();
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== CATEGORY HANDLERS ====================
    ipcMain.handle("category:get", () => {
        try {
            const result = productService.getCategories();
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("category:getById", (event, id) => {
        try {
            const result = productService.getCategoryById(id);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("category:add", async (event, data) => {
        try {
            const result = productService.createCategory(data);
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("category:update", (event, id, data) => {
        try {
            const result = productService.updateCategory(id, data);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("category:delete", (event, id) => {
        try {
            const result = productService.deleteCategory(id);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("category:getProductCount", (event, id) => {
        try {
            const result = productService.getCategoryProductCount(id);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== UNIT HANDLERS ====================
    ipcMain.handle("unit:get", () => {
        try {
            const result = productService.getUnits();
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("unit:getById", (event, id) => {
        try {
            const result = productService.getUnitById(id);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("unit:add", async (event, data) => {
        try {
            const result = productService.createUnit(data);
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("unit:update", (event, id, data) => {
        try {
            const result = productService.updateUnit(id, data);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("unit:delete", (event, id) => {
        try {
            const result = productService.deleteUnit(id);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
}

module.exports = { registerProductIPC };