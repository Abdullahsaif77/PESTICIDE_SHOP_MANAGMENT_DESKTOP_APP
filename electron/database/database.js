const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const { app } = require("electron");
const bcrypt = require("bcryptjs");
const schema = require("./schema");

// Get the user data directory (writable location)
const userDataPath = app.getPath("userData");
const dbPath = path.join(userDataPath, "shop.db");

// Ensure the directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

console.log(`📁 Database path: ${dbPath}`);

// Check if database exists
const dbExists = fs.existsSync(dbPath);
const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

try {
    if (!dbExists) {
        // Fresh database - execute full schema
        console.log("🆕 Creating new database with full schema...");
        db.exec(schema);
        console.log("✅ Schema loaded successfully.");
    } else {
        // Existing database - run migrations
        console.log("📝 Existing database found. Running migrations...");

        // ===============================
        // Check and fix units table
        // ===============================
        const unitsColumns = db.prepare("PRAGMA table_info(units)").all();
        const hasAbbreviation = unitsColumns.some(col => col.name === "abbreviation");
        
        if (!hasAbbreviation) {
            console.log("📝 Adding missing 'abbreviation' column to units table...");
            db.exec(`ALTER TABLE units ADD COLUMN abbreviation TEXT;`);
            console.log("✅ 'abbreviation' column added.");
        }

        // ===============================
        // Check and fix products table
        // ===============================
        const productColumns = db.prepare("PRAGMA table_info(products)").all();
        const columnNames = productColumns.map(c => c.name);
        
        // Add missing columns to products table
        const productColumnsToAdd = [
            { name: "code", type: "TEXT" },
            { name: "brand", type: "TEXT" },
            { name: "barcode", type: "TEXT" },
            { name: "category_id", type: "INTEGER" },
            { name: "unit_id", type: "INTEGER" }
        ];
        
        for (const col of productColumnsToAdd) {
            if (!columnNames.includes(col.name)) {
                console.log(`📝 Adding missing '${col.name}' column to products table...`);
                try {
                    db.exec(`ALTER TABLE products ADD COLUMN ${col.name} ${col.type};`);
                    console.log(`✅ '${col.name}' column added.`);
                } catch (err) {
                    console.log(`⚠️ Could not add ${col.name}: ${err.message}`);
                }
            }
        }

        // ===============================
        // Check and fix other tables
        // ===============================
        
        // Check if expense_categories table exists
        const expenseTableCheck = db.prepare(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='expense_categories'
        `).get();
        
        if (!expenseTableCheck) {
            console.log("📝 Creating expense_categories table...");
            db.exec(`
                CREATE TABLE IF NOT EXISTS expense_categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    description TEXT,
                    is_active INTEGER NOT NULL DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log("✅ expense_categories table created.");
        }
        
        // Check if product_returns table exists
        const returnsTableCheck = db.prepare(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='product_returns'
        `).get();
        
        if (!returnsTableCheck) {
            console.log("📝 Creating product_returns table...");
            db.exec(`
                CREATE TABLE IF NOT EXISTS product_returns (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    return_number TEXT NOT NULL UNIQUE,
                    sale_id INTEGER,
                    customer_id INTEGER NOT NULL,
                    return_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    total_return_amount REAL NOT NULL DEFAULT 0,
                    refund_method TEXT DEFAULT 'cash',
                    refund_status TEXT DEFAULT 'pending',
                    reason TEXT,
                    notes TEXT,
                    created_by INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS product_return_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    return_id INTEGER NOT NULL,
                    product_id INTEGER NOT NULL,
                    batch_id INTEGER,
                    quantity REAL NOT NULL,
                    unit_price REAL NOT NULL DEFAULT 0,
                    total_price REAL NOT NULL DEFAULT 0,
                    reason TEXT,
                    condition TEXT DEFAULT 'good',
                    restocked BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log("✅ product_returns tables created.");
        }

        // ===============================
        // DATABASE MIGRATIONS (Existing data)
        // ===============================

        const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='inventory'").get();
        
        if (tableInfo) {
            // Check if inventory has batch_id column
            const inventoryColumns = db.prepare("PRAGMA table_info(inventory)").all();
            const hasBatchId = inventoryColumns.some(col => col.name === "batch_id");
            
            // Check if there are inventory records without batch_id
            const orphanInventory = db.prepare("SELECT COUNT(*) as count FROM inventory WHERE batch_id IS NULL").get();
            
            if (hasBatchId && orphanInventory.count > 0) {
                console.log(`Migration: Found ${orphanInventory.count} inventory records without batch_id. Creating batches...`);
                
                // Get products that have inventory without batch_id
                const productsWithoutBatch = db.prepare(`
                    SELECT DISTINCT i.product_id 
                    FROM inventory i
                    WHERE i.batch_id IS NULL
                `).all();
                
                console.log(`Products needing batches: ${productsWithoutBatch.length}`);
                
                let batchesCreated = 0;
                let batchesSkipped = 0;
                let errors = 0;
                
                // ✅ Use a transaction for the entire migration
                const migrateTransaction = db.transaction(() => {
                    for (const product of productsWithoutBatch) {
                        try {
                            // Get inventory records without batch_id for this product
                            const inventoryRecords = db.prepare(`
                                SELECT id, warehouse_id, quantity 
                                FROM inventory 
                                WHERE product_id = ? AND batch_id IS NULL
                            `).all(product.product_id);
                            
                            if (inventoryRecords.length === 0) continue;
                            
                            // Check if this product already has a batch
                            const existingBatch = db.prepare(`
                                SELECT id FROM batches WHERE product_id = ? LIMIT 1
                            `).get(product.product_id);
                            
                            let batchId;
                            
                            if (existingBatch) {
                                console.log(`⏭️ Product ${product.product_id} already has a batch, using existing...`);
                                batchId = existingBatch.id;
                                batchesSkipped++;
                            } else {
                                // Create a new batch for this product
                                const productInfo = db.prepare(`
                                    SELECT p.purchase_price, p.sale_price, p.name
                                    FROM products p
                                    WHERE p.id = ?
                                `).get(product.product_id);
                                
                                // Calculate total quantity from all inventory records without batch
                                const totalQty = inventoryRecords.reduce((sum, rec) => sum + rec.quantity, 0);
                                
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
                                    totalQty || 0,
                                    null,
                                    1
                                );
                                
                                batchId = result.lastInsertRowid;
                                batchesCreated++;
                                console.log(`✅ Created batch ${batchNumber} for product ${productInfo?.name || product.product_id}`);
                            }
                            
                            // ✅ UPDATE each inventory record with the batch_id
                            for (const record of inventoryRecords) {
                                try {
                                    // Check if an inventory record already exists with this combination
                                    const existing = db.prepare(`
                                        SELECT id, quantity FROM inventory 
                                        WHERE product_id = ? AND warehouse_id = ? AND batch_id = ?
                                    `).get(product.product_id, record.warehouse_id, batchId);
                                    
                                    if (existing) {
                                        // ✅ MERGE: Add quantities to existing record
                                        console.log(`  🔄 Merging inventory ${record.id} (${record.quantity}) into existing record ${existing.id} (${existing.quantity})`);
                                        const updateExisting = db.prepare(`
                                            UPDATE inventory 
                                            SET quantity = quantity + ?,
                                                updated_at = CURRENT_TIMESTAMP
                                            WHERE id = ?
                                        `);
                                        updateExisting.run(record.quantity, existing.id);
                                        
                                        // Delete the duplicate record
                                        db.prepare(`DELETE FROM inventory WHERE id = ?`).run(record.id);
                                    } else {
                                        // ✅ Just update the batch_id
                                        const updateInventory = db.prepare(`
                                            UPDATE inventory 
                                            SET batch_id = ?,
                                                updated_at = CURRENT_TIMESTAMP
                                            WHERE id = ?
                                        `);
                                        updateInventory.run(batchId, record.id);
                                    }
                                } catch (recordErr) {
                                    console.error(`  ❌ Error updating inventory ${record.id}:`, recordErr.message);
                                    errors++;
                                }
                            }
                            
                        } catch (productErr) {
                            console.error(`❌ Error processing product ${product.product_id}:`, productErr.message);
                            errors++;
                        }
                    }
                });
                
                // Execute the migration transaction
                try {
                    migrateTransaction();
                } catch (txErr) {
                    console.error('❌ Migration transaction failed:', txErr.message);
                    errors++;
                }
                
                console.log(`Migration Summary: Created ${batchesCreated} new batches, skipped ${batchesSkipped} existing batches. Errors: ${errors}`);
                
                // ✅ Verify the migration
                const verify = db.prepare(`
                    SELECT 
                        COUNT(*) as total_inventory,
                        SUM(CASE WHEN batch_id IS NULL THEN 1 ELSE 0 END) as null_batch_count
                    FROM inventory
                `).get();
                
                console.log(`Migration Verification: Total inventory: ${verify.total_inventory}, Null batch_id: ${verify.null_batch_count}`);
                
                // ✅ Check for duplicate inventory records
                const dupCheck = db.prepare(`
                    SELECT product_id, warehouse_id, batch_id, COUNT(*) as count
                    FROM inventory
                    GROUP BY product_id, warehouse_id, batch_id
                    HAVING COUNT(*) > 1
                `).all();
                
                if (dupCheck.length > 0) {
                    console.log(`⚠️ Warning: Found ${dupCheck.length} duplicate inventory records that need manual cleanup.`);
                    for (const dup of dupCheck) {
                        console.log(`  - Product ${dup.product_id}, Warehouse ${dup.warehouse_id}, Batch ${dup.batch_id}: ${dup.count} duplicates`);
                    }
                } else {
                    console.log('✅ No duplicate inventory records found.');
                }
                
            } else if (hasBatchId && orphanInventory.count === 0) {
                console.log("✅ All inventory records already have batch_id assigned.");
            } else {
                console.log("Inventory table doesn't have batch_id column or no data to migrate.");
            }
        }

        console.log("✅ Database migrations completed successfully.");
    }

    // ===============================
    // Sync admin password
    // ===============================

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync("password123", salt);

    // Check if admin user exists
    const adminCheck = db.prepare("SELECT id FROM users WHERE username = 'admin'").get();
    
    if (!adminCheck) {
        console.log("📝 Creating default admin user...");
        const insertAdmin = db.prepare(`
            INSERT INTO users (username, password_hash, full_name, role, is_active)
            VALUES (?, ?, ?, ?, ?)
        `);
        insertAdmin.run("admin", hash, "Administrator", "admin", 1);
        console.log("✅ Admin user created.");
    } else {
        // Update existing admin password
        const updateAdmin = db.prepare(`
            UPDATE users
            SET password_hash = ?
            WHERE username = 'admin'
        `);
        const adminResult = updateAdmin.run(hash);
        console.log(`Admin user updated: ${adminResult.changes} rows affected.`);
    }

    console.log("✅ Database initialized successfully.");

} catch (err) {
    console.error("❌ Database initialization failed:", err);
    throw err;
}

module.exports = db;