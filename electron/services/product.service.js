const ProductRepository = require("../repositories/product.repository")

class ProductService {
    getProducts() {
        return ProductRepository.getAll()
    }

    getActiveProducts() {
        return ProductRepository.getActive()
    }

    getProductById(id) {
        if (!id) throw new Error("Product ID required")
        return ProductRepository.getById(id)
    }

    getProductByCode(code) {
        if (!code) throw new Error("Product code required")
        return ProductRepository.getByCode(code)
    }


    searchProducts(query) {
        if (!query) throw new Error("Search query required")
        return ProductRepository.search(query)
    }

    createProduct(data) {
        const { 
            name, category_id, unit_id, purchase_price, sale_price,
            code, brand, barcode, description, stock_quantity, reorder_level
        } = data
        
        if (!name) throw new Error("Name required")
        if (!category_id) throw new Error("Category is required")
        if (!unit_id) throw new Error("Unit is required")
        if (!purchase_price || purchase_price <= 0) throw new Error("Purchase price invalid")
        if (!sale_price || sale_price <= 0) throw new Error("Sale price invalid")

        return ProductRepository.create(
            name, category_id, unit_id, purchase_price, sale_price,
            code, brand, barcode, description, stock_quantity || 0, reorder_level || 0
        )
    }

    updateProduct(id, data) {
        if (!id) throw new Error("Product ID required")
        return ProductRepository.update(id, data)
    }

    deleteProduct(id) {
        if (!id) throw new Error("Product ID required")
        return ProductRepository.delete(id)
    }

    updateStock(id, quantity) {
        if (!id) throw new Error("Product ID required")
        if (quantity === undefined || quantity === null) throw new Error("Quantity required")
        return ProductRepository.updateStock(id, quantity)
    }

    toggleProductActive(id) {
        if (!id) throw new Error("Product ID required")
        return ProductRepository.toggleActive(id)
    }

    getProductsByCategory(category_id) {
        if (!category_id) throw new Error("Category ID required")
        return ProductRepository.getByCategory(category_id)
    }

    getProductsByUnit(unit_id) {
        if (!unit_id) throw new Error("Unit ID required")
        return ProductRepository.getByUnit(unit_id)
    }

    // --- CATEGORY METHODS ---
    createCategory(data) {
        const { name } = data
        if (!name) throw new Error("Category name required")
        return ProductRepository.createCategory(name)
    }

    getCategories() {
        return ProductRepository.getAllCategories()
    }

    getCategoryById(id) {
        if (!id) throw new Error("Category ID required")
        return ProductRepository.getCategoryById(id)
    }

    updateCategory(id, data) {
        if (!id) throw new Error("Category ID required")
        return ProductRepository.updateCategory(id, data)
    }

    deleteCategory(id) {
        if (!id) throw new Error("Category ID required")
        return ProductRepository.deleteCategory(id)
    }

    // --- UNIT METHODS ---
    createUnit(data) {
        const { name } = data
        if (!name) throw new Error("Unit name required")
        return ProductRepository.createUnit(name)
    }

    getUnits() {
        return ProductRepository.getAllUnits()
    }

    getUnitById(id) {
        if (!id) throw new Error("Unit ID required")
        return ProductRepository.getUnitById(id)
    }

    updateUnit(id, data) {
        if (!id) throw new Error("Unit ID required")
        return ProductRepository.updateUnit(id, data)
    }

    deleteUnit(id) {
        if (!id) throw new Error("Unit ID required")
        return ProductRepository.deleteUnit(id)
    }
}

module.exports = new ProductService()