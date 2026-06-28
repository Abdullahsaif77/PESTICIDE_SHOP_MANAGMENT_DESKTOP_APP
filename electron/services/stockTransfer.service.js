const StockTransferRepository = require("../repositories/stockTransfer.repository")
const InventoryService = require("./inventory.service")
const ProductRepository = require("../repositories/product.repository")
const WarehouseRepository = require("../repositories/warehouse.repository")
const BatchRepository = require("../repositories/batch.repository")

class StockTransferService {
    async createTransfer(data) {
        try {
            // Validations
            if (!data.product_id) {
                return { success: false, error: 'Product ID is required' }
            }
            if (!data.from_warehouse_id) {
                return { success: false, error: 'Source warehouse ID is required' }
            }
            if (!data.to_warehouse_id) {
                return { success: false, error: 'Destination warehouse ID is required' }
            }
            if (!data.quantity || data.quantity <= 0) {
                return { success: false, error: 'Quantity must be greater than 0' }
            }
            if (data.from_warehouse_id === data.to_warehouse_id) {
                return { success: false, error: 'Source and destination warehouses cannot be the same' }
            }

            // Check if product exists
            const product = await ProductRepository.getById(data.product_id)
            if (!product) {
                return { success: false, error: 'Product not found' }
            }

            // Check if warehouses exist
            const fromWarehouse = await WarehouseRepository.getById(data.from_warehouse_id)
            if (!fromWarehouse.success || !fromWarehouse.data) {
                return { success: false, error: 'Source warehouse not found' }
            }

            const toWarehouse = await WarehouseRepository.getById(data.to_warehouse_id)
            if (!toWarehouse.success || !toWarehouse.data) {
                return { success: false, error: 'Destination warehouse not found' }
            }

            // Check if batch exists (if provided)
            if (data.batch_id) {
                const batch = await BatchRepository.getById(data.batch_id)
                if (!batch) {
                    return { success: false, error: 'Batch not found' }
                }
                if (batch.product_id !== parseInt(data.product_id)) {
                    return { success: false, error: 'Batch does not belong to the specified product' }
                }
            }

            // Check available stock in source warehouse
            const sourceInventory = await InventoryService.getProductStockInWarehouse(
                data.product_id, 
                data.from_warehouse_id
            )
            
            if (!sourceInventory.success) {
                return { success: false, error: 'Failed to check source inventory' }
            }

            const availableQuantity = sourceInventory.data.available_quantity || 0
            if (availableQuantity < data.quantity) {
                return {
                    success: false,
                    error: `Insufficient stock in source warehouse. Available: ${availableQuantity}, Requested: ${data.quantity}`
                }
            }

            // Generate transfer number
            const timestamp = Date.now().toString(36).toUpperCase()
            const transferNumber = `TRF-${timestamp}`

            // Create transfer
            const result = await StockTransferRepository.create({
                transfer_number: transferNumber,
                product_id: data.product_id,
                from_warehouse_id: data.from_warehouse_id,
                to_warehouse_id: data.to_warehouse_id,
                quantity: data.quantity,
                batch_id: data.batch_id || null,
                transferred_by: data.transferred_by || null,
                status: 'pending',
                notes: data.notes || null
            })

            if (!result.lastInsertRowid) {
                return { success: false, error: 'Failed to create transfer' }
            }

            const transfer = await StockTransferRepository.getById(result.lastInsertRowid)
            return {
                success: true,
                data: transfer,
                message: `Transfer ${transferNumber} created successfully`
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async getAllTransfers(filters = {}) {
        try {
            const transfers = await StockTransferRepository.getAll(filters)
            return {
                success: true,
                data: transfers,
                count: transfers.length
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async getTransferById(id) {
        try {
            const transfer = await StockTransferRepository.getById(id)
            if (!transfer) {
                return { success: false, error: 'Transfer not found' }
            }
            return { success: true, data: transfer }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async completeTransfer(id) {
        try {
            // Get transfer
            const transfer = await StockTransferRepository.getById(id)
            if (!transfer) {
                return { success: false, error: 'Transfer not found' }
            }

            // Check if already completed
            if (transfer.status === 'completed') {
                return { success: false, error: 'Transfer is already completed' }
            }

            // Check if cancelled
            if (transfer.status === 'cancelled') {
                return { success: false, error: 'Cannot complete a cancelled transfer' }
            }

            // Validate transfer
            const validation = await this.validateTransfer(transfer)
            if (!validation.success) {
                return validation
            }

            // Remove stock from source warehouse
            const removeResult = await InventoryService.removeStock(
                transfer.product_id,
                transfer.from_warehouse_id,
                transfer.batch_id,
                transfer.quantity
            )

            if (!removeResult.success) {
                return {
                    success: false,
                    error: `Failed to remove stock from source: ${removeResult.error}`
                }
            }

            // Add stock to destination warehouse
            const addResult = await InventoryService.addStock(
                transfer.product_id,
                transfer.to_warehouse_id,
                transfer.batch_id,
                transfer.quantity
            )

            if (!addResult.success) {
                // Rollback: Add stock back to source
                await InventoryService.addStock(
                    transfer.product_id,
                    transfer.from_warehouse_id,
                    transfer.batch_id,
                    transfer.quantity
                )
                return {
                    success: false,
                    error: `Failed to add stock to destination: ${addResult.error}`
                }
            }

            // Mark transfer as completed
            const result = await StockTransferRepository.complete(id)
            if (result.changes === 0) {
                return { success: false, error: 'Failed to complete transfer' }
            }

            const updatedTransfer = await StockTransferRepository.getById(id)
            return {
                success: true,
                data: updatedTransfer,
                message: `Transfer ${transfer.transfer_number} completed successfully`
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async cancelTransfer(id) {
        try {
            const transfer = await StockTransferRepository.getById(id)
            if (!transfer) {
                return { success: false, error: 'Transfer not found' }
            }

            // Check if already completed
            if (transfer.status === 'completed') {
                return { success: false, error: 'Cannot cancel a completed transfer' }
            }

            // Check if already cancelled
            if (transfer.status === 'cancelled') {
                return { success: false, error: 'Transfer is already cancelled' }
            }

            const result = await StockTransferRepository.cancel(id)
            if (result.changes === 0) {
                return { success: false, error: 'Failed to cancel transfer' }
            }

            const updatedTransfer = await StockTransferRepository.getById(id)
            return {
                success: true,
                data: updatedTransfer,
                message: `Transfer ${transfer.transfer_number} cancelled successfully`
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async deleteTransfer(id) {
        try {
            const transfer = await StockTransferRepository.getById(id)
            if (!transfer) {
                return { success: false, error: 'Transfer not found' }
            }

            // Only allow deletion of cancelled or failed transfers
            if (transfer.status === 'pending') {
                return { success: false, error: 'Cannot delete a pending transfer. Cancel it first.' }
            }

            if (transfer.status === 'completed') {
                return { success: false, error: 'Cannot delete a completed transfer' }
            }

            const result = await StockTransferRepository.delete(id)
            if (result.changes === 0) {
                return { success: false, error: 'Failed to delete transfer' }
            }

            return {
                success: true,
                message: `Transfer ${transfer.transfer_number} deleted successfully`
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async getPendingTransfers() {
        try {
            const transfers = await StockTransferRepository.getPending()
            return {
                success: true,
                data: transfers,
                count: transfers.length
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async getTransferHistory(limit = 50) {
        try {
            const transfers = await StockTransferRepository.getRecentTransfers(limit)
            return {
                success: true,
                data: transfers,
                count: transfers.length
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async validateTransfer(transfer) {
        try {
            // Check if product exists
            const product = await ProductRepository.getById(transfer.product_id)
            if (!product) {
                return { success: false, error: 'Product not found' }
            }

            // Check if source warehouse exists and is active
            const fromWarehouse = await WarehouseRepository.getById(transfer.from_warehouse_id)
            if (!fromWarehouse.success || !fromWarehouse.data) {
                return { success: false, error: 'Source warehouse not found' }
            }
            if (fromWarehouse.data.status !== 'active') {
                return { success: false, error: 'Source warehouse is not active' }
            }

            // Check if destination warehouse exists and is active
            const toWarehouse = await WarehouseRepository.getById(transfer.to_warehouse_id)
            if (!toWarehouse.success || !toWarehouse.data) {
                return { success: false, error: 'Destination warehouse not found' }
            }
            if (toWarehouse.data.status !== 'active') {
                return { success: false, error: 'Destination warehouse is not active' }
            }

            // Check if batch exists and is active (if provided)
            if (transfer.batch_id) {
                const batch = await BatchRepository.getById(transfer.batch_id)
                if (!batch) {
                    return { success: false, error: 'Batch not found' }
                }
                if (!batch.is_active) {
                    return { success: false, error: 'Batch is not active' }
                }
                if (batch.product_id !== transfer.product_id) {
                    return { success: false, error: 'Batch does not belong to the specified product' }
                }
                if (batch.quantity < transfer.quantity) {
                    return { success: false, error: 'Insufficient quantity in batch' }
                }
            }

            // Check available stock
            const sourceInventory = await InventoryService.getProductStockInWarehouse(
                transfer.product_id,
                transfer.from_warehouse_id
            )

            if (!sourceInventory.success) {
                return { success: false, error: 'Failed to check source inventory' }
            }

            const availableQuantity = sourceInventory.data.available_quantity || 0
            if (availableQuantity < transfer.quantity) {
                return {
                    success: false,
                    error: `Insufficient stock. Available: ${availableQuantity}, Transfer: ${transfer.quantity}`
                }
            }

            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async getTransfersByProduct(productId) {
        try {
            const transfers = await StockTransferRepository.getByProduct(productId)
            return {
                success: true,
                data: transfers,
                count: transfers.length
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async getTransfersFromWarehouse(warehouseId) {
        try {
            const transfers = await StockTransferRepository.getByFromWarehouse(warehouseId)
            return {
                success: true,
                data: transfers,
                count: transfers.length
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async getTransfersToWarehouse(warehouseId) {
        try {
            const transfers = await StockTransferRepository.getByToWarehouse(warehouseId)
            return {
                success: true,
                data: transfers,
                count: transfers.length
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async getTransferStats() {
        try {
            const stats = await StockTransferRepository.getTransferStats()
            return {
                success: true,
                data: stats
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async getTransfersByDateRange(startDate, endDate) {
        try {
            const transfers = await StockTransferRepository.getTransfersByDateRange(startDate, endDate)
            return {
                success: true,
                data: transfers,
                count: transfers.length
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }
}

module.exports = new StockTransferService()