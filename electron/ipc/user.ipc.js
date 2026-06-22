const { ipcMain } = require("electron");
const authService = require("../services/user.service")

function setupAuthIpc() {
  ipcMain.handle("auth:login", async (event, { username, password }) => {
    try {
      return { success: true, user: await authService.login(username, password) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("auth:update-profile", async (event, { id, fullName, username }) => {
    try {
      return { success: true, user: await authService.updateProfile(id, fullName, username) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("auth:change-password", async (event, { id, currentPassword, newPassword }) => {
    try {
      return await authService.changePassword(id, currentPassword, newPassword);
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

module.exports = { setupAuthIpc };