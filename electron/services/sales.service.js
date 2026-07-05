// electron/services/sales.service.js

const salesRepository = require('../repositories/sales.repository');
const customerRepository = require('../repositories/customer.repository');
const warehouseRepository = require('../repositories/warehouse.repository');
const productRepository = require('../repositories/product.repository');
const inventoryService = require('./inventory.service');
const batchService = require('./batch.service');
const saleGenerator = require("../utils/saleGenerator")

class SalesService {
    // ==================== FIFO LOGIC ====================
    async getFIFOBatches(productId, warehouseId, quantity) {
        const result = await batchService.getBatchesByProductAndWarehouse(
            productId,
            warehouseId,
            true
        );

        if (!result.success || !result.data || result.data.length === 0) {
            throw new Error(`No stock available for product in this warehouse`);
        }

        let batches = result.data;

        const sortedBatches = batches.sort((a, b) => {
            if (!a.expiry_date) return 1;
            if (!b.expiry_date) return -1;
            return new Date(a.expiry_date) - new Date(b.expiry_date);
        });

        const allocatedBatches = [];
        let remainingQty = quantity;

        for (const batch of sortedBatches) {
            if (remainingQty <= 0) break;

            const availableQty = batch.available_quantity || batch.quantity || 0;
            if (availableQty <= 0) continue;

            const takenQty = Math.min(remainingQty, availableQty);
            allocatedBatches.push({
                batch_id: batch.id,
                product_id: batch.product_id,
                batch_number: batch.batch_number,
                quantity: takenQty,
                purchase_price: batch.purchase_price || 0,
                sale_price: batch.sale_price || 0,
                expiry_date: batch.expiry_date,
                inventory_id: batch.inventory_id
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
        console.log('🟢 [SalesService] createSale called:', {
            customer_id: data.customer_id,
            warehouse_id: data.warehouse_id,
            items: data.items?.length || 0
        });

        if (!data.warehouse_id) {
            throw new Error(`Warehouse ID is required (received: ${data.warehouse_id})`);
        }

        const warehouseId = parseInt(data.warehouse_id);
        if (isNaN(warehouseId)) {
            throw new Error(`Invalid warehouse ID: ${data.warehouse_id}`);
        }

        const customer = customerRepository.getById(data.customer_id);
        if (!customer) {
            throw new Error('Customer not found');
        }

        const warehouse = warehouseRepository.getById(warehouseId);
        if (!warehouse) {
            throw new Error('Warehouse not found');
        }

        if (!data.items || data.items.length === 0) {
            throw new Error('At least one item is required');
        }

        let totalAmount = 0;
        const processedItems = [];

        for (const item of data.items) {
            const product = productRepository.getById(item.product_id);
            if (!product) {
                throw new Error(`Product not found: ${item.product_id}`);
            }

            if (item.quantity <= 0) {
                throw new Error(`Quantity must be greater than 0 for ${product.name}`);
            }

            console.log(`🟢 [SalesService] Processing item: ${product.name} x ${item.quantity}`);

            const batches = await this.getFIFOBatches(
                item.product_id,
                warehouseId,
                item.quantity
            );

            console.log(`🟢 [SalesService] Found ${batches.length} batches for FIFO`);

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

                console.log(`🟢 [SalesService] Removing stock: batch ${batch.batch_id}, qty ${batch.quantity}, warehouse ${warehouseId}`);

                const removeResult = await inventoryService.removeStock({
                    productId: item.product_id,
                    warehouseId: warehouseId,
                    batchId: batch.batch_id,
                    quantity: batch.quantity
                });

                console.log(`🟢 [SalesService] removeStock result:`, removeResult);

                if (!removeResult.success) {
                    throw new Error(`Failed to remove stock: ${removeResult.error}`);
                }
            }
        }

        const discount = data.discount || 0;
        const tax = data.tax || 0;
        const finalTotal = totalAmount - discount + tax;

        console.log(`🟢 [SalesService] Final total: ${finalTotal}`);

        const invoiceNumber = salesRepository.generateNumber();

        const sale = salesRepository.create({
            invoice_number: invoiceNumber,
            customer_id: data.customer_id,
            warehouse_id: warehouseId,
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

        salesRepository.createItems(sale.id, processedItems);

        await this.updateCustomerBalance(data.customer_id, finalTotal, 'debit');

        console.log(`🟢 [SalesService] Sale created successfully: ${sale.invoice_number}`);

        return this.getSaleById(sale.id);
    }

    // ==================== UPDATE CUSTOMER BALANCE ====================
    async updateCustomerBalance(customerId, amount, type) {
        const customer = customerRepository.getById(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        if (type === 'debit') {
            const newDebit = (customer.debit || 0) + amount;
            customerRepository.update(customerId, { debit: newDebit });
        } else if (type === 'credit') {
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

        if (data.status === 'cancelled' && existing.status !== 'cancelled') {
            const items = salesRepository.getItems(id);
            for (const item of items) {
                const addResult = await inventoryService.addStock({
                    productId: item.product_id,
                    warehouseId: existing.warehouse_id,
                    batchId: item.batch_id,
                    quantity: item.quantity
                });

                if (!addResult.success) {
                    console.error(`Failed to add stock back: ${addResult.error}`);
                }
            }

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

        if (status === 'cancelled' && existing.status !== 'cancelled') {
            const items = salesRepository.getItems(id);
            for (const item of items) {
                const addResult = await inventoryService.addStock({
                    productId: item.product_id,
                    warehouseId: existing.warehouse_id,
                    batchId: item.batch_id,
                    quantity: item.quantity
                });

                if (!addResult.success) {
                    console.error(`Failed to add stock back: ${addResult.error}`);
                }
            }

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

        const items = salesRepository.getItems(id);
        for (const item of items) {
            const addResult = await inventoryService.addStock({
                productId: item.product_id,
                warehouseId: existing.warehouse_id,
                batchId: item.batch_id,
                quantity: item.quantity
            });

            if (!addResult.success) {
                console.error(`Failed to add stock back: ${addResult.error}`);
            }
        }

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

    // ==================== PDF GENERATION ====================
    async generateAndSavePDF(saleData, items, window = null) {
        console.log('🔵 [SalesService] generateAndSavePDF called');
        console.log('🔵 [SalesService] saleData:', saleData);
        console.log('🔵 [SalesService] items count:', items?.length || 0);
        console.log('🔵 [SalesService] window:', window ? 'provided' : 'null');
        console.log('🔵 [SalesService] saleGenerator exists?', !!saleGenerator);
        
        try {
            // Fetch customer details if not already in saleData
            if (saleData.customer_id && !saleData.customer_name) {
                console.log('🔵 [SalesService] Fetching customer details for ID:', saleData.customer_id);
                const customer = customerRepository.getById(saleData.customer_id);
                if (customer) {
                    saleData.customer_name = customer.name;
                    saleData.customer_phone = customer.phone;
                    saleData.customer_address = customer.address;
                    console.log('🔵 [SalesService] Customer found:', customer.name);
                } else {
                    console.log('🔵 [SalesService] Customer NOT found for ID:', saleData.customer_id);
                }
            }

            // Ensure invoice_number is set
            if (!saleData.invoice_number) {
                console.log('🔵 [SalesService] No invoice number, generating...');
                saleData.invoice_number = salesRepository.generateNumber();
                console.log('🔵 [SalesService] Generated invoice number:', saleData.invoice_number);
            }

            console.log('🔵 [SalesService] Calling saleGenerator.generateAndSaveSale...');
            // Generate and save the PDF using the sale generator
            const result = await saleGenerator.generateAndSaveSale(saleData, items, window);
            console.log('🔵 [SalesService] saleGenerator result:', result);
            return result;
        } catch (error) {
            console.error('❌ [SalesService] PDF generation error:', error);
            return { success: false, error: error.message };
        }
    }

}

module.exports = new SalesService();