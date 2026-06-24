const { ipcMain } = require("electron");
const backupService = require("../services/backup.service"); // Add this import

function getBackUpIpc() {
    ipcMain.handle("backup:create", async () => {
        return backupService.createBackup();
    });
    
    ipcMain.handle("backup:restore", async (event, zipFilePath) => {
        return backupService.restoreBackup(zipFilePath);
    });
}

module.exports = { getBackUpIpc };