// electron/services/purchase.service.js

const purchaseRepository = require('../repositories/purchase.repository');
const supplierRepository = require('../repositories/supplier.repository');
const warehouseRepository = require('../repositories/warehouse.repository');
const productRepository = require('../repositories/product.repository');
const inventoryService = require('./inventory.service');
const batchService = require('./batch.service');
const ledgerService = require('./ledger.service');
const pdfGenerator = require('../utils/pdfGenerator');
const db = require('../database/database');

class PurchaseService {
    // ==================== HELPER: Generate Batch Number ====================
    generateBatchNumber(productCode, productId) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const code = productCode || `PRD${productId}`;
        return `BATCH-${code}-${timestamp}-${random}`;
    }

    // ==================== HELPER: Verify Inventory-Batch Links ====================
    verifyInventoryBatchLinks(productId, warehouseId) {
        try {
            const result = db.prepare(`
                SELECT 
                    i.id,
                    i.product_id,
                    i.warehouse_id,
                    i.quantity,
                    i.batch_id,
                    b.batch_number,
                    b.quantity as batch_quantity
                FROM inventory i
                LEFT JOIN batches b ON i.batch_id = b.id
                WHERE i.product_id = ? AND i.warehouse_id = ?
                AND i.quantity > 0
            `).all(productId, warehouseId);
            
            console.log(`🔍 [Verify] Inventory-batch links for product ${productId}, warehouse ${warehouseId}:`);
            result.forEach(r => {
                console.log(`  - Inventory ${r.id}: qty ${r.quantity}, batch ${r.batch_id || 'NULL'} (${r.batch_number || 'NONE'})`);
            });
            
            return result;
        } catch (error) {
            console.error('Error verifying inventory-batch links:', error);
            return [];
        }
    }

    // ==================== CREATE ====================
    async createPurchase(data) {
        console.log('🟢 [PurchaseService] Creating purchase...');
        
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
        const processedItems = [];

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
            
            // ==========================================
            // ✅ CREATE BATCH FOR THIS PURCHASE ITEM
            // ==========================================
            const batchNumber = item.batch_number || this.generateBatchNumber(product.code, product.id);
            const expiryDate = item.expiry_date || null;
            
            console.log(`🟢 [PurchaseService] Creating batch for product: ${product.name}`);
            console.log(`  Batch Number: ${batchNumber}`);
            console.log(`  Quantity: ${item.quantity}`);
            console.log(`  Purchase Price: ${item.purchase_price}`);
            console.log(`  Sale Price: ${item.sale_price || product.sale_price || 0}`);
            console.log(`  Expiry Date: ${expiryDate || 'None'}`);
            
            const batchResult = await batchService.createBatch({
                product_id: item.product_id,
                batch_number: batchNumber,
                purchase_price: item.purchase_price,
                sale_price: item.sale_price || product.sale_price || 0,
                quantity: item.quantity,
                expiry_date: expiryDate,
                is_active: 1
            });

            if (!batchResult.success) {
                console.error('❌ Batch creation failed:', batchResult.error);
                throw new Error(`Failed to create batch: ${batchResult.error}`);
            }

            const batch = batchResult.data;
            console.log(`✅ Batch created with ID: ${batch.id}`);

            // ==========================================
            // ✅ ADD STOCK TO INVENTORY WITH BATCH REFERENCE
            // ==========================================
            console.log(`🟢 [PurchaseService] Adding stock to inventory...`);
            
            // First, check if inventory record exists for this product + warehouse + batch
            let existingInventory = db.prepare(`
                SELECT id, quantity FROM inventory 
                WHERE product_id = ? AND warehouse_id = ? AND batch_id = ?
            `).get(item.product_id, data.warehouse_id, batch.id);

            if (existingInventory) {
                // Update existing inventory
                const newQuantity = existingInventory.quantity + item.quantity;
                db.prepare(`
                    UPDATE inventory 
                    SET quantity = ?,
                        updated_at = CURRENT_TIMESTAMP,
                        last_updated = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).run(newQuantity, existingInventory.id);
                console.log(`  ✅ Updated existing inventory: ${existingInventory.quantity} → ${newQuantity}`);
            } else {
                // Create new inventory record with batch_id
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
                    data.warehouse_id,
                    batch.id,
                    item.quantity,
                    0,
                    0,
                    0
                );
                console.log(`  ✅ Created new inventory record with ${item.quantity} units linked to batch ${batch.id}`);
            }

            // ✅ Also update product stock_quantity
            const productUpdate = db.prepare(`
                UPDATE products 
                SET stock_quantity = stock_quantity + ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `);
            productUpdate.run(item.quantity, item.product_id);
            console.log(`  ✅ Updated product stock_quantity: +${item.quantity}`);

            // ✅ Verify the inventory-batch link was created
            const verification = this.verifyInventoryBatchLinks(item.product_id, data.warehouse_id);
            if (verification.length === 0) {
                console.warn(`⚠️ WARNING: No inventory-batch links found for product ${item.product_id} after creation!`);
            }

            console.log(`✅ Stock added successfully with batch link`);

            // Prepare processed item
            processedItems.push({
                product_id: item.product_id,
                batch_id: batch.id,
                quantity: item.quantity,
                purchase_price: item.purchase_price,
                sale_price: item.sale_price || product.sale_price || 0,
                total: itemTotal,
                expiry_date: expiryDate
            });

            // Update product purchase/sale prices if they've changed
            if (item.purchase_price !== product.purchase_price || 
                item.sale_price !== product.sale_price) {
                console.log(`🔄 Updating product prices for ${product.name}`);
                db.prepare(`
                    UPDATE products 
                    SET purchase_price = ?,
                        sale_price = COALESCE(?, sale_price),
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).run(item.purchase_price, item.sale_price, item.product_id);
            }

            console.log(`✅ Product ${product.name} processed successfully`);
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

        // Create purchase items with batch references
        purchaseRepository.createItems(purchase.id, processedItems);

        console.log(`✅ Purchase #${purchaseNumber} created with ID: ${purchase.id}`);

        // ==========================================
        // ✅ FINAL VERIFICATION - Show inventory state
        // ==========================================
        console.log('\n📊 Final Inventory State:');
        for (const item of data.items) {
            const inventory = this.verifyInventoryBatchLinks(item.product_id, data.warehouse_id);
            const product = productRepository.getById(item.product_id);
            console.log(`  Product: ${product?.name || 'Unknown'}`);
            console.log(`    Total inventory records: ${inventory.length}`);
            inventory.forEach(rec => {
                console.log(`    - Qty: ${rec.quantity}, Batch: ${rec.batch_number || 'NULL'}`);
            });
        }

        // ==========================================
        // ✅ Update supplier balance - FIXED
        // ==========================================
        console.log(`\n💰 Updating supplier balance...`);
        console.log(`  Total Amount: ${finalTotal}`);
        console.log(`  Paid Amount: ${paidAmount}`);
        console.log(`  Due Amount: ${dueAmount}`);

        // ✅ Add FULL amount to DEBIT (we owe supplier)
        if (finalTotal > 0) {
            console.log(`  ➕ Adding ${finalTotal} to DEBIT (total purchase)`);
            supplierRepository.updateDebit(data.supplier_id, finalTotal);
            console.log(`  ✅ Debit updated`);
        }

        // ✅ If payment was made, REDUCE DEBIT by the paid amount
        if (paidAmount > 0) {
            console.log(`  💳 Reducing DEBIT by ${paidAmount} (payment)`);
            const current = supplierRepository.getById(data.supplier_id);
            const newDebit = Math.max(0, (current.debit || 0) - paidAmount);
            supplierRepository.update(data.supplier_id, { debit: newDebit });
            console.log(`  ✅ New DEBIT: ${newDebit}`);
        }

        // Verify the update
        const updatedSupplier = supplierRepository.getById(data.supplier_id);
        console.log(`\n📊 Updated Supplier Balance:`);
        console.log(`  Credit: ${updatedSupplier?.credit || 0}`);
        console.log(`  Debit: ${updatedSupplier?.debit || 0}`);
        console.log(`  Net Balance: ${(updatedSupplier?.credit || 0) - (updatedSupplier?.debit || 0)}`);

        // ==========================================
        // ✅ CREATE LEDGER ENTRIES FOR PURCHASE AND PAYMENT - FIXED
        // ==========================================
        try {
            console.log(`\n📒 Creating ledger entries for purchase ${purchaseNumber}...`);
            console.log(`  Total Amount: ${finalTotal}`);
            console.log(`  Paid Amount: ${paidAmount}`);
            console.log(`  Due Amount: ${dueAmount}`);
            
            // 1. Purchase entry (DEBIT) - Full amount
            await ledgerService.createLedgerEntry({
                supplier_id: data.supplier_id,
                entry_type: 'debit',
                amount: finalTotal,
                description: `Purchase ${purchaseNumber}`,
                reference_type: 'purchase',
                reference_id: purchase.id,
                created_by: data.created_by,
                entry_date: data.purchase_date || new Date().toISOString()
            });
            console.log(`  ✅ Created purchase debit entry: ${finalTotal}`);
            
            // 2. Payment entry (CREDIT) - If any payment was made
            if (paidAmount > 0) {
                await ledgerService.createLedgerEntry({
                    supplier_id: data.supplier_id,
                    entry_type: 'credit',
                    amount: paidAmount,
                    description: `Payment for purchase ${purchaseNumber}`,
                    reference_type: 'payment',
                    reference_id: purchase.id,
                    created_by: data.created_by,
                    entry_date: data.purchase_date || new Date().toISOString()
                });
                console.log(`  ✅ Created payment credit entry: ${paidAmount}`);
            }
            
            console.log(`✅ Ledger entries created for purchase ${purchaseNumber}`);
        } catch (ledgerError) {
            console.error('❌ Failed to create ledger entries:', ledgerError);
            // Don't throw - purchase is already created, just log the error
        }

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

        console.log(`✅ Purchase completed successfully!`);
        
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

        if (data.status === 'cancelled' && existing.status !== 'cancelled') {
            const items = purchaseRepository.getItems(id);
            
            for (const item of items) {
                if (item.batch_id) {
                    await inventoryService.removeStock({
                        productId: item.product_id,
                        warehouseId: existing.warehouse_id,
                        batchId: item.batch_id,
                        quantity: item.quantity
                    });
                } else {
                    const existingInventory = db.prepare(`
                        SELECT id, quantity FROM inventory 
                        WHERE product_id = ? AND warehouse_id = ?
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
                }

                db.prepare(`
                    UPDATE products 
                    SET stock_quantity = stock_quantity - ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).run(item.quantity, item.product_id);
            }

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

        if (status === 'cancelled' && existing.status !== 'cancelled') {
            const items = purchaseRepository.getItems(id);
            
            for (const item of items) {
                if (item.batch_id) {
                    await inventoryService.removeStock({
                        productId: item.product_id,
                        warehouseId: existing.warehouse_id,
                        batchId: item.batch_id,
                        quantity: item.quantity
                    });
                } else {
                    const existingInventory = db.prepare(`
                        SELECT id, quantity FROM inventory 
                        WHERE product_id = ? AND warehouse_id = ?
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
                }

                db.prepare(`
                    UPDATE products 
                    SET stock_quantity = stock_quantity - ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).run(item.quantity, item.product_id);
            }

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

        if (existing.status === 'completed') {
            const items = purchaseRepository.getItems(id);
            
            for (const item of items) {
                if (item.batch_id) {
                    await inventoryService.removeStock({
                        productId: item.product_id,
                        warehouseId: existing.warehouse_id,
                        batchId: item.batch_id,
                        quantity: item.quantity
                    });
                } else {
                    const existingInventory = db.prepare(`
                        SELECT id, quantity FROM inventory 
                        WHERE product_id = ? AND warehouse_id = ?
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
                }

                db.prepare(`
                    UPDATE products 
                    SET stock_quantity = stock_quantity - ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).run(item.quantity, item.product_id);
            }

            const dueAmount = existing.total_amount - (existing.paid_amount || 0);
            if (dueAmount > 0) {
                supplierRepository.updateDebit(existing.supplier_id, -dueAmount);
            }
        }

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
                    (i.quantity - i.reserved_quantity) as available_quantity,
                    b.batch_number,
                    b.expiry_date,
                    b.quantity as batch_quantity
                FROM inventory i
                LEFT JOIN products p ON i.product_id = p.id
                LEFT JOIN units u ON p.unit_id = u.id
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN batches b ON i.batch_id = b.id
                WHERE i.warehouse_id = ?
                AND i.quantity > 0
                ORDER BY p.name ASC
            `);
            const result = stmt.all(warehouseId);
            
            console.log(`📊 Warehouse ${warehouseId} inventory: ${result.length} items`);
            result.forEach(item => {
                console.log(`  - ${item.product_name}: ${item.quantity} units, Batch: ${item.batch_number || 'NONE'}`);
            });
            
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

    // ==================== FIX ORPHAN INVENTORY ====================
    async fixOrphanInventory() {
        console.log('🔧 Fixing orphan inventory records...');
        
        try {
            const orphans = db.prepare(`
                SELECT 
                    i.id,
                    i.product_id,
                    i.warehouse_id,
                    i.quantity,
                    p.name as product_name,
                    p.code as product_code
                FROM inventory i
                LEFT JOIN products p ON i.product_id = p.id
                WHERE i.batch_id IS NULL
                AND i.quantity > 0
            `).all();
            
            console.log(`📊 Found ${orphans.length} orphan inventory records`);
            
            if (orphans.length === 0) {
                return { success: true, message: 'No orphan inventory records found' };
            }
            
            let fixedCount = 0;
            
            for (const record of orphans) {
                let batch = db.prepare(`
                    SELECT id FROM batches 
                    WHERE product_id = ? 
                    AND quantity > 0
                    ORDER BY created_at ASC
                    LIMIT 1
                `).get(record.product_id);
                
                if (!batch) {
                    const product = db.prepare(`
                        SELECT purchase_price, sale_price FROM products WHERE id = ?
                    `).get(record.product_id);
                    
                    const batchNumber = `FIXED-${record.product_code || record.product_id}-${Date.now()}`;
                    const insertBatch = db.prepare(`
                        INSERT INTO batches (
                            product_id,
                            batch_number,
                            purchase_price,
                            sale_price,
                            quantity,
                            is_active,
                            created_at
                        ) VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
                    `);
                    
                    const result = insertBatch.run(
                        record.product_id,
                        batchNumber,
                        product?.purchase_price || 0,
                        product?.sale_price || 0,
                        record.quantity
                    );
                    
                    batch = { id: result.lastInsertRowid };
                    console.log(`  ✅ Created new batch ${batchNumber} for ${record.product_name}`);
                }
                
                db.prepare(`
                    UPDATE inventory 
                    SET batch_id = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).run(batch.id, record.id);
                
                fixedCount++;
                console.log(`  ✅ Linked inventory ${record.id} to batch ${batch.id}`);
            }
            
            return {
                success: true,
                message: `Fixed ${fixedCount} orphan inventory records`,
                fixedCount
            };
        } catch (error) {
            console.error('Error fixing orphan inventory:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new PurchaseService();