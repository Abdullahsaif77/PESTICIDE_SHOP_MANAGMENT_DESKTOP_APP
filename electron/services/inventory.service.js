const InventoryRepository = require("../repositories/inventory.repository")
const ProductRepository = require("../repositories/product.repository")
const WarehouseRepository = require("../repositories/warehouse.repository")
const BatchRepository = require("../repositories/batch.repository")

class InventoryService {
    async addStock(productId, warehouseId, batchId, quantity) {
        try {
            // Validations
            if (!productId) {
                return { success: false, error: 'Product ID is required' }
            }
            if (!warehouseId) {
                return { success: false, error: 'Warehouse ID is required' }
            }
            if (!quantity || quantity <= 0) {
                return { success: false, error: 'Quantity must be greater than 0' }
            }

            // Check if product exists
            const product = await ProductRepository.getById(productId)
            if (!product) {
                return { success: false, error: 'Product not found' }
            }

            // Check if warehouse exists
            const warehouse = await WarehouseRepository.getById(warehouseId)
            if (!warehouse.success || !warehouse.data) {
                return { success: false, error: 'Warehouse not found' }
            }

            // Check if batch exists (if provided)
            if (batchId) {
                const batch = await BatchRepository.getById(batchId)
                if (!batch) {
                    return { success: false, error: 'Batch not found' }
                }
                // Update batch quantity
                await BatchRepository.updateQuantity(batchId, batch.quantity + quantity)
            }

            // Check if inventory record exists
            const existingInventory = await InventoryRepository.getByProductAndWarehouse(productId, warehouseId)
            let inventoryRecord = existingInventory.find(item => item.batch_id === batchId || (!item.batch_id && !batchId))

            if (inventoryRecord) {
                // Update existing inventory
                const newQuantity = inventoryRecord.quantity + quantity
                const result = await InventoryRepository.updateQuantity(inventoryRecord.id, newQuantity)
                if (result.changes === 0) {
                    return { success: false, error: 'Failed to update inventory' }
                }
            } else {
                // Create new inventory record
                const result = await InventoryRepository.create({
                    product_id: productId,
                    warehouse_id: warehouseId,
                    batch_id: batchId || null,
                    quantity: quantity
                })
                if (!result.lastInsertRowid) {
                    return { success: false, error: 'Failed to create inventory record' }
                }
            }

            // Update product stock quantity
            await ProductRepository.updateStockQuantity(productId)

            return {
                success: true,
                message: `Added ${quantity} units to inventory`
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async removeStock(productId, warehouseId, batchId, quantity) {
        try {
            // Validations
            if (!productId) {
                return { success: false, error: 'Product ID is required' }
            }
            if (!warehouseId) {
                return { success: false, error: 'Warehouse ID is required' }
            }
            if (!quantity || quantity <= 0) {
                return { success: false, error: 'Quantity must be greater than 0' }
            }

            // Check if product exists
            const product = await ProductRepository.getById(productId)
            if (!product) {
                return { success: false, error: 'Product not found' }
            }

            // Get inventory record
            const existingInventory = await InventoryRepository.getByProductAndWarehouse(productId, warehouseId)
            let inventoryRecord = existingInventory.find(item => 
                (item.batch_id === batchId) || (!item.batch_id && !batchId)
            )

            if (!inventoryRecord) {
                return { success: false, error: 'No inventory record found' }
            }

            const availableQuantity = inventoryRecord.quantity - inventoryRecord.reserved_quantity
            if (availableQuantity < quantity) {
                return {
                    success: false,
                    error: `Insufficient stock. Available: ${availableQuantity}, Requested: ${quantity}`
                }
            }

            // Update inventory quantity
            const newQuantity = inventoryRecord.quantity - quantity
            const result = await InventoryRepository.updateQuantity(inventoryRecord.id, newQuantity)
            if (result.changes === 0) {
                return { success: false, error: 'Failed to remove stock' }
            }

            // Update batch quantity if batch exists
            if (batchId) {
                const batch = await BatchRepository.getById(batchId)
                if (batch) {
                    await BatchRepository.updateQuantity(batchId, batch.quantity - quantity)
                }
            }

            // Update product stock quantity
            await ProductRepository.updateStockQuantity(productId)

            return {
                success: true,
                message: `Removed ${quantity} units from inventory`
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async reserveStock(productId, warehouseId, batchId, quantity) {
        try {
            if (!productId) {
                return { success: false, error: 'Product ID is required' }
            }
            if (!warehouseId) {
                return { success: false, error: 'Warehouse ID is required' }
            }
            if (!quantity || quantity <= 0) {
                return { success: false, error: 'Quantity must be greater than 0' }
            }

            // Get inventory record
            const existingInventory = await InventoryRepository.getByProductAndWarehouse(productId, warehouseId)
            let inventoryRecord = existingInventory.find(item => 
                (item.batch_id === batchId) || (!item.batch_id && !batchId)
            )

            if (!inventoryRecord) {
                return { success: false, error: 'No inventory record found' }
            }

            const availableQuantity = inventoryRecord.quantity - inventoryRecord.reserved_quantity
            if (availableQuantity < quantity) {
                return {
                    success: false,
                    error: `Insufficient stock for reservation. Available: ${availableQuantity}, Requested: ${quantity}`
                }
            }

            const result = await InventoryRepository.reserveStock(inventoryRecord.id, quantity)
            if (result.changes === 0) {
                return { success: false, error: 'Failed to reserve stock' }
            }

            return {
                success: true,
                message: `Reserved ${quantity} units successfully`
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async releaseReservedStock(productId, warehouseId, batchId, quantity) {
        try {
            if (!productId) {
                return { success: false, error: 'Product ID is required' }
            }
            if (!warehouseId) {
                return { success: false, error: 'Warehouse ID is required' }
            }
            if (!quantity || quantity <= 0) {
                return { success: false, error: 'Quantity must be greater than 0' }
            }

            // Get inventory record
            const existingInventory = await InventoryRepository.getByProductAndWarehouse(productId, warehouseId)
            let inventoryRecord = existingInventory.find(item => 
                (item.batch_id === batchId) || (!item.batch_id && !batchId)
            )

            if (!inventoryRecord) {
                return { success: false, error: 'No inventory record found' }
            }

            if (inventoryRecord.reserved_quantity < quantity) {
                return {
                    success: false,
                    error: `Cannot release more than reserved. Reserved: ${inventoryRecord.reserved_quantity}, Requested: ${quantity}`
                }
            }

            const result = await InventoryRepository.releaseReservedStock(inventoryRecord.id, quantity)
            if (result.changes === 0) {
                return { success: false, error: 'Failed to release reserved stock' }
            }

            return {
                success: true,
                message: `Released ${quantity} reserved units successfully`
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async getInventoryByProduct(productId) {
        try {
            const inventory = await InventoryRepository.getByProduct(productId)
            return {
                success: true,
                data: inventory,
                count: inventory.length
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async getInventoryByWarehouse(warehouseId) {
        try {
            const inventory = await InventoryRepository.getByWarehouse(warehouseId)
            return {
                success: true,
                data: inventory,
                count: inventory.length
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async getProductStockInWarehouse(productId, warehouseId) {
        try {
            const inventory = await InventoryRepository.getByProductAndWarehouse(productId, warehouseId)
            const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0)
            const totalReserved = inventory.reduce((sum, item) => sum + item.reserved_quantity, 0)
            const totalAvailable = totalQuantity - totalReserved

            return {
                success: true,
                data: {
                    product_id: productId,
                    warehouse_id: warehouseId,
                    total_quantity: totalQuantity,
                    reserved_quantity: totalReserved,
                    available_quantity: totalAvailable,
                    batches: inventory
                }
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async getLowStock() {
        try {
            const lowStock = await InventoryRepository.getLowStock()
            return {
                success: true,
                data: lowStock,
                count: lowStock.length,
                message: `${lowStock.length} items below reorder level`
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async getStockValue() {
        try {
            const stmt = require("../database/database").prepare(`
                SELECT 
                    SUM(i.quantity * p.purchase_price) as total_purchase_value,
                    SUM(i.quantity * p.sale_price) as total_sale_value,
                    SUM(i.quantity) as total_quantity,
                    COUNT(DISTINCT i.product_id) as unique_products
                FROM inventory i
                LEFT JOIN products p ON i.product_id = p.id
                WHERE i.quantity > 0
            `)
            const result = stmt.get()

            return {
                success: true,
                data: {
                    total_purchase_value: result.total_purchase_value || 0,
                    total_sale_value: result.total_sale_value || 0,
                    total_quantity: result.total_quantity || 0,
                    unique_products: result.unique_products || 0
                }
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async updateMinMax(productId, warehouseId, minStock, maxStock) {
        try {
            if (!productId) {
                return { success: false, error: 'Product ID is required' }
            }
            if (!warehouseId) {
                return { success: false, error: 'Warehouse ID is required' }
            }
            if (minStock !== undefined && minStock < 0) {
                return { success: false, error: 'Min stock cannot be negative' }
            }
            if (maxStock !== undefined && maxStock < 0) {
                return { success: false, error: 'Max stock cannot be negative' }
            }
            if (minStock !== undefined && maxStock !== undefined && minStock > maxStock) {
                return { success: false, error: 'Min stock cannot be greater than max stock' }
            }

            // Get inventory record
            const existingInventory = await InventoryRepository.getByProductAndWarehouse(productId, warehouseId)
            
            if (existingInventory.length === 0) {
                // Create inventory record with min/max
                const result = await InventoryRepository.create({
                    product_id: productId,
                    warehouse_id: warehouseId,
                    quantity: 0,
                    min_stock: minStock || 0,
                    max_stock: maxStock || 0
                })
                if (!result.lastInsertRowid) {
                    return { success: false, error: 'Failed to create inventory record' }
                }
            } else {
                // Update existing inventory
                const record = existingInventory[0]
                await InventoryRepository.update(record.id, {
                    min_stock: minStock,
                    max_stock: maxStock
                })
            }

            // Update product reorder level if min stock is set
            if (minStock !== undefined) {
                await ProductRepository.update(parseInt(productId), { reorder_level: minStock })
            }

            return {
                success: true,
                message: 'Min/Max stock levels updated successfully'
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async getInventorySummary() {
        try {
            const summary = await InventoryRepository.getStockSummary()
            return {
                success: true,
                data: summary || {
                    total_products: 0,
                    total_quantity: 0,
                    total_reserved: 0,
                    total_available: 0,
                    total_warehouses: 0,
                    low_stock_items: 0
                }
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async getDetailedWarehouseInventory(warehouseId) {
        try {
            const inventory = await InventoryRepository.getDetailedWarehouseInventory(warehouseId)
            return {
                success: true,
                data: inventory,
                count: inventory.length
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async getAvailableQuantity(productId, warehouseId) {
        try {
            const quantity = await InventoryRepository.getAvailableQuantity(productId, warehouseId)
            return {
                success: true,
                data: { available_quantity: quantity }
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }
}

module.exports = new InventoryService()