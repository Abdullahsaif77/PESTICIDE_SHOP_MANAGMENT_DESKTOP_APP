// repositories/userRepository.js
const db = require("../database/database")

class UserRepository {
  findByUsername(username) {
    const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
    return stmt.get(username);
  }

  findById(id) {
    const stmt = db.prepare("SELECT id, username, full_name, created_at FROM users WHERE id = ?");
    return stmt.get(id);
  }

  updateProfile(id, fullName, username) {
    const stmt = db.prepare(`
      UPDATE users 
      SET full_name = ?, username = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    return stmt.run(fullName, username , id);
  }

  updatePassword(id, passwordHash) {
    const stmt = db.prepare(`
      UPDATE users 
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    return stmt.run(passwordHash, id);
  }
}

module.exports = new UserRepository();