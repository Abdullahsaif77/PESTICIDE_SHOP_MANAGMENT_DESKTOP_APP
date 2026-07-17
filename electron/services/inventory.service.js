// electron/services/inventory.service.js

const InventoryRepository = require("../repositories/inventory.repository");
const ProductRepository = require("../repositories/product.repository");
const WarehouseRepository = require("../repositories/warehouse.repository");
const BatchRepository = require("../repositories/batch.repository");
const db = require("../database/database");

class InventoryService {
    // ==================== ADD STOCK ====================
    async addStock({ productId, warehouseId, batchId, quantity }) {
        try {
            console.log('🟢 addStock called:', { productId, warehouseId, batchId, quantity });

            // Validations
            if (!productId) {
                return { success: false, error: 'Product ID is required' };
            }
            if (!warehouseId) {
                return { success: false, error: 'Warehouse ID is required' };
            }
            if (!quantity || quantity <= 0) {
                return { success: false, error: 'Quantity must be greater than 0' };
            }

            // Check if product exists
            const product = await ProductRepository.getById(productId);
            if (!product) {
                return { success: false, error: 'Product not found' };
            }

            // Check if warehouse exists
            const warehouse = await WarehouseRepository.getById(warehouseId);
            if (!warehouse) {
                return { success: false, error: 'Warehouse not found' };
            }

            // Check if batch exists (if provided)
            if (batchId) {
                const batch = await BatchRepository.getById(batchId);
                if (!batch) {
                    return { success: false, error: 'Batch not found' };
                }
                await BatchRepository.updateQuantity(batchId, (batch.quantity || 0) + quantity);
            }

            // Check if inventory record exists
            const existingInventory = await this.getInventoryByProductAndWarehouse(productId, warehouseId);
            
            let inventoryRecord = null;
            if (existingInventory && existingInventory.id) {
                // Check if we have a record with this batch_id
                if (batchId) {
                    // Find record with matching batch_id
                    const allRecords = await InventoryRepository.getByProductAndWarehouse(productId, warehouseId);
                    inventoryRecord = allRecords.find(item => item.batch_id === batchId);
                } else {
                    // Find record with null batch_id
                    const allRecords = await InventoryRepository.getByProductAndWarehouse(productId, warehouseId);
                    inventoryRecord = allRecords.find(item => item.batch_id === null);
                }
            }

            if (inventoryRecord) {
                // Update existing inventory
                const newQuantity = (inventoryRecord.quantity || 0) + quantity;
                const result = await InventoryRepository.updateQuantity(inventoryRecord.id, newQuantity);
                if (result.changes === 0) {
                    return { success: false, error: 'Failed to update inventory' };
                }
                console.log(`✅ Updated inventory record ${inventoryRecord.id}: ${newQuantity}`);
            } else {
                // Create new inventory record
                const result = await InventoryRepository.create({
                    product_id: productId,
                    warehouse_id: warehouseId,
                    batch_id: batchId || null,
                    quantity: quantity,
                    reserved_quantity: 0,
                    min_stock: 0,
                    max_stock: 0
                });
                if (!result.lastInsertRowid) {
                    return { success: false, error: 'Failed to create inventory record' };
                }
                console.log(`✅ Created inventory record with ID: ${result.lastInsertRowid}`);
            }

            // Update product stock quantity
            await ProductRepository.updateStockQuantity(productId);

            return {
                success: true,
                message: `Added ${quantity} units to inventory`
            };
        } catch (error) {
            console.error('🔴 addStock error:', error);
            return { success: false, error: error.message };
        }
    }

