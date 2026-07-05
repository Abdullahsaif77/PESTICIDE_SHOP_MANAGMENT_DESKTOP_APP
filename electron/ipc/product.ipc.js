// electron/ipc/product.ipc.js

const { ipcMain } = require("electron");
const productService = require("../services/product.service");

function registerProductIPC() {
    // ==================== PRODUCT HANDLERS ====================
    ipcMain.handle("product:get", () => {
        try {
            return productService.getProducts();
        } catch (error) {
            return { success: false, error: error.message, data: [] };
        }
    });

    ipcMain.handle("product:getById", (event, id) => {
        try {
            return productService.getProductById(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("product:getByCode", (event, code) => {
        try {
            return productService.getProductByCode(code);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("product:search", (event, query) => {
        try {
            return productService.searchProducts(query);
        } catch (error) {
            return { success: false, error: error.message, data: [] };
        }
    });

    ipcMain.handle("product:add", async (event, data) => {
        try {
            return productService.createProduct(data);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("product:update", async (event, id, data) => {
        try {
            return productService.updateProduct(id, data);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("product:delete", (event, id) => {
        try {
            return productService.deleteProduct(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("product:getByCategory", (event, category_id) => {
        try {
            return productService.getProductsByCategory(category_id);
        } catch (error) {
            return { success: false, error: error.message, data: [] };
        }
    });

    ipcMain.handle("product:getByUnit", (event, unit_id) => {
        try {
            return productService.getProductsByUnit(unit_id);
        } catch (error) {
            return { success: false, error: error.message, data: [] };
        }
    });

    // ==================== PRODUCT STOCK HANDLERS ====================
    ipcMain.handle("product:updateStockQuantity", async (event, productId) => {
        try {
            return productService.updateStockQuantity(productId);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("product:getStockQuantity", (event, productId) => {
        try {
            return productService.getStockQuantity(productId);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("product:getLowStock", (event, threshold) => {
        try {
            return productService.getLowStock(threshold || 10);
        } catch (error) {
            return { success: false, error: error.message, data: [] };
        }
    });

    ipcMain.handle("product:getStats", () => {
        try {
            return productService.getStats();
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== CATEGORY HANDLERS ====================
    ipcMain.handle("category:get", () => {
        try {
            return productService.getCategories();
        } catch (error) {
            return { success: false, error: error.message, data: [] };
        }
    });

    ipcMain.handle("category:getById", (event, id) => {
        try {
            return productService.getCategoryById(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("category:add", async (event, data) => {
        try {
            return productService.createCategory(data);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("category:update", (event, id, data) => {
        try {
            return productService.updateCategory(id, data);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("category:delete", (event, id) => {
        try {
            return productService.deleteCategory(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("category:getProductCount", (event, id) => {
        try {
            return productService.getCategoryProductCount(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ==================== UNIT HANDLERS ====================
    ipcMain.handle("unit:get", () => {
        try {
            return productService.getUnits();
        } catch (error) {
            return { success: false, error: error.message, data: [] };
        }
    });

    ipcMain.handle("unit:getById", (event, id) => {
        try {
            return productService.getUnitById(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("unit:add", async (event, data) => {
        try {
            return productService.createUnit(data);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("unit:update", (event, id, data) => {
        try {
            return productService.updateUnit(id, data);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("unit:delete", (event, id) => {
        try {
            return productService.deleteUnit(id);
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
}

module.exports = { registerProductIPC };