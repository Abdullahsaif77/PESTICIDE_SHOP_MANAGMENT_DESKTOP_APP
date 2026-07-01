// electron/services/sales.service.js

const salesRepository = require('../repositories/sales.repository');
const customerRepository = require('../repositories/customer.repository');
const warehouseRepository = require('../repositories/warehouse.repository');
const productRepository = require('../repositories/product.repository');
const inventoryService = require('./inventory.service');
const batchService = require('./batch.service');

class SalesService {
    // ==================== FIFO LOGIC ====================
    async getFIFOBatches(productId, warehouseId, quantity) {
        // Get all active batches for this product in this warehouse
        const batches = await batchService.getBatchesByProductAndWarehouse(
            productId,
            warehouseId,
            true // only active batches
        );

        // Sort by expiry date (oldest first)
        const sortedBatches = batches.sort((a, b) => {
            if (!a.expiry_date) return 1;
            if (!b.expiry_date) return -1;
            return new Date(a.expiry_date) - new Date(b.expiry_date);
        });

        // Allocate quantity from batches (FIFO)
        const allocatedBatches = [];
        let remainingQty = quantity;

        for (const batch of sortedBatches) {
            if (remainingQty <= 0) break;

            const availableQty = batch.quantity - (batch.reserved_quantity || 0);
            if (availableQty <= 0) continue;

            const takenQty = Math.min(remainingQty, availableQty);
            allocatedBatches.push({
                batch_id: batch.id,
                product_id: batch.product_id,
                batch_number: batch.batch_number,
                quantity: takenQty,
                purchase_price: batch.purchase_price || 0,
                sale_price: batch.sale_price || 0,
                expiry_date: batch.expiry_date
            });

            remainingQty -= takenQty;
        }

        if (remainingQty > 0) {
            throw new Error(`Insufficient stock. Only ${quantity - remainingQty} available`);
        }

        return allocatedBatches;
    }

