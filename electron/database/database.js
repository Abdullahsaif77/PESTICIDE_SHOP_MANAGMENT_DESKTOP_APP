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

    console.log("Schema loaded.");

    // ===============================
    // DATABASE MIGRATIONS
    // ===============================

    // ---- Products: Add code column ----
    const productColumns = db.prepare("PRAGMA table_info(products)").all();

    if (!productColumns.some(col => col.name === "code")) {
        console.log("Migration: Adding products.code...");

        db.exec(`
            ALTER TABLE products
            ADD COLUMN code TEXT;
        `);

        db.exec(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_products_code
            ON products(code);
        `);
    }

    // ---- Products: Add brand column ----
    if (!productColumns.some(col => col.name === "brand")) {
        console.log("Migration: Adding products.brand...");

        db.exec(`
            ALTER TABLE products
            ADD COLUMN brand TEXT;
        `);
    }

    // ---- Products: Add barcode column ----
    if (!productColumns.some(col => col.name === "barcode")) {
        console.log("Migration: Adding products.barcode...");

        db.exec(`
            ALTER TABLE products
            ADD COLUMN barcode TEXT;
        `);

        db.exec(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode
            ON products(barcode);
        `);
    }

    // ---- Products: Add description column ----
    if (!productColumns.some(col => col.name === "description")) {
        console.log("Migration: Adding products.description...");

        db.exec(`
            ALTER TABLE products
            ADD COLUMN description TEXT;
        `);
    }

    // ---- Products: Add stock_quantity column ----
    if (!productColumns.some(col => col.name === "stock_quantity")) {
        console.log("Migration: Adding products.stock_quantity...");

        db.exec(`
            ALTER TABLE products
            ADD COLUMN stock_quantity REAL NOT NULL DEFAULT 0;
        `);
    }

    // ---- Products: Add reorder_level column ----
    if (!productColumns.some(col => col.name === "reorder_level")) {
        console.log("Migration: Adding products.reorder_level...");

        db.exec(`
            ALTER TABLE products
            ADD COLUMN reorder_level REAL DEFAULT 0;
        `);
    }

    // ---- Products: Add is_active column ----
    if (!productColumns.some(col => col.name === "is_active")) {
        console.log("Migration: Adding products.is_active...");

        db.exec(`
            ALTER TABLE products
            ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;
        `);
    }

    // ===============================
    // Sync admin password
    // ===============================

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync("password123", salt);

    db.prepare(`
        UPDATE users
        SET password_hash = ?
        WHERE username = 'admin'
    `).run(hash);

    console.log("Database initialized successfully.");

} catch (err) {
    console.error("Database initialization failed:", err);
}

module.exports = db;