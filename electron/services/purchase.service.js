// electron/services/purchase.service.js

const purchaseRepository = require('../repositories/purchase.repository');
const supplierRepository = require('../repositories/supplier.repository');
const warehouseRepository = require('../repositories/warehouse.repository');
const productRepository = require('../repositories/product.repository');
const inventoryService = require('./inventory.service');
const batchService = require('./batch.service');
const pdfGenerator = require('../utils/pdfGenerator');
const db = require('../database/database');

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
        if (!warehouse || !warehouse.success) {
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
        const paidAmount = data.paid_amount || 0;
        const dueAmount = finalTotal - paidAmount;

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
            paid_amount: paidAmount,
            due_amount: dueAmount,
            status: data.status || 'pending',
            payment_method: data.payment_method || null,
            purchase_date: data.purchase_date || new Date().toISOString(),
            notes: data.notes || null,
            created_by: data.created_by || null
        });

        // Create purchase items
        purchaseRepository.createItems(purchase.id, data.items);

        // ==========================================
        // ✅ Update inventory table
        // ==========================================
        console.log(`\n📦 Purchase #${purchaseNumber} created. Updating inventory...`);
        console.log(`📍 Warehouse ID: ${data.warehouse_id}`);
        console.log(`📋 Items count: ${data.items.length}`);

        // Start a database transaction to ensure all updates succeed or fail together
        const updateInventory = db.transaction((items, warehouseId) => {
            for (const item of items) {
                console.log(`  ⏳ Adding product ${item.product_id}, quantity ${item.quantity} to warehouse ${warehouseId}`);
                
                // Check if inventory record exists for this product in this warehouse
                const existing = db.prepare(`
                    SELECT id, quantity FROM inventory 
                    WHERE product_id = ? AND warehouse_id = ? AND batch_id IS NULL
                `).get(item.product_id, warehouseId);

                if (existing) {
                    // Update existing inventory
                    const newQuantity = existing.quantity + item.quantity;
                    db.prepare(`
                        UPDATE inventory 
                        SET quantity = ?,
                            updated_at = CURRENT_TIMESTAMP,
                            last_updated = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `).run(newQuantity, existing.id);
                    
                    console.log(`  ✅ Updated existing inventory: ${existing.quantity} → ${newQuantity}`);
                } else {
                    // Create new inventory record
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
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    `).run(
                        item.product_id,
                        warehouseId,
                        null, // batch_id (null for now)
                        item.quantity,
                        0, // reserved_quantity
                        0, // min_stock
                        0 // max_stock
                    );
                    
                    console.log(`  ✅ Created new inventory record with ${item.quantity} units`);
                }

                // Update product stock_quantity
                db.prepare(`
                    UPDATE products 
                    SET stock_quantity = stock_quantity + ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).run(item.quantity, item.product_id);
            }
        });

        // Execute the transaction
        try {
            updateInventory(data.items, data.warehouse_id);
            console.log('✅ Inventory updated successfully!');
        } catch (error) {
            console.error('❌ Inventory update failed:', error);
            throw new Error(`Failed to update inventory: ${error.message}`);
        }

        // ==========================================
        // ✅ Update supplier balance
        // ==========================================
        console.log(`\n💰 Updating supplier balance...`);
        console.log(`  Total Amount: ${finalTotal}`);
        console.log(`  Paid Amount: ${paidAmount}`);
        console.log(`  Due Amount: ${dueAmount}`);

        if (dueAmount > 0) {
            // We owe money to supplier → Increase DEBIT (negative balance)
            console.log(`  ➕ Adding ${dueAmount} to DEBIT (we owe supplier)`);
            const result = supplierRepository.updateDebit(data.supplier_id, dueAmount);
            console.log(`  ✅ Debit updated:`, result);
        } else if (dueAmount < 0) {
            // Supplier owes us money → Increase CREDIT (positive balance)
            const creditAmount = Math.abs(dueAmount);
            console.log(`  ➕ Adding ${creditAmount} to CREDIT (supplier owes us)`);
            const result = supplierRepository.updateCredit(data.supplier_id, creditAmount);
            console.log(`  ✅ Credit updated:`, result);
        } else {
            console.log(`  ℹ️ No balance change (fully paid)`);
        }

        // Verify the update
        const updatedSupplier = supplierRepository.getById(data.supplier_id);
        console.log(`\n📊 Updated Supplier Balance:`);
        console.log(`  Credit: ${updatedSupplier?.credit || 0}`);
        console.log(`  Debit: ${updatedSupplier?.debit || 0}`);
        console.log(`  Net Balance: ${(updatedSupplier?.credit || 0) - (updatedSupplier?.debit || 0)}`);

        // ==========================================
        // ✅ GENERATE PDF
        // ==========================================
        try {
            const purchaseWithDetails = this.getPurchaseById(purchase.id);
            const itemsWithDetails = purchaseRepository.getItems(purchase.id);
            
            const pdfResult = await pdfGenerator.generateAndSavePurchase(
                purchaseWithDetails.data,
                itemsWithDetails
            );
            
            if (pdfResult.success) {
                console.log(`📄 Purchase PDF generated: ${pdfResult.filename}`);
                console.log(`📁 Saved to: ${pdfResult.path}`);
            } else {
                console.error('❌ PDF generation failed:', pdfResult.error);
            }
        } catch (pdfError) {
            console.error('❌ PDF generation error:', pdfError);
            // Don't fail the purchase if PDF generation fails
        }

        // Return complete purchase
        return this.getPurchaseById(purchase.id);
    }

    // ==================== READ ====================
    getAllPurchases(filters = {}) {
        const purchases = purchaseRepository.getAll(filters);
        
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

        // If status is being updated to cancelled, reverse inventory and balance
        if (data.status === 'cancelled' && existing.status !== 'cancelled') {
            const items = purchaseRepository.getItems(id);
            
            // Reverse inventory
            for (const item of items) {
                const existingInventory = db.prepare(`
                    SELECT id, quantity FROM inventory 
                    WHERE product_id = ? AND warehouse_id = ? AND batch_id IS NULL
                `).get(item.product_id, existing.warehouse_id);

                if (existingInventory) {
                    const newQuantity = existingInventory.quantity - item.quantity;
                    db.prepare(`
                        UPDATE inventory 
                        SET quantity = ?,
                            updated_at = CURRENT_TIMESTAMP,
                            last_updated = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `).run(newQuantity, existingInventory.id);
                }

                db.prepare(`
                    UPDATE products 
                    SET stock_quantity = stock_quantity - ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).run(item.quantity, item.product_id);
            }

            // Reverse supplier balance
            const dueAmount = existing.total_amount - (existing.paid_amount || 0);
            if (dueAmount > 0) {
                supplierRepository.updateDebit(existing.supplier_id, -dueAmount);
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

        // If cancelling, reverse inventory and balance
        if (status === 'cancelled' && existing.status !== 'cancelled') {
            const items = purchaseRepository.getItems(id);
            
            // Reverse inventory
            for (const item of items) {
                const existingInventory = db.prepare(`
                    SELECT id, quantity FROM inventory 
                    WHERE product_id = ? AND warehouse_id = ? AND batch_id IS NULL
                `).get(item.product_id, existing.warehouse_id);

                if (existingInventory) {
                    const newQuantity = existingInventory.quantity - item.quantity;
                    db.prepare(`
                        UPDATE inventory 
                        SET quantity = ?,
                            updated_at = CURRENT_TIMESTAMP,
                            last_updated = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `).run(newQuantity, existingInventory.id);
                }

                db.prepare(`
                    UPDATE products 
                    SET stock_quantity = stock_quantity - ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).run(item.quantity, item.product_id);
            }

            // Reverse supplier balance
            const dueAmount = existing.total_amount - (existing.paid_amount || 0);
            if (dueAmount > 0) {
                supplierRepository.updateDebit(existing.supplier_id, -dueAmount);
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

        // If completed, reverse inventory and balance
        if (existing.status === 'completed') {
            const items = purchaseRepository.getItems(id);
            
            for (const item of items) {
                const existingInventory = db.prepare(`
                    SELECT id, quantity FROM inventory 
                    WHERE product_id = ? AND warehouse_id = ? AND batch_id IS NULL
                `).get(item.product_id, existing.warehouse_id);

                if (existingInventory) {
                    const newQuantity = existingInventory.quantity - item.quantity;
                    db.prepare(`
                        UPDATE inventory 
                        SET quantity = ?,
                            updated_at = CURRENT_TIMESTAMP,
                            last_updated = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `).run(newQuantity, existingInventory.id);
                }

                db.prepare(`
                    UPDATE products 
                    SET stock_quantity = stock_quantity - ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).run(item.quantity, item.product_id);
            }

            // Reverse supplier balance
            const dueAmount = existing.total_amount - (existing.paid_amount || 0);
            if (dueAmount > 0) {
                supplierRepository.updateDebit(existing.supplier_id, -dueAmount);
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

    // ==================== GET WAREHOUSE INVENTORY ====================
    getWarehouseInventory(warehouseId) {
        try {
            const stmt = db.prepare(`
                SELECT 
                    i.*,
                    p.name as product_name,
                    p.code as product_code,
                    p.sale_price,
                    p.purchase_price,
                    u.abbreviation as unit,
                    c.name as category_name,
                    c.id as category_id,
                    (i.quantity - i.reserved_quantity) as available_quantity
                FROM inventory i
                LEFT JOIN products p ON i.product_id = p.id
                LEFT JOIN units u ON p.unit_id = u.id
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE i.warehouse_id = ?
                AND i.quantity > 0
                ORDER BY p.name ASC
            `);
            const result = stmt.all(warehouseId);
            return {
                success: true,
                data: result,
                count: result.length
            };
        } catch (error) {
            console.error('Error getting warehouse inventory:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }
}

module.exports = new PurchaseService();