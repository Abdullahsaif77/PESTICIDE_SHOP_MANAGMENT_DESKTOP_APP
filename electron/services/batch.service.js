// electron/services/batch.service.js

const BatchRepository = require("../repositories/batch.repository");
const ProductRepository = require("../repositories/product.repository");
const db = require("../database/database");

class BatchService {
    // ==================== CREATE ====================
    async createBatch(data) {
        // Validation
        if (!data.product_id) {
            return { success: false, error: 'Product ID is required' };
        }

        if (!data.batch_number || data.batch_number.trim() === '') {
            return { success: false, error: 'Batch number is required' };
        }

        if (!data.quantity || data.quantity <= 0) {
            return { success: false, error: 'Quantity must be greater than 0' };
        }

        if (data.purchase_price && data.purchase_price < 0) {
            return { success: false, error: 'Purchase price cannot be negative' };
        }

        if (data.sale_price && data.sale_price < 0) {
            return { success: false, error: 'Sale price cannot be negative' };
        }

        // Check if product exists
        const product = await ProductRepository.getById(data.product_id);
        if (!product) {
            return { success: false, error: 'Product not found' };
        }

        // Check for duplicate batch number
        const existing = await BatchRepository.getBatchByNumber(data.batch_number);
        if (existing) {
            return { success: false, error: `Batch number "${data.batch_number}" already exists` };
        }

        try {
            const result = await BatchRepository.create(data);
            const batch = await BatchRepository.getById(result.lastInsertRowid);
            return { 
                success: true, 
                data: batch, 
                message: 'Batch created successfully' 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== READ ====================
    async getAllBatches(filters = {}) {
        try {
            let batches = [];
            
            if (filters.product_id) {
                if (filters.active_only) {
                    batches = await BatchRepository.getActiveByProductId(filters.product_id);
                } else {
                    batches = await BatchRepository.getByProductId(filters.product_id);
                }
            } else if (filters.is_expiring) {
                batches = await BatchRepository.getExpiringBatches(filters.days || 30);
            } else if (filters.is_expired) {
                batches = await BatchRepository.getExpiredBatches();
            } else {
                const stmt = db.prepare(`
                    SELECT * FROM batches 
                    WHERE 1=1
                    ${filters.is_active !== undefined ? 'AND is_active = ?' : ''}
                    ORDER BY created_at DESC
                `);
                
                if (filters.is_active !== undefined) {
                    batches = stmt.all(filters.is_active);
                } else {
                    batches = stmt.all();
                }
            }

            return { success: true, data: batches, count: batches.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getBatchById(id) {
        try {
            const batch = await BatchRepository.getById(id);
            if (!batch) {
                return { success: false, error: 'Batch not found' };
            }
            return { success: true, data: batch };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getBatchesByProduct(productId) {
        try {
            const batches = await BatchRepository.getByProductId(productId);
            return { success: true, data: batches, count: batches.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== NEW METHOD FOR SALES FIFO ====================
    async getBatchesByProductAndWarehouse(productId, warehouseId, onlyActive = true) {
        try {
            let query = `
                SELECT 
                    b.*,
                    i.quantity as available_quantity,
                    i.reserved_quantity,
                    i.warehouse_id,
                    i.id as inventory_id
                FROM batches b
                INNER JOIN inventory i ON b.id = i.batch_id
                WHERE b.product_id = ? 
                AND i.warehouse_id = ?
                AND i.quantity > 0
            `;
            
            if (onlyActive) {
                query += ' AND b.is_active = 1';
            }
            
            query += ' ORDER BY b.expiry_date ASC NULLS LAST, b.created_at ASC';
            
            const stmt = db.prepare(query);
            const batches = stmt.all(productId, warehouseId);
            
            return { 
                success: true, 
                data: batches,
                count: batches.length
            };
        } catch (error) {
            console.error('Error fetching batches by product and warehouse:', error);
            return { 
                success: false, 
                error: error.message,
                data: []
            };
        }
    }

    // ==================== UPDATE ====================
    async updateBatch(id, data) {
        try {
            // Check if batch exists
            const existing = await BatchRepository.getById(id);
            if (!existing) {
                return { success: false, error: 'Batch not found' };
            }

            // Validate data
            if (data.batch_number && data.batch_number.trim() === '') {
                return { success: false, error: 'Batch number cannot be empty' };
            }

            if (data.quantity !== undefined && data.quantity < 0) {
                return { success: false, error: 'Quantity cannot be negative' };
            }

            if (data.purchase_price !== undefined && data.purchase_price < 0) {
                return { success: false, error: 'Purchase price cannot be negative' };
            }

            if (data.sale_price !== undefined && data.sale_price < 0) {
                return { success: false, error: 'Sale price cannot be negative' };
            }

            // Check duplicate batch number if changed
            if (data.batch_number && data.batch_number !== existing.batch_number) {
                const duplicate = await BatchRepository.getBatchByNumber(data.batch_number);
                if (duplicate && duplicate.id !== id) {
                    return { success: false, error: `Batch number "${data.batch_number}" already exists` };
                }
            }

            const result = await BatchRepository.update(id, data);
            if (result.changes === 0) {
                return { success: false, error: 'No changes made' };
            }

            const updated = await BatchRepository.getById(id);
            return { 
                success: true, 
                data: updated, 
                message: 'Batch updated successfully' 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== DELETE ====================
    async deleteBatch(id) {
        try {
            const existing = await BatchRepository.getById(id);
            if (!existing) {
                return { success: false, error: 'Batch not found' };
            }

            // Check if batch has quantity in inventory
            const inventoryRepo = require("../repositories/inventory.repository");
            const inventory = await inventoryRepo.getByBatch(id);
            if (inventory && inventory.length > 0) {
                const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
                if (totalQuantity > 0) {
                    return { 
                        success: false, 
                        error: `Cannot delete batch with ${totalQuantity} units in inventory. Transfer or remove stock first.` 
                    };
                }
            }

            const result = await BatchRepository.delete(id);
            if (result.changes === 0) {
                return { success: false, error: 'Failed to delete batch' };
            }

            return { 
                success: true, 
                message: 'Batch deactivated successfully' 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== EXPIRY ====================
    async getExpiringBatches(days = 30) {
        try {
            const batches = await BatchRepository.getExpiringBatches(days);
            return { 
                success: true, 
                data: batches, 
                count: batches.length,
                message: `${batches.length} batches expiring in ${days} days`
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getExpiredBatches() {
        try {
            const batches = await BatchRepository.getExpiredBatches();
            return { 
                success: true, 
                data: batches, 
                count: batches.length,
                message: `${batches.length} expired batches found`
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== FIFO ====================
    async getBestBatchForProduct(productId, quantity) {
        try {
            // Get all active batches with available stock
            const batches = await BatchRepository.getActiveByProductId(productId);
            
            // Filter batches with enough quantity
            const availableBatches = batches.filter(b => b.quantity >= quantity);
            
            if (availableBatches.length === 0) {
                return { 
                    success: false, 
                    error: `Not enough stock available for product. Requested: ${quantity}` 
                };
            }

            // Sort by expiry date (FIFO - nearest expiry first)
            const sortedBatches = availableBatches.sort((a, b) => {
                // If no expiry date, put at the end
                if (!a.expiry_date) return 1;
                if (!b.expiry_date) return -1;
                return new Date(a.expiry_date) - new Date(b.expiry_date);
            });

            // Get the best batch (earliest expiry)
            const bestBatch = sortedBatches[0];

            return { 
                success: true, 
                data: bestBatch,
                message: `Found batch ${bestBatch.batch_number} with ${bestBatch.quantity} units expiring ${bestBatch.expiry_date || 'never'}`
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== QUANTITY ====================
    async getBatchQuantity(id) {
        try {
            const batch = await BatchRepository.getById(id);
            if (!batch) {
                return { success: false, error: 'Batch not found' };
            }
            return { success: true, quantity: batch.quantity };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateBatchQuantity(id, quantity) {
        try {
            const existing = await BatchRepository.getById(id);
            if (!existing) {
                return { success: false, error: 'Batch not found' };
            }

            if (quantity < 0) {
                return { success: false, error: 'Quantity cannot be negative' };
            }

            const result = await BatchRepository.updateQuantity(id, quantity);
            if (result.changes === 0) {
                return { success: false, error: 'Failed to update quantity' };
            }

            const updated = await BatchRepository.getById(id);
            return { 
                success: true, 
                data: updated, 
                message: 'Batch quantity updated successfully' 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== VALIDATION ====================
    async validateBatchNumber(batchNumber) {
        try {
            const batch = await BatchRepository.getBatchByNumber(batchNumber);
            return { 
                success: true, 
                exists: !!batch,
                data: batch || null
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = new BatchService();