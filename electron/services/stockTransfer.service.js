// electron/services/stockTransfer.service.js

const StockTransferRepository = require("../repositories/stockTransfer.repository");
const InventoryService = require("./inventory.service");
const ProductRepository = require("../repositories/product.repository");
const WarehouseRepository = require("../repositories/warehouse.repository");
const BatchRepository = require("../repositories/batch.repository");
const db = require("../database/database");

class StockTransferService {
    async createTransfer(data) {
        try {
            // Validations
            if (!data.product_id) {
                return { success: false, error: 'Product ID is required' };
            }
            if (!data.from_warehouse_id) {
                return { success: false, error: 'Source warehouse ID is required' };
            }
            if (!data.to_warehouse_id) {
                return { success: false, error: 'Destination warehouse ID is required' };
            }
            if (!data.quantity || data.quantity <= 0) {
                return { success: false, error: 'Quantity must be greater than 0' };
            }
            if (data.from_warehouse_id === data.to_warehouse_id) {
                return { success: false, error: 'Source and destination warehouses cannot be the same' };
            }

            // Check if product exists
            const product = await ProductRepository.getById(data.product_id);
            if (!product) {
                return { success: false, error: 'Product not found' };
            }

            // Check if warehouses exist
            const fromWarehouse = await WarehouseRepository.getById(data.from_warehouse_id);
            if (!fromWarehouse.success || !fromWarehouse.data) {
                return { success: false, error: 'Source warehouse not found' };
            }

            const toWarehouse = await WarehouseRepository.getById(data.to_warehouse_id);
            if (!toWarehouse.success || !toWarehouse.data) {
                return { success: false, error: 'Destination warehouse not found' };
            }

            // Check if batch exists (if provided)
            if (data.batch_id) {
                const batch = await BatchRepository.getById(data.batch_id);
                if (!batch) {
                    return { success: false, error: 'Batch not found' };
                }
                if (batch.product_id !== parseInt(data.product_id)) {
                    return { success: false, error: 'Batch does not belong to the specified product' };
                }
            }

            // ==========================================
            // FIX: Directly update inventory using transaction
            // ==========================================
            
            // Start a transaction
            const transaction = db.transaction(() => {
                // 1. Check available stock in source warehouse
                const sourceInventory = db.prepare(`
                    SELECT id, quantity FROM inventory 
                    WHERE product_id = ? AND warehouse_id = ? 
                    AND (batch_id = ? OR (batch_id IS NULL AND ? IS NULL))
                `).get(data.product_id, data.from_warehouse_id, data.batch_id, data.batch_id);

                if (!sourceInventory) {
                    throw new Error('Product not found in source warehouse');
                }

                if (sourceInventory.quantity < data.quantity) {
                    throw new Error(`Insufficient stock. Available: ${sourceInventory.quantity}, Requested: ${data.quantity}`);
                }

                // 2. Generate transfer number
                const timestamp = Date.now().toString(36).toUpperCase();
                const transferNumber = `TRF-${timestamp}`;

                // 3. Create transfer record
                const transferStmt = db.prepare(`
                    INSERT INTO stock_transfers (
                        transfer_number,
                        product_id,
                        from_warehouse_id,
                        to_warehouse_id,
                        quantity,
                        batch_id,
                        transferred_by,
                        status,
                        notes,
                        created_at,
                        updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                `);
                
                const transferResult = transferStmt.run(
                    transferNumber,
                    data.product_id,
                    data.from_warehouse_id,
                    data.to_warehouse_id,
                    data.quantity,
                    data.batch_id || null,
                    data.transferred_by || null,
                    data.notes || null
                );

                const transferId = transferResult.lastInsertRowid;

                // 4. Remove stock from source warehouse
                db.prepare(`
                    UPDATE inventory 
                    SET quantity = quantity - ?,
                        updated_at = CURRENT_TIMESTAMP,
                        last_updated = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).run(data.quantity, sourceInventory.id);

                // 5. Add stock to destination warehouse
                const destInventory = db.prepare(`
                    SELECT id, quantity FROM inventory 
                    WHERE product_id = ? AND warehouse_id = ? 
                    AND (batch_id = ? OR (batch_id IS NULL AND ? IS NULL))
                `).get(data.product_id, data.to_warehouse_id, data.batch_id, data.batch_id);

                if (destInventory) {
                    // Update existing inventory in destination
                    db.prepare(`
                        UPDATE inventory 
                        SET quantity = quantity + ?,
                            updated_at = CURRENT_TIMESTAMP,
                            last_updated = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `).run(data.quantity, destInventory.id);
                } else {
                    // Create new inventory in destination
                    db.prepare(`
                        INSERT INTO inventory (
                            product_id,
                            warehouse_id,
                            batch_id,
                            quantity,
                            reserved_quantity,
                            min_stock,
                            max_stock,
                            created_at,
                            updated_at,
                            last_updated
                        ) VALUES (?, ?, ?, ?, 0, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    `).run(data.product_id, data.to_warehouse_id, data.batch_id || null, data.quantity);
                }

                // 6. Update product stock quantity (optional)
                // This is handled by the inventory table

                // 7. Update batch quantity if batch exists
                if (data.batch_id) {
                    db.prepare(`
                        UPDATE batches 
                        SET quantity = quantity - ?,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `).run(data.quantity, data.batch_id);
                }

                return { transferId, transferNumber };
            });

            // Execute the transaction
            const result = transaction();
            
            // Get the complete transfer record
            const transfer = await StockTransferRepository.getById(result.transferId);

            return {
                success: true,
                data: transfer,
                message: `Transfer ${result.transferNumber} completed successfully`
            };

        } catch (error) {
            console.error('Transfer error:', error);
            return { success: false, error: error.message };
        }
    }

    async getAllTransfers(filters = {}) {
        try {
            const transfers = await StockTransferRepository.getAll(filters);
            return {
                success: true,
                data: transfers,
                count: transfers.length
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getTransferById(id) {
        try {
            const transfer = await StockTransferRepository.getById(id);
            if (!transfer) {
                return { success: false, error: 'Transfer not found' };
            }
            return { success: true, data: transfer };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async completeTransfer(id) {
        try {
            const transfer = await StockTransferRepository.getById(id);
            if (!transfer) {
                return { success: false, error: 'Transfer not found' };
            }

            if (transfer.status === 'completed') {
                return { success: false, error: 'Transfer is already completed' };
            }

            if (transfer.status === 'cancelled') {
                return { success: false, error: 'Cannot complete a cancelled transfer' };
            }

            // Complete the transfer using transaction
            const transaction = db.transaction(() => {
                // Check source inventory
                const sourceInventory = db.prepare(`
                    SELECT id, quantity FROM inventory 
                    WHERE product_id = ? AND warehouse_id = ? 
                    AND (batch_id = ? OR (batch_id IS NULL AND ? IS NULL))
                `).get(transfer.product_id, transfer.from_warehouse_id, transfer.batch_id, transfer.batch_id);

                if (!sourceInventory || sourceInventory.quantity < transfer.quantity) {
                    throw new Error('Insufficient stock in source warehouse');
                }

                // Remove from source
                db.prepare(`
                    UPDATE inventory 
                    SET quantity = quantity - ?,
                        updated_at = CURRENT_TIMESTAMP,
                        last_updated = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).run(transfer.quantity, sourceInventory.id);

                // Add to destination
                const destInventory = db.prepare(`
                    SELECT id, quantity FROM inventory 
                    WHERE product_id = ? AND warehouse_id = ? 
                    AND (batch_id = ? OR (batch_id IS NULL AND ? IS NULL))
                `).get(transfer.product_id, transfer.to_warehouse_id, transfer.batch_id, transfer.batch_id);

                if (destInventory) {
                    db.prepare(`
                        UPDATE inventory 
                        SET quantity = quantity + ?,
                            updated_at = CURRENT_TIMESTAMP,
                            last_updated = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `).run(transfer.quantity, destInventory.id);
                } else {
                    db.prepare(`
                        INSERT INTO inventory (
                            product_id,
                            warehouse_id,
                            batch_id,
                            quantity,
                            reserved_quantity,
                            min_stock,
                            max_stock,
                            created_at,
                            updated_at,
                            last_updated
                        ) VALUES (?, ?, ?, ?, 0, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    `).run(transfer.product_id, transfer.to_warehouse_id, transfer.batch_id || null, transfer.quantity);
                }

                // Update transfer status
                db.prepare(`
                    UPDATE stock_transfers 
                    SET status = 'completed',
                        completed_at = CURRENT_TIMESTAMP,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).run(id);
            });

            transaction();

            const updatedTransfer = await StockTransferRepository.getById(id);
            return {
                success: true,
                data: updatedTransfer,
                message: `Transfer ${transfer.transfer_number} completed successfully`
            };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async cancelTransfer(id) {
        try {
            const transfer = await StockTransferRepository.getById(id);
            if (!transfer) {
                return { success: false, error: 'Transfer not found' };
            }

            if (transfer.status === 'completed') {
                return { success: false, error: 'Cannot cancel a completed transfer' };
            }

            if (transfer.status === 'cancelled') {
                return { success: false, error: 'Transfer is already cancelled' };
            }

            const result = await StockTransferRepository.cancel(id);
            if (result.changes === 0) {
                return { success: false, error: 'Failed to cancel transfer' };
            }

            const updatedTransfer = await StockTransferRepository.getById(id);
            return {
                success: true,
                data: updatedTransfer,
                message: `Transfer ${transfer.transfer_number} cancelled successfully`
            };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async deleteTransfer(id) {
        try {
            const transfer = await StockTransferRepository.getById(id);
            if (!transfer) {
                return { success: false, error: 'Transfer not found' };
            }

            if (transfer.status === 'pending') {
                return { success: false, error: 'Cannot delete a pending transfer. Cancel it first.' };
            }

            if (transfer.status === 'completed') {
                return { success: false, error: 'Cannot delete a completed transfer' };
            }

            const result = await StockTransferRepository.delete(id);
            if (result.changes === 0) {
                return { success: false, error: 'Failed to delete transfer' };
            }

            return {
                success: true,
                message: `Transfer ${transfer.transfer_number} deleted successfully`
            };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getPendingTransfers() {
        try {
            const transfers = await StockTransferRepository.getPending();
            return {
                success: true,
                data: transfers,
                count: transfers.length
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getTransferHistory(limit = 50) {
        try {
            const transfers = await StockTransferRepository.getRecentTransfers(limit);
            return {
                success: true,
                data: transfers,
                count: transfers.length
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getTransfersByProduct(productId) {
        try {
            const transfers = await StockTransferRepository.getByProduct(productId);
            return {
                success: true,
                data: transfers,
                count: transfers.length
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getTransfersFromWarehouse(warehouseId) {
        try {
            const transfers = await StockTransferRepository.getByFromWarehouse(warehouseId);
            return {
                success: true,
                data: transfers,
                count: transfers.length
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getTransfersToWarehouse(warehouseId) {
        try {
            const transfers = await StockTransferRepository.getByToWarehouse(warehouseId);
            return {
                success: true,
                data: transfers,
                count: transfers.length
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getTransferStats() {
        try {
            const stats = await StockTransferRepository.getTransferStats();
            return {
                success: true,
                data: stats
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getTransfersByDateRange(startDate, endDate) {
        try {
            const transfers = await StockTransferRepository.getTransfersByDateRange(startDate, endDate);
            return {
                success: true,
                data: transfers,
                count: transfers.length
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async validateTransfer(transfer) {
        try {
            const product = await ProductRepository.getById(transfer.product_id);
            if (!product) {
                return { success: false, error: 'Product not found' };
            }

            const fromWarehouse = await WarehouseRepository.getById(transfer.from_warehouse_id);
            if (!fromWarehouse.success || !fromWarehouse.data) {
                return { success: false, error: 'Source warehouse not found' };
            }
            if (fromWarehouse.data.status !== 'active') {
                return { success: false, error: 'Source warehouse is not active' };
            }

            const toWarehouse = await WarehouseRepository.getById(transfer.to_warehouse_id);
            if (!toWarehouse.success || !toWarehouse.data) {
                return { success: false, error: 'Destination warehouse not found' };
            }
            if (toWarehouse.data.status !== 'active') {
                return { success: false, error: 'Destination warehouse is not active' };
            }

            if (transfer.batch_id) {
                const batch = await BatchRepository.getById(transfer.batch_id);
                if (!batch) {
                    return { success: false, error: 'Batch not found' };
                }
                if (!batch.is_active) {
                    return { success: false, error: 'Batch is not active' };
                }
                if (batch.product_id !== transfer.product_id) {
                    return { success: false, error: 'Batch does not belong to the specified product' };
                }
                if (batch.quantity < transfer.quantity) {
                    return { success: false, error: 'Insufficient quantity in batch' };
                }
            }

            // Check available stock
            const sourceInventory = db.prepare(`
                SELECT quantity FROM inventory 
                WHERE product_id = ? AND warehouse_id = ? 
                AND (batch_id = ? OR (batch_id IS NULL AND ? IS NULL))
            `).get(transfer.product_id, transfer.from_warehouse_id, transfer.batch_id, transfer.batch_id);

            const availableQuantity = sourceInventory ? sourceInventory.quantity : 0;
            if (availableQuantity < transfer.quantity) {
                return {
                    success: false,
                    error: `Insufficient stock. Available: ${availableQuantity}, Transfer: ${transfer.quantity}`
                };
            }

            return { success: true };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = new StockTransferService();