    // ==================== CREATE ====================
    async createSale(data) {
        // Validate customer
        const customer = customerRepository.getById(data.customer_id);
        if (!customer) {
            throw new Error('Customer not found');
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
        const processedItems = [];

        // Process each item with FIFO
        for (const item of data.items) {
            const product = productRepository.getById(item.product_id);
            if (!product) {
                throw new Error(`Product not found: ${item.product_id}`);
            }

            if (item.quantity <= 0) {
                throw new Error(`Quantity must be greater than 0 for ${product.name}`);
            }

            // Get FIFO batches for this product
            const batches = await this.getFIFOBatches(
                item.product_id,
                data.warehouse_id,
                item.quantity
            );

            // For each batch, create a sale item
            for (const batch of batches) {
                const salePrice = item.sale_price || product.sale_price || 0;
                const itemTotal = batch.quantity * salePrice;
                totalAmount += itemTotal;

                processedItems.push({
                    product_id: item.product_id,
                    batch_id: batch.batch_id,
                    quantity: batch.quantity,
                    sale_price: salePrice,
                    purchase_price: batch.purchase_price || 0,
                    discount: item.discount || 0,
                    total: itemTotal
                });

                // Update inventory - remove stock from this batch
                await inventoryService.removeStock({
                    product_id: item.product_id,
                    warehouse_id: data.warehouse_id,
                    batch_id: batch.batch_id,
                    quantity: batch.quantity
                });
            }
        }

        // Apply discount and tax
        const discount = data.discount || 0;
        const tax = data.tax || 0;
        const finalTotal = totalAmount - discount + tax;

        // Generate invoice number
        const invoiceNumber = salesRepository.generateNumber();

        // Create sale
        const sale = salesRepository.create({
            invoice_number: invoiceNumber,
            customer_id: data.customer_id,
            warehouse_id: data.warehouse_id,
            total_amount: finalTotal,
            discount: discount,
            tax: tax,
            paid_amount: data.paid_amount || 0,
            due_amount: finalTotal - (data.paid_amount || 0),
            status: data.status || 'completed',
            payment_method: data.payment_method || null,
            sale_date: data.sale_date || new Date().toISOString(),
            notes: data.notes || null,
            created_by: data.created_by || null
        });

        // Create sale items
        salesRepository.createItems(sale.id, processedItems);

        // Update customer balance (debit - customer owes us)
        await this.updateCustomerBalance(data.customer_id, finalTotal, 'debit');

        // Return complete sale
        return this.getSaleById(sale.id);
    }

    // ==================== UPDATE CUSTOMER BALANCE ====================
    async updateCustomerBalance(customerId, amount, type) {
        const customer = customerRepository.getById(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        if (type === 'debit') {
            // Customer owes us - debit increases
            const newDebit = (customer.debit || 0) + amount;
            customerRepository.update(customerId, { debit: newDebit });
        } else if (type === 'credit') {
            // We owe customer - credit increases
            const newCredit = (customer.credit || 0) + amount;
            customerRepository.update(customerId, { credit: newCredit });
        }
    }

    // ==================== READ ====================
    getAllSales(filters = {}) {
        const sales = salesRepository.getAll(filters);
        
        const result = sales.map(sale => {
            const items = salesRepository.getItems(sale.id);
            return { ...sale, items };
        });

        return {
            success: true,
            data: result,
            count: result.length
        };
    }

    getSaleById(id) {
        if (!id || isNaN(id)) {
            throw new Error('Invalid sale ID');
        }

        const sale = salesRepository.getById(id);
        if (!sale) {
            throw new Error('Sale not found');
        }

        const items = salesRepository.getItems(id);

        return {
            success: true,
            data: { ...sale, items }
        };
    }

    getSaleByInvoiceNumber(number) {
        const sale = salesRepository.getByInvoiceNumber(number);
        if (!sale) {
            throw new Error('Sale not found');
        }

        const items = salesRepository.getItems(sale.id);

        return {
            success: true,
            data: { ...sale, items }
        };
    }

    getCustomerSales(customerId) {
        if (!customerId || isNaN(customerId)) {
            throw new Error('Invalid customer ID');
        }

        const sales = salesRepository.getAll({ customer_id: customerId });
        
        const result = sales.map(sale => {
            const items = salesRepository.getItems(sale.id);
            return { ...sale, items };
        });

        return {
            success: true,
            data: result,
            count: result.length
        };
    }

    // ==================== UPDATE ====================
    async updateSale(id, data) {
        if (!id || isNaN(id)) {
            throw new Error('Invalid sale ID');
        }

        const existing = salesRepository.getById(id);
        if (!existing) {
            throw new Error('Sale not found');
        }

        // If status is being updated to cancelled, reverse inventory
        if (data.status === 'cancelled' && existing.status !== 'cancelled') {
            const items = salesRepository.getItems(id);
            for (const item of items) {
                // Add stock back to inventory
                await inventoryService.addStock({
                    product_id: item.product_id,
                    warehouse_id: existing.warehouse_id,
                    batch_id: item.batch_id,
                    quantity: item.quantity
                });
            }

            // Reverse customer balance
            await this.updateCustomerBalance(
                existing.customer_id,
                existing.total_amount,
                'debit'
            );
        }

        const sale = salesRepository.update(id, data);
        if (!sale) {
            throw new Error('Failed to update sale');
        }

        return {
            success: true,
            data: sale,
            message: 'Sale updated successfully'
        };
    }

    async updateSaleStatus(id, status) {
        if (!id || isNaN(id)) {
            throw new Error('Invalid sale ID');
        }

        if (!['completed', 'pending', 'cancelled'].includes(status)) {
            throw new Error('Invalid status');
        }

        const existing = salesRepository.getById(id);
        if (!existing) {
            throw new Error('Sale not found');
        }

        // If cancelling, reverse inventory
        if (status === 'cancelled' && existing.status !== 'cancelled') {
            const items = salesRepository.getItems(id);
            for (const item of items) {
                await inventoryService.addStock({
                    product_id: item.product_id,
                    warehouse_id: existing.warehouse_id,
                    batch_id: item.batch_id,
                    quantity: item.quantity
                });
            }

            // Reverse customer balance
            await this.updateCustomerBalance(
                existing.customer_id,
                existing.total_amount,
                'debit'
            );
        }

        const sale = salesRepository.updateStatus(id, status);
        if (!sale) {
            throw new Error('Failed to update sale status');
        }

        return {
            success: true,
            data: sale,
            message: `Sale ${status} successfully`
        };
    }

    // ==================== DELETE ====================
    async deleteSale(id) {
        if (!id || isNaN(id)) {
            throw new Error('Invalid sale ID');
        }

        const existing = salesRepository.getById(id);
        if (!existing) {
            throw new Error('Sale not found');
        }

        // Reverse inventory
        const items = salesRepository.getItems(id);
        for (const item of items) {
            await inventoryService.addStock({
                product_id: item.product_id,
                warehouse_id: existing.warehouse_id,
                batch_id: item.batch_id,
                quantity: item.quantity
            });
        }

        // Delete sale items first, then sale
        salesRepository.deleteItems(id);
        const result = salesRepository.delete(id);

        if (!result) {
            throw new Error('Failed to delete sale');
        }

        return {
            success: true,
            message: 'Sale deleted successfully'
        };
    }

    // ==================== STATS ====================
    getSaleStats(filters = {}) {
        const stats = salesRepository.getStats(filters);
        return {
            success: true,
            data: stats
        };
    }

    // ==================== GENERATE NUMBER ====================
    generateInvoiceNumber() {
        const number = salesRepository.generateNumber();
        return {
            success: true,
            data: { invoice_number: number }
        };
    }
}

module.exports = new SalesService();