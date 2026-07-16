const { ipcMain, dialog, BrowserWindow, shell } = require("electron");
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
    
    // Open file picker dialog for selecting backup file
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
    
    // List all backups
    ipcMain.handle("backup:list", async () => {
        return backupService.listBackups();
    });
    
    // Delete a backup
    ipcMain.handle("backup:delete", async (event, filename) => {
        return backupService.deleteBackup(filename);
    });

    // NEW: Open backup folder in file explorer
    ipcMain.handle("backup:openFolder", async () => {
        try {
            const folderPath = backupService.getBackupFolderPath();
            await shell.openPath(folderPath);
            return { success: true, path: folderPath };
        } catch (error) {
            console.error("❌ Error opening backup folder:", error);
            return { success: false, error: error.message };
        }
    });

    // NEW: Get backup folder path
    ipcMain.handle("backup:getFolderPath", async () => {
        try {
            const folderPath = backupService.getBackupFolderPath();
            return { success: true, path: folderPath };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
}

module.exports = { getBackUpIpc };