    // ==================== REMOVE STOCK ====================
    async removeStock({ productId, warehouseId, batchId, quantity }) {
        try {
            console.log('🔴 removeStock called:', { productId, warehouseId, batchId, quantity });

            // Validations
            if (!productId) {
                return { success: false, error: 'Product ID is required' };
            }
            if (!warehouseId) {
                return { success: false, error: 'Warehouse ID is required' };
            }
            if (!quantity || quantity <= 0) {
                return { success: false, error: 'Quantity must be greater than 0' };
            }

            // Check if product exists
            const product = await ProductRepository.getById(productId);
            if (!product) {
                return { success: false, error: 'Product not found' };
            }

            // Get inventory records
            const existingInventory = await InventoryRepository.getByProductAndWarehouse(productId, warehouseId);
            console.log('🔍 Existing inventory records:', existingInventory);

            let inventoryRecord = null;
            
            // Find the specific record with matching batch_id
            if (batchId) {
                inventoryRecord = existingInventory.find(item => item.batch_id === batchId);
            } else {
                inventoryRecord = existingInventory.find(item => item.batch_id === null);
            }

            // If not found with specific batch, try to find any record
            if (!inventoryRecord && existingInventory.length > 0) {
                inventoryRecord = existingInventory[0];
                console.log(`⚠️ No specific batch found, using first available record`);
            }

            console.log('🔍 Found inventory record:', inventoryRecord);

            if (!inventoryRecord) {
                return { 
                    success: false, 
                    error: `No inventory record found for product ${productId} in warehouse ${warehouseId}` 
                };
            }

            const availableQuantity = (inventoryRecord.quantity || 0) - (inventoryRecord.reserved_quantity || 0);
            console.log(`🔍 Available: ${availableQuantity}, Requested: ${quantity}`);

            if (availableQuantity < quantity) {
                return {
                    success: false,
                    error: `Insufficient stock. Available: ${availableQuantity}, Requested: ${quantity}`
                };
            }

            // Update inventory quantity
            const newQuantity = (inventoryRecord.quantity || 0) - quantity;
            const result = await InventoryRepository.updateQuantity(inventoryRecord.id, newQuantity);
            
            if (!result || result.changes === 0) {
                return { success: false, error: 'Failed to remove stock' };
            }

            // Update batch quantity if batch exists
            if (batchId) {
                const batch = await BatchRepository.getById(batchId);
                if (batch) {
                    await BatchRepository.updateQuantity(batchId, (batch.quantity || 0) - quantity);
                    console.log(`✅ Updated batch ${batchId} quantity: ${(batch.quantity || 0) - quantity}`);
                }
            }

            // Update product stock quantity
            await ProductRepository.updateStockQuantity(productId);

            return {
                success: true,
                message: `Removed ${quantity} units from inventory`,
                newQuantity: newQuantity
            };
        } catch (error) {
            console.error('🔴 removeStock error:', error);
            return { success: false, error: error.message };
        }
    }

    // ==================== GET INVENTORY BY PRODUCT AND WAREHOUSE ====================
    async getInventoryByProductAndWarehouse(productId, warehouseId) {
        try {
            console.log(`🔍 getInventoryByProductAndWarehouse: product ${productId}, warehouse ${warehouseId}`);
            
            const stmt = db.prepare(`
                SELECT 
                    i.*,
                    p.name as product_name,
                    p.code as product_code,
                    w.name as warehouse_name,
                    b.batch_number,
                    b.expiry_date,
                    b.purchase_price as batch_purchase_price,
                    b.sale_price as batch_sale_price
                FROM inventory i
                LEFT JOIN products p ON i.product_id = p.id
                LEFT JOIN warehouses w ON i.warehouse_id = w.id
                LEFT JOIN batches b ON i.batch_id = b.id
                WHERE i.product_id = ? AND i.warehouse_id = ?
                ORDER BY i.id ASC
            `);
            
            const result = stmt.all(productId, warehouseId);
            console.log(`🔍 Found ${result.length} inventory records`);
            
            // Return the first record or null
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error getting inventory by product and warehouse:', error);
            return null;
        }
    }

    // ==================== GET ALL INVENTORY RECORDS ====================
    async getInventoryRecords(productId, warehouseId) {
        try {
            const records = await InventoryRepository.getByProductAndWarehouse(productId, warehouseId);
            return records || [];
        } catch (error) {
            console.error('Error getting inventory records:', error);
            return [];
        }
    }

