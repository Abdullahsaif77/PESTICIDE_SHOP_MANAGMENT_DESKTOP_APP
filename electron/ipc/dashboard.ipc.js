// electron/ipc/dashboard.ipc.js
const { ipcMain } = require('electron');
const dashboardService = require('../services/dashboard.service');

function registerDashboardHandlers() {
  ipcMain.handle('dashboard:getData', (event, startDate, endDate) => {
    try {
      // Default dates: Current Month (if not provided)
      const now = new Date();
      const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const defaultEnd = now.toISOString().split('T')[0];

      return dashboardService.getDashboardData(
        startDate || defaultStart,
        endDate || defaultEnd
      );
    } catch (error) {
      console.error('Error in dashboard:getData:', error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = { registerDashboardHandlers };