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
            
            // ✅ FIXED: Get product prices from products table, not inventory
            const createBatches = db.prepare(`
                INSERT INTO batches (product_id, batch_number, purchase_price, sale_price, quantity, expiry_date, is_active)
                SELECT 
                    i.product_id,
                    'BATCH-' || printf('%06d', COALESCE(
                        (SELECT MAX(id) FROM batches WHERE product_id = i.product_id) + 1,
                        1
                    )) || '-' || strftime('%Y%m%d', 'now'),
                    COALESCE(p.purchase_price, 0),
                    COALESCE(p.sale_price, 0),
                    SUM(i.quantity),
                    NULL,
                    1
                FROM inventory i
                LEFT JOIN products p ON i.product_id = p.id
                WHERE i.batch_id IS NULL
                GROUP BY i.product_id
            `);
            
            const result = createBatches.run();
            console.log(`Migration: Created ${result.changes} new batches.`);
            
            // Update inventory with batch_id
            const updateInventory = db.prepare(`
                UPDATE inventory 
                SET batch_id = (
                    SELECT id FROM batches 
                    WHERE batches.product_id = inventory.product_id 
                    LIMIT 1
                )
                WHERE batch_id IS NULL
            `);
            
            const updateResult = updateInventory.run();
            console.log(`Migration: Updated ${updateResult.changes} inventory records with batch_id.`);
            
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
                    i.quantity
                FROM inventory i
                LEFT JOIN batches b ON i.batch_id = b.id
                LEFT JOIN products p ON i.product_id = p.id
                LIMIT 5
            `).all();
            
            console.log("Sample of migrated data:");
            console.table(sample);
        } else if (hasBatchId && orphanInventory.count === 0) {
            console.log("All inventory records already have batch_id assigned.");
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
            db.exec(`ALTER TABLE products ADD COLUMN ${col.name} ${col.type};`);
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