// electron/database/init.js

const Database = require("better-sqlite3");
const path = require("path");
const bcrypt = require("bcryptjs");
const schema = require("./schema");

const dbPath = path.join(__dirname, "shop.db");
const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

try {
    // ===============================
    // Create tables
    // ===============================
    const statements = schema
        .split(";")
        .map(s => s.trim())
        .filter(Boolean);

    for (const stmt of statements) {
        try {
            db.exec(stmt);
        } catch (err) {
            console.log("FAILED SQL:");
            console.log(stmt);
            throw err;
        }
    }

    console.log("Schema loaded successfully.");

    // ===============================
    // DATABASE MIGRATIONS
    // ===============================

    // ---- Check if we need to migrate inventory data to batches ----
    const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='inventory'").get();
    
    if (tableInfo) {
        // Check if inventory has batch_id column
        const inventoryColumns = db.prepare("PRAGMA table_info(inventory)").all();
        const hasBatchId = inventoryColumns.some(col => col.name === "batch_id");
        
        // Check if there are inventory records without batch_id
        const orphanInventory = db.prepare("SELECT COUNT(*) as count FROM inventory WHERE batch_id IS NULL").get();
        
        if (hasBatchId && orphanInventory.count > 0) {
            console.log(`Migration: Found ${orphanInventory.count} inventory records without batch_id. Creating batches...`);
            
            // ===== FIX: Check for existing batches before creating new ones =====
            
            // Get products that have inventory without batch_id
            const productsWithoutBatch = db.prepare(`
                SELECT DISTINCT i.product_id 
                FROM inventory i
                WHERE i.batch_id IS NULL
            `).all();
            
            console.log(`Products needing batches: ${productsWithoutBatch.length}`);
            
            // For each product, check if a batch already exists
            let batchesCreated = 0;
            let batchesSkipped = 0;
            
            for (const product of productsWithoutBatch) {
                // Check if this product already has a batch
                const existingBatch = db.prepare(`
                    SELECT id FROM batches WHERE product_id = ? LIMIT 1
                `).get(product.product_id);
                
                if (existingBatch) {
                    // Batch exists, just update inventory
                    console.log(`⏭️ Product ${product.product_id} already has a batch, skipping batch creation...`);
                    batchesSkipped++;
                    
                    // Update inventory with existing batch_id
                    const updateInventory = db.prepare(`
                        UPDATE inventory 
                        SET batch_id = ?
                        WHERE product_id = ? AND batch_id IS NULL
                    `);
                    updateInventory.run(existingBatch.id, product.product_id);
                } else {
                    // Create a new batch for this product
                    try {
                        const productInfo = db.prepare(`
                            SELECT p.purchase_price, p.sale_price, p.name
                            FROM products p
                            WHERE p.id = ?
                        `).get(product.product_id);
                        
                        // Get total quantity from inventory
                        const totalQty = db.prepare(`
                            SELECT SUM(quantity) as total
                            FROM inventory
                            WHERE product_id = ? AND batch_id IS NULL
                        `).get(product.product_id);
                        
                        const batchNumber = `BATCH-${String(product.product_id).padStart(6, '0')}-${Date.now().toString().slice(-6)}`;
                        
                        const insertBatch = db.prepare(`
                            INSERT INTO batches (
                                product_id, 
                                batch_number, 
                                purchase_price, 
                                sale_price, 
                                quantity, 
                                expiry_date, 
                                is_active
                            ) VALUES (?, ?, ?, ?, ?, ?, ?)
                        `);
                        
                        const result = insertBatch.run(
                            product.product_id,
                            batchNumber,
                            productInfo?.purchase_price || 0,
                            productInfo?.sale_price || 0,
                            totalQty?.total || 0,
                            null,
                            1
                        );
                        
                        const batchId = result.lastInsertRowid;
                        batchesCreated++;
                        
                        // Update inventory with the new batch_id
                        const updateInventory = db.prepare(`
                            UPDATE inventory 
                            SET batch_id = ?
                            WHERE product_id = ? AND batch_id IS NULL
                        `);
                        updateInventory.run(batchId, product.product_id);
                        
                        console.log(`✅ Created batch ${batchNumber} for product ${productInfo?.name || product.product_id}`);
                    } catch (err) {
                        console.error(`❌ Error creating batch for product ${product.product_id}:`, err.message);
                    }
                }
            }
            
            console.log(`Migration: Created ${batchesCreated} new batches, skipped ${batchesSkipped} existing batches.`);
            
            // ===== FIX: Ensure no duplicates in inventory =====
            // Check for duplicate inventory records that might cause the unique constraint error
            const duplicates = db.prepare(`
                SELECT product_id, warehouse_id, batch_id, COUNT(*) as count
                FROM inventory
                GROUP BY product_id, warehouse_id, batch_id
                HAVING COUNT(*) > 1
            `).all();
            
            if (duplicates.length > 0) {
                console.log(`⚠️ Found ${duplicates.length} duplicate inventory records. Cleaning up...`);
                
                for (const dup of duplicates) {
                    // Keep the first record, delete the rest
                    const keepOne = db.prepare(`
                        DELETE FROM inventory 
                        WHERE id IN (
                            SELECT id FROM inventory 
                            WHERE product_id = ? AND warehouse_id = ? AND batch_id = ?
                            LIMIT -1 OFFSET 1
                        )
                    `);
                    const deleted = keepOne.run(dup.product_id, dup.warehouse_id, dup.batch_id);
                    console.log(`🗑️ Removed ${deleted.changes} duplicate records for product ${dup.product_id}`);
                }
            }
            
            // Verify the migration
            const verify = db.prepare(`
                SELECT 
                    COUNT(*) as total_inventory,
                    SUM(CASE WHEN batch_id IS NULL THEN 1 ELSE 0 END) as null_batch_count
                FROM inventory
            `).get();
            
            console.log(`Migration Verification: Total inventory: ${verify.total_inventory}, Null batch_id: ${verify.null_batch_count}`);
            
            // Show sample of migrated data
            const sample = db.prepare(`
                SELECT 
                    i.id as inventory_id,
                    i.product_id,
                    p.name as product_name,
                    b.batch_number,
                    i.quantity,
                    i.warehouse_id,
                    w.name as warehouse_name
                FROM inventory i
                LEFT JOIN batches b ON i.batch_id = b.id
                LEFT JOIN products p ON i.product_id = p.id
                LEFT JOIN warehouses w ON i.warehouse_id = w.id
                LIMIT 5
            `).all();
            
            if (sample.length > 0) {
                console.log("Sample of migrated data:");
                console.table(sample);
            }
        } else if (hasBatchId && orphanInventory.count === 0) {
            console.log("✅ All inventory records already have batch_id assigned.");
        } else {
            console.log("Inventory table doesn't have batch_id column or no data to migrate.");
        }
    }

    // ===============================
    // Additional Column Migrations
    // ===============================
    
    // Check products table for missing columns
    const productColumns = db.prepare("PRAGMA table_info(products)").all();
    
    // Add any missing columns to products table
    const productColumnsToAdd = [
        { name: "category_id", type: "INTEGER" },
        { name: "unit_id", type: "INTEGER" }
    ];
    
    for (const col of productColumnsToAdd) {
        if (!productColumns.some(c => c.name === col.name)) {
            console.log(`Migration: Adding products.${col.name}...`);
            try {
                db.exec(`ALTER TABLE products ADD COLUMN ${col.name} ${col.type};`);
            } catch (err) {
                console.log(`⚠️ Could not add ${col.name}: ${err.message}`);
            }
        }
    }

    // ===============================
    // Sync admin password
    // ===============================

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync("password123", salt);

    const updateAdmin = db.prepare(`
        UPDATE users
        SET password_hash = ?
        WHERE username = 'admin'
    `);
    
    const adminResult = updateAdmin.run(hash);
    console.log(`Admin user updated: ${adminResult.changes} rows affected.`);

    console.log("✅ Database initialized successfully.");

} catch (err) {
    console.error("❌ Database initialization failed:", err);
    throw err;
}

module.exports = db;