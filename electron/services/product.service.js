// electron/services/product.service.js

const ProductRepository = require("../repositories/product.repository");

class ProductService {
    // ==================== PRODUCT METHODS ====================
    getProducts() {
        return ProductRepository.getAll();
    }

    getActiveProducts() {
        return ProductRepository.getActive();
    }

    getProductById(id) {
        if (!id) throw new Error("Product ID required");
        return ProductRepository.getById(id);
    }

    getProductByCode(code) {
        if (!code) throw new Error("Product code required");
        return ProductRepository.getByCode(code);
    }

    searchProducts(query) {
        if (!query) throw new Error("Search query required");
        return ProductRepository.search(query);
    }

    createProduct(data) {
        const { 
            name, category_id, unit_id, purchase_price, sale_price,
            code, brand, barcode, description, stock_quantity, reorder_level
        } = data;
        
        if (!name) throw new Error("Name required");
        if (!category_id) throw new Error("Category is required");
        if (!unit_id) throw new Error("Unit is required");
        if (!purchase_price || purchase_price <= 0) throw new Error("Purchase price invalid");
        if (!sale_price || sale_price <= 0) throw new Error("Sale price invalid");

        // Check for duplicate code (if provided)
        if (code) {
            const existingByCode = ProductRepository.getByCode(code);
            if (existingByCode) {
                throw new Error(`Product code "${code}" already exists`);
            }
        }

        // Check for duplicate barcode (if provided)
        if (barcode) {
            const existingByBarcode = ProductRepository.getByBarcode(barcode);
            if (existingByBarcode) {
                throw new Error(`Barcode "${barcode}" already exists`);
            }
        }

        const product = ProductRepository.create(
            name, category_id, unit_id, purchase_price, sale_price,
            code, brand, barcode, description, stock_quantity || 0, reorder_level || 0
        );
        
        return {
            success: true,
            data: product,
            message: 'Product created successfully'
        };
    }

    updateProduct(id, data) {
        if (!id) throw new Error("Product ID required");
        
        // Check if product exists
        const existing = ProductRepository.getById(id);
        if (!existing) {
            throw new Error("Product not found");
        }
        
        // Check for duplicate code (if provided and changed)
        if (data.code) {
            const existingByCode = ProductRepository.getByCode(data.code);
            if (existingByCode && existingByCode.id !== id) {
                throw new Error(`Product code "${data.code}" already exists`);
            }
        }
        
        // Check for duplicate barcode (if provided and changed)
        if (data.barcode) {
            const existingByBarcode = ProductRepository.getByBarcode(data.barcode);
            if (existingByBarcode && existingByBarcode.id !== id) {
                throw new Error(`Barcode "${data.barcode}" already exists`);
            }
        }
        
        const product = ProductRepository.update(id, data);
        if (!product) {
            throw new Error("Failed to update product");
        }
        
        return {
            success: true,
            data: product,
            message: 'Product updated successfully'
        };
    }

    deleteProduct(id) {
        if (!id) throw new Error("Product ID required");
        return ProductRepository.delete(id);
    }

    updateStock(id, quantity) {
        if (!id) throw new Error("Product ID required");
        if (quantity === undefined || quantity === null) throw new Error("Quantity required");
        return ProductRepository.updateStock(id, quantity);
    }

    toggleProductActive(id) {
        if (!id) throw new Error("Product ID required");
        return ProductRepository.toggleActive(id);
    }

    getProductsByCategory(category_id) {
        if (!category_id) throw new Error("Category ID required");
        return ProductRepository.getByCategory(category_id);
    }

    getProductsByUnit(unit_id) {
        if (!unit_id) throw new Error("Unit ID required");
        return ProductRepository.getByUnit(unit_id);
    }

    getLowStock(threshold = 10) {
        return ProductRepository.getLowStock(threshold);
    }

    // ==================== ✅ NEW METHOD: Update Stock Quantity ====================
    updateStockQuantity(productId) {
        if (!productId) throw new Error("Product ID required");
        return ProductRepository.updateStockQuantity(productId);
    }

    // ==================== ✅ NEW METHOD: Get Stock Quantity ====================
    getStockQuantity(productId) {
        if (!productId) throw new Error("Product ID required");
        return ProductRepository.getStockQuantity(productId);
    }

    // ==================== CATEGORY METHODS ====================
    createCategory(data) {
        const { name, description } = data;
        if (!name) throw new Error("Category name required");
        const category = ProductRepository.createCategory(name, description || null);
        return {
            success: true,
            data: category,
            message: 'Category created successfully'
        };
    }

    getCategories() {
        return ProductRepository.getAllCategories();
    }

    getCategoryById(id) {
        if (!id) throw new Error("Category ID required");
        return ProductRepository.getCategoryById(id);
    }

    updateCategory(id, data) {
        if (!id) throw new Error("Category ID required");
        return ProductRepository.updateCategory(id, data);
    }

    deleteCategory(id) {
        if (!id) throw new Error("Category ID required");
        return ProductRepository.deleteCategory(id);
    }

    getCategoryProductCount(category_id) {
        if (!category_id) throw new Error("Category ID required");
        return ProductRepository.getCategoryProductCount(category_id);
    }

    // ==================== UNIT METHODS ====================
    createUnit(data) {
        const { name, abbreviation } = data;
        if (!name) throw new Error("Unit name required");
        const unit = ProductRepository.createUnit(name, abbreviation || null);
        return {
            success: true,
            data: unit,
            message: 'Unit created successfully'
        };
    }

    getUnits() {
        return ProductRepository.getAllUnits();
    }

    getUnitById(id) {
        if (!id) throw new Error("Unit ID required");
        return ProductRepository.getUnitById(id);
    }

    updateUnit(id, data) {
        if (!id) throw new Error("Unit ID required");
        return ProductRepository.updateUnit(id, data);
    }

    deleteUnit(id) {
        if (!id) throw new Error("Unit ID required");
        return ProductRepository.deleteUnit(id);
    }

    // ==================== EXPORT ====================
    exportData(filters = {}) {
        return ProductRepository.exportData(filters);
    }

    // ==================== STATS ====================
    getStats() {
        return ProductRepository.getStats();
    }
}

module.exports = new ProductService();