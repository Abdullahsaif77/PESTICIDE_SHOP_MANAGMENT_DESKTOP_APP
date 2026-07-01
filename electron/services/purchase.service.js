// electron/services/purchase.service.js

const purchaseRepository = require('../repositories/purchase.repository');
const supplierRepository = require('../repositories/supplier.repository');
const warehouseRepository = require('../repositories/warehouse.repository');
const productRepository = require('../repositories/product.repository');
const inventoryService = require('./inventory.service');
const batchService = require('./batch.service');

class PurchaseService {
    // ==================== CREATE ====================
    async createPurchase(data) {
        // Validate supplier
        const supplier = supplierRepository.getById(data.supplier_id);
        if (!supplier) {
            throw new Error('Supplier not found');
        }

        // Validate warehouse
        const warehouse = warehouseRepository.getById(data.warehouse_id);
        if (!warehouse) {
            throw new Error('Warehouse not found');
        }

        // Validate items
        if (!data.items || data.items.length === 0) {
            throw new Error('At least one item is required');
        }

        let totalAmount = 0;

        // Process each item
        for (const item of data.items) {
            const product = productRepository.getById(item.product_id);
            if (!product) {
                throw new Error(`Product not found: ${item.product_id}`);
            }

            if (item.quantity <= 0) {
                throw new Error(`Quantity must be greater than 0 for ${product.name}`);
            }

            if (item.purchase_price <= 0) {
                throw new Error(`Purchase price must be greater than 0 for ${product.name}`);
            }

            // Calculate total
            const itemTotal = item.quantity * item.purchase_price;
            totalAmount += itemTotal;
            item.total = itemTotal;
            item.sale_price = item.sale_price || product.sale_price || 0;
        }

        // Apply discount and tax
        const discount = data.discount || 0;
        const tax = data.tax || 0;
        const finalTotal = totalAmount - discount + tax;

        // Generate purchase number
        const purchaseNumber = purchaseRepository.generateNumber();

        // Create purchase
        const purchase = purchaseRepository.create({
            purchase_number: purchaseNumber,
            supplier_id: data.supplier_id,
            warehouse_id: data.warehouse_id,
            total_amount: finalTotal,
            discount: discount,
            tax: tax,
            paid_amount: data.paid_amount || 0,
            due_amount: finalTotal - (data.paid_amount || 0),
            status: data.status || 'pending',
            payment_method: data.payment_method || null,
            purchase_date: data.purchase_date || new Date().toISOString(),
            notes: data.notes || null,
            created_by: data.created_by || null
        });

        // Create purchase items
        purchaseRepository.createItems(purchase.id, data.items);

        // Update supplier balance (debit - amount we owe supplier)
        // Since we bought from supplier, we owe them money -> debit increases
        const supplierUpdate = supplierRepository.updateBalance(
            data.supplier_id,
            0, // credit unchanged
            finalTotal // debit increases (we owe supplier)
        );

        // Update inventory and batches
        for (const item of data.items) {
            // Create or get batch
            let batchId = null;
            
            if (item.batch_number) {
                // Create new batch
                const batch = await batchService.createBatch({
                    product_id: item.product_id,
                    batch_number: item.batch_number,
                    purchase_price: item.purchase_price,
                    sale_price: item.sale_price || 0,
                    quantity: item.quantity,
                    expiry_date: item.expiry_date || null
                });
                batchId = batch.id;
            }

            // Update inventory
            await inventoryService.addStock({
                product_id: item.product_id,
                warehouse_id: data.warehouse_id,
                batch_id: batchId,
                quantity: item.quantity,
                purchase_price: item.purchase_price,
                sale_price: item.sale_price || 0
            });
        }

        // Return complete purchase
        return this.getPurchaseById(purchase.id);
    }

    // ==================== READ ====================
    getAllPurchases(filters = {}) {
        const purchases = purchaseRepository.getAll(filters);
        
        // Get items for each purchase
        const result = purchases.map(purchase => {
            const items = purchaseRepository.getItems(purchase.id);
            return { ...purchase, items };
        });

        return {
            success: true,
            data: result,
            count: result.length
        };
    }

    getPurchaseById(id) {
        if (!id || isNaN(id)) {
            throw new Error('Invalid purchase ID');
        }

        const purchase = purchaseRepository.getById(id);
        if (!purchase) {
            throw new Error('Purchase not found');
        }

        const items = purchaseRepository.getItems(id);

        return {
            success: true,
            data: { ...purchase, items }
        };
    }

