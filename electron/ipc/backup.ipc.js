const { ipcMain, dialog, BrowserWindow } = require("electron");
const backupService = require("../services/backup.service");

function getBackUpIpc() {
    // Create backup with save dialog
    ipcMain.handle("backup:create", async () => {
        return backupService.createBackup();
    });
    
    // Restore backup from file path
    ipcMain.handle("backup:restore", async (event, zipFilePath) => {
        return backupService.restoreBackup(zipFilePath);
    });
    
    // NEW: Open file picker dialog for selecting backup file
    ipcMain.handle("dialog:selectBackupFile", async (event) => {
        const win = BrowserWindow.getFocusedWindow();
        const result = await dialog.showOpenDialog(win, {
            title: 'Select Backup File to Restore',
            filters: [
                { name: 'ZIP Files', extensions: ['zip'] },
                { name: 'All Files', extensions: ['*'] }
            ],
            properties: ['openFile']
        });
        
        return {
            canceled: result.canceled,
            filePath: result.filePaths.length > 0 ? result.filePaths[0] : null
        };
    });
    
    // NEW: List all backups
    ipcMain.handle("backup:list", async () => {
        return backupService.listBackups();
    });
    
    // NEW: Delete a backup
    ipcMain.handle("backup:delete", async (event, filename) => {
        return backupService.deleteBackup(filename);
    });
}

module.exports = { getBackUpIpc };