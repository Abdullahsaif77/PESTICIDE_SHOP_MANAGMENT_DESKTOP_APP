const Database = require("better-sqlite3");
const path = require("path");
const bcrypt = require("bcryptjs"); // 1. Import bcrypt
const schema = require("./schema");

const dbPath = path.join(__dirname, "shop.db");
const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

try {
  // Execute base schema setup
  db.exec(schema);
  
  // 2. Explicitly force-update the admin password on startup to guarantee it matches
  const salt = bcrypt.genSaltSync(10);
  const correctHash = bcrypt.hashSync("password123", salt);
  
  const updateStmt = db.prepare(`
    UPDATE users 
    SET password_hash = ? 
    WHERE username = 'admin'
  `);
  
  updateStmt.run(correctHash);
  console.log("Database initialized: Admin password hash synced successfully.");
  
} catch (err) {
  console.error("Database initialization failed:", err);
}

module.exports = db;