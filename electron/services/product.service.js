// electron/services/product.service.js

const ProductRepository = require("../repositories/product.repository");

class ProductService {
    // ==================== PRODUCT METHODS ====================
    getProducts() {
        try {
            const products = ProductRepository.getAll();
            console.log('📦 [Service] Products fetched:', products?.length || 0);
            return { success: true, data: products || [] };
        } catch (error) {
            console.error('❌ [Service] Error fetching products:', error);
            return { success: false, data: [], error: error.message };
        }
    }

    getActiveProducts() {
        try {
            const products = ProductRepository.getActive();
            return { success: true, data: products || [] };
        } catch (error) {
            console.error('Error fetching active products:', error);
            return { success: false, data: [], error: error.message };
        }
    }

    getProductById(id) {
        if (!id) throw new Error("Product ID required");
        try {
            const product = ProductRepository.getById(id);
            return { success: true, data: product };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    getProductByCode(code) {
        if (!code) throw new Error("Product code required");
        try {
            const product = ProductRepository.getByCode(code);
            return { success: true, data: product };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    searchProducts(query) {
        if (!query) throw new Error("Search query required");
        try {
            const products = ProductRepository.search(query);
            return { success: true, data: products || [] };
        } catch (error) {
            return { success: false, data: [], error: error.message };
        }
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

        if (code) {
            const existingByCode = ProductRepository.getByCode(code);
            if (existingByCode) {
                throw new Error(`Product code "${code}" already exists`);
            }
        }

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
        
        const existing = ProductRepository.getById(id);
        if (!existing) {
            throw new Error("Product not found");
        }
        
        if (data.code) {
            const existingByCode = ProductRepository.getByCode(data.code);
            if (existingByCode && existingByCode.id !== id) {
                throw new Error(`Product code "${data.code}" already exists`);
            }
        }
        
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
        try {
            const result = ProductRepository.delete(id);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    updateStock(id, quantity) {
        if (!id) throw new Error("Product ID required");
        if (quantity === undefined || quantity === null) throw new Error("Quantity required");
        try {
            const result = ProductRepository.updateStock(id, quantity);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    toggleProductActive(id) {
        if (!id) throw new Error("Product ID required");
        try {
            const result = ProductRepository.toggleActive(id);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    getProductsByCategory(category_id) {
        if (!category_id) throw new Error("Category ID required");
        try {
            const products = ProductRepository.getByCategory(category_id);
            return { success: true, data: products || [] };
        } catch (error) {
            return { success: false, data: [], error: error.message };
        }
    }

    getProductsByUnit(unit_id) {
        if (!unit_id) throw new Error("Unit ID required");
        try {
            const products = ProductRepository.getByUnit(unit_id);
            return { success: true, data: products || [] };
        } catch (error) {
            return { success: false, data: [], error: error.message };
        }
    }

    getLowStock(threshold = 10) {
        try {
            const products = ProductRepository.getLowStock(threshold);
            return { success: true, data: products || [] };
        } catch (error) {
            return { success: false, data: [], error: error.message };
        }
    }

    updateStockQuantity(productId) {
        if (!productId) throw new Error("Product ID required");
        try {
            const result = ProductRepository.updateStockQuantity(productId);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    getStockQuantity(productId) {
        if (!productId) throw new Error("Product ID required");
        try {
            const quantity = ProductRepository.getStockQuantity(productId);
            return { success: true, data: quantity };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== CATEGORY METHODS ====================
    createCategory(data) {
        const { name, description } = data;
        if (!name) throw new Error("Category name required");
        try {
            const category = ProductRepository.createCategory(name, description || null);
            return {
                success: true,
                data: category,
                message: 'Category created successfully'
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    getCategories() {
        try {
            const categories = ProductRepository.getAllCategories();
            console.log('📦 [Service] Categories fetched from DB:', categories);
            console.log('📦 [Service] Categories count:', categories?.length || 0);
            return { success: true, data: categories || [] };
        } catch (error) {
            console.error('❌ [Service] Error fetching categories:', error);
            return { success: false, data: [], error: error.message };
        }
    }

    getCategoryById(id) {
        if (!id) throw new Error("Category ID required");
        try {
            const category = ProductRepository.getCategoryById(id);
            return { success: true, data: category };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    updateCategory(id, data) {
        if (!id) throw new Error("Category ID required");
        try {
            const category = ProductRepository.updateCategory(id, data);
            return { success: true, data: category };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    deleteCategory(id) {
        if (!id) throw new Error("Category ID required");
        try {
            const result = ProductRepository.deleteCategory(id);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    getCategoryProductCount(category_id) {
        if (!category_id) throw new Error("Category ID required");
        try {
            const count = ProductRepository.getCategoryProductCount(category_id);
            return { success: true, data: count };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== UNIT METHODS ====================
    createUnit(data) {
        const { name, abbreviation } = data;
        if (!name) throw new Error("Unit name required");
        try {
            const unit = ProductRepository.createUnit(name, abbreviation || null);
            return {
                success: true,
                data: unit,
                message: 'Unit created successfully'
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    getUnits() {
        try {
            const units = ProductRepository.getAllUnits();
            console.log('📦 [Service] Units fetched from DB:', units);
            console.log('📦 [Service] Units count:', units?.length || 0);
            return { success: true, data: units || [] };
        } catch (error) {
            console.error('❌ [Service] Error fetching units:', error);
            return { success: false, data: [], error: error.message };
        }
    }

    getUnitById(id) {
        if (!id) throw new Error("Unit ID required");
        try {
            const unit = ProductRepository.getUnitById(id);
            return { success: true, data: unit };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    updateUnit(id, data) {
        if (!id) throw new Error("Unit ID required");
        try {
            const unit = ProductRepository.updateUnit(id, data);
            return { success: true, data: unit };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    deleteUnit(id) {
        if (!id) throw new Error("Unit ID required");
        try {
            const result = ProductRepository.deleteUnit(id);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== EXPORT ====================
    exportData(filters = {}) {
        try {
            const data = ProductRepository.exportData(filters);
            return { success: true, data: data || [] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== STATS ====================
    getStats() {
        try {
            const stats = ProductRepository.getStats();
            return { success: true, data: stats };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = new ProductService();