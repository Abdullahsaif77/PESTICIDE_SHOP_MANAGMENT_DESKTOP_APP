const userRepository = require("../repositories/user.repository");
const bcrypt = require("bcryptjs");

class AuthService {
  async login(username, password) {
    const user = userRepository.findByUsername(username);
    if (!user) {
      throw new Error("Invalid username or password.");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error("Invalid username or password.");
    }

    return {
      id: user.id,
      username: user.username,
      fullName: user.full_name
    };
  }

  async updateProfile(id, fullName, username) {
    const existingUser = userRepository.findByUsername(username);
    if (existingUser && existingUser.id !== id) {
      throw new Error("Username is already taken.");
    }

    userRepository.updateProfile(id, fullName, username);
    return userRepository.findById(id);
  }

  async changePassword(id, currentPassword, newPassword) {
    // Find the raw user details to get the current hash
    const stmt = require("../db").prepare("SELECT password_hash FROM users WHERE id = ?");
    const user = stmt.get(id);

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new Error("Current password is incorrect.");
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    userRepository.updatePassword(id, newHash);
    return { success: true };
  }
}

module.exports = new AuthService();