    // ==================== RESERVE STOCK ====================
    async reserveStock({ productId, warehouseId, batchId, quantity }) {
        try {
            if (!productId) {
                return { success: false, error: 'Product ID is required' };
            }
            if (!warehouseId) {
                return { success: false, error: 'Warehouse ID is required' };
            }
            if (!quantity || quantity <= 0) {
                return { success: false, error: 'Quantity must be greater than 0' };
            }

            const existingInventory = await InventoryRepository.getByProductAndWarehouse(productId, warehouseId);
            let inventoryRecord = existingInventory.find(item => 
                (item.batch_id === batchId) || (!item.batch_id && !batchId)
            );

            if (!inventoryRecord) {
                return { success: false, error: 'No inventory record found' };
            }

            const availableQuantity = (inventoryRecord.quantity || 0) - (inventoryRecord.reserved_quantity || 0);
            if (availableQuantity < quantity) {
                return {
                    success: false,
                    error: `Insufficient stock for reservation. Available: ${availableQuantity}, Requested: ${quantity}`
                };
            }

            const result = await InventoryRepository.reserveStock(inventoryRecord.id, quantity);
            if (result.changes === 0) {
                return { success: false, error: 'Failed to reserve stock' };
            }

            return {
                success: true,
                message: `Reserved ${quantity} units successfully`
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== RELEASE RESERVED STOCK ====================
    async releaseReservedStock({ productId, warehouseId, batchId, quantity }) {
        try {
            if (!productId) {
                return { success: false, error: 'Product ID is required' };
            }
            if (!warehouseId) {
                return { success: false, error: 'Warehouse ID is required' };
            }
            if (!quantity || quantity <= 0) {
                return { success: false, error: 'Quantity must be greater than 0' };
            }

            const existingInventory = await InventoryRepository.getByProductAndWarehouse(productId, warehouseId);
            let inventoryRecord = existingInventory.find(item => 
                (item.batch_id === batchId) || (!item.batch_id && !batchId)
            );

            if (!inventoryRecord) {
                return { success: false, error: 'No inventory record found' };
            }

            if ((inventoryRecord.reserved_quantity || 0) < quantity) {
                return {
                    success: false,
                    error: `Cannot release more than reserved. Reserved: ${inventoryRecord.reserved_quantity}, Requested: ${quantity}`
                };
            }

            const result = await InventoryRepository.releaseReservedStock(inventoryRecord.id, quantity);
            if (result.changes === 0) {
                return { success: false, error: 'Failed to release reserved stock' };
            }

            return {
                success: true,
                message: `Released ${quantity} reserved units successfully`
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== READ OPERATIONS ====================
    async getInventoryByProduct(productId) {
        try {
            const inventory = await InventoryRepository.getByProduct(productId);
            return {
                success: true,
                data: inventory,
                count: inventory.length
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getInventoryByWarehouse(warehouseId) {
        try {
            const inventory = await InventoryRepository.getByWarehouse(warehouseId);
            return {
                success: true,
                data: inventory,
                count: inventory.length
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getProductStockInWarehouse(productId, warehouseId) {
        try {
            const inventory = await InventoryRepository.getByProductAndWarehouse(productId, warehouseId);
            const totalQuantity = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
            const totalReserved = inventory.reduce((sum, item) => sum + (item.reserved_quantity || 0), 0);
            const totalAvailable = totalQuantity - totalReserved;

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
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getLowStock() {
        try {
            const lowStock = await InventoryRepository.getLowStock();
            return {
                success: true,
                data: lowStock,
                count: lowStock.length,
                message: `${lowStock.length} items below reorder level`
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getStockValue() {
        try {
            const stmt = db.prepare(`
                SELECT 
                    SUM(i.quantity * p.purchase_price) as total_purchase_value,
                    SUM(i.quantity * p.sale_price) as total_sale_value,
                    SUM(i.quantity) as total_quantity,
                    COUNT(DISTINCT i.product_id) as unique_products
                FROM inventory i
                LEFT JOIN products p ON i.product_id = p.id
                WHERE i.quantity > 0
            `);
            const result = stmt.get();

            return {
                success: true,
                data: {
                    total_purchase_value: result.total_purchase_value || 0,
                    total_sale_value: result.total_sale_value || 0,
                    total_quantity: result.total_quantity || 0,
                    unique_products: result.unique_products || 0
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // electron/services/inventory.service.js

async updateMinMax(productId, warehouseId, minStock, maxStock) {
    try {
        if (!productId) {
            return { success: false, error: 'Product ID is required' };
        }

        // ✅ Convert empty strings and null to undefined
        const min = (minStock !== undefined && minStock !== null && minStock !== '') 
            ? parseFloat(minStock) 
            : undefined;
        const max = (maxStock !== undefined && maxStock !== null && maxStock !== '') 
            ? parseFloat(maxStock) 
            : undefined;

        // ✅ Validate min if provided
        if (min !== undefined && isNaN(min)) {
            return { success: false, error: 'Min stock must be a valid number' };
        }
        if (min !== undefined && min < 0) {
            return { success: false, error: 'Min stock cannot be negative' };
        }

        // ✅ Validate max if provided
        if (max !== undefined && isNaN(max)) {
            return { success: false, error: 'Max stock must be a valid number' };
        }
        if (max !== undefined && max < 0) {
            return { success: false, error: 'Max stock cannot be negative' };
        }

        // ✅ Only validate min > max if BOTH are provided
        if (min !== undefined && max !== undefined && min > max) {
            return { success: false, error: 'Min stock cannot be greater than max stock' };
        }

        // ✅ Update inventory table ONLY if warehouseId is provided
        if (warehouseId) {
            const existingInventory = await InventoryRepository.getByProductAndWarehouse(productId, warehouseId);
            
            if (existingInventory.length === 0) {
                // Create new inventory record
                const result = await InventoryRepository.create({
                    product_id: productId,
                    warehouse_id: warehouseId,
                    quantity: 0,
                    min_stock: min || 0,
                    max_stock: max || 0
                });
                if (!result.lastInsertRowid) {
                    return { success: false, error: 'Failed to create inventory record' };
                }
                console.log(`✅ Created inventory record for product ${productId} in warehouse ${warehouseId}`);
            } else {
                // Update existing inventory record
                const record = existingInventory[0];
                const updateData = {};
                if (min !== undefined) updateData.min_stock = min;
                if (max !== undefined) updateData.max_stock = max;
                
                if (Object.keys(updateData).length > 0) {
                    await InventoryRepository.update(record.id, updateData);
                    console.log(`✅ Updated inventory record ${record.id} for product ${productId}`);
                }
            }
        }

        // ✅ ALWAYS update product reorder level (this is the main goal)
        if (min !== undefined) {
            const productUpdate = db.prepare(`
                UPDATE products 
                SET reorder_level = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `);
            const result = productUpdate.run(min, parseInt(productId));
            
            if (result.changes === 0) {
                return { success: false, error: 'Product not found or update failed' };
            }
            
            console.log(`✅ Updated product ${productId} reorder_level to ${min}`);
        }

        return {
            success: true,
            message: warehouseId 
                ? 'Min/Max stock levels and reorder level updated successfully'
                : 'Reorder level updated successfully',
            data: {
                product_id: productId,
                reorder_level: min,
                warehouse_id: warehouseId || null,
                min_stock: min,
                max_stock: max
            }
        };
    } catch (error) {
        console.error('❌ updateMinMax error:', error);
        return { success: false, error: error.message };
    }
}

    async getInventorySummary() {
        try {
            const summary = await InventoryRepository.getStockSummary();
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
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getDetailedWarehouseInventory(warehouseId) {
        try {
            const inventory = await InventoryRepository.getDetailedWarehouseInventory(warehouseId);
            return {
                success: true,
                data: inventory,
                count: inventory.length
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getAvailableQuantity(productId, warehouseId) {
        try {
            const quantity = await InventoryRepository.getAvailableQuantity(productId, warehouseId);
            return {
                success: true,
                data: { available_quantity: quantity }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = new InventoryService();