    getPurchaseByNumber(number) {
        const purchase = purchaseRepository.getByNumber(number);
        if (!purchase) {
            throw new Error('Purchase not found');
        }

        const items = purchaseRepository.getItems(purchase.id);

        return {
            success: true,
            data: { ...purchase, items }
        };
    }

    getSupplierPurchases(supplierId) {
        if (!supplierId || isNaN(supplierId)) {
            throw new Error('Invalid supplier ID');
        }

        const purchases = purchaseRepository.getAll({ supplier_id: supplierId });
        
        const result = purchases.map(purchase => {
            const items = purchaseRepository.getItems(purchase.id);
            return { ...purchase, items };
        });

        return {
            success: true,
            data: result,
            count: result.length
        };
    }

    // ==================== UPDATE ====================
    async updatePurchase(id, data) {
        if (!id || isNaN(id)) {
            throw new Error('Invalid purchase ID');
        }

        const existing = purchaseRepository.getById(id);
        if (!existing) {
            throw new Error('Purchase not found');
        }

        // If status is being updated to completed, handle inventory
        if (data.status === 'completed' && existing.status !== 'completed') {
            // Purchase completed - inventory already updated on creation
            // Just update the status
        }

        // If status is being updated to cancelled, reverse inventory
        if (data.status === 'cancelled' && existing.status !== 'cancelled') {
            // Reverse inventory updates
            const items = purchaseRepository.getItems(id);
            for (const item of items) {
                await inventoryService.removeStock({
                    product_id: item.product_id,
                    warehouse_id: existing.warehouse_id,
                    quantity: item.quantity,
                    batch_id: item.batch_id
                });
            }
        }

        const purchase = purchaseRepository.update(id, data);
        if (!purchase) {
            throw new Error('Failed to update purchase');
        }

        return {
            success: true,
            data: purchase,
            message: 'Purchase updated successfully'
        };
    }

    async updatePurchaseStatus(id, status) {
        if (!id || isNaN(id)) {
            throw new Error('Invalid purchase ID');
        }

        if (!['pending', 'completed', 'cancelled'].includes(status)) {
            throw new Error('Invalid status');
        }

        const existing = purchaseRepository.getById(id);
        if (!existing) {
            throw new Error('Purchase not found');
        }

        // If cancelling, reverse inventory
        if (status === 'cancelled' && existing.status !== 'cancelled') {
            const items = purchaseRepository.getItems(id);
            for (const item of items) {
                await inventoryService.removeStock({
                    product_id: item.product_id,
                    warehouse_id: existing.warehouse_id,
                    quantity: item.quantity,
                    batch_id: item.batch_id
                });
            }

            // Reverse supplier balance
            const supplier = supplierRepository.getById(existing.supplier_id);
            if (supplier) {
                supplierRepository.updateBalance(
                    existing.supplier_id,
                    0,
                    -existing.total_amount // Decrease debit (reverse amount we owe)
                );
            }
        }

        const purchase = purchaseRepository.updateStatus(id, status);
        if (!purchase) {
            throw new Error('Failed to update purchase status');
        }

        return {
            success: true,
            data: purchase,
            message: `Purchase ${status} successfully`
        };
    }

    // ==================== DELETE ====================
    async deletePurchase(id) {
        if (!id || isNaN(id)) {
            throw new Error('Invalid purchase ID');
        }

        const existing = purchaseRepository.getById(id);
        if (!existing) {
            throw new Error('Purchase not found');
        }

        // If completed, reverse inventory first
        if (existing.status === 'completed') {
            const items = purchaseRepository.getItems(id);
            for (const item of items) {
                await inventoryService.removeStock({
                    product_id: item.product_id,
                    warehouse_id: existing.warehouse_id,
                    quantity: item.quantity,
                    batch_id: item.batch_id
                });
            }
        }

        // Delete purchase items first, then purchase
        purchaseRepository.deleteItems(id);
        const result = purchaseRepository.delete(id);

        if (!result) {
            throw new Error('Failed to delete purchase');
        }

        return {
            success: true,
            message: 'Purchase deleted successfully'
        };
    }

    // ==================== STATS ====================
    getPurchaseStats(filters = {}) {
        const stats = purchaseRepository.getStats(filters);
        return {
            success: true,
            data: stats
        };
    }

    // ==================== GENERATE NUMBER ====================
    generatePurchaseNumber() {
        const number = purchaseRepository.generateNumber();
        return {
            success: true,
            data: { purchase_number: number }
        };
    }
}

module.exports = new PurchaseService();