const backupRepository = require("../repositories/backup.repository");
const { generateBackupZipFile, restoreBackup } = require("../utils/backup.utils");
const fs = require("fs");
const path = require("path");
const { dialog, BrowserWindow } = require("electron");

class BackupService {
    
    async createBackup() {
        try {
            // Step 1: Get DB path
            const dbPath = backupRepository.getDatabasePath();
            
            // Verify database exists
            if (!fs.existsSync(dbPath)) {
                throw new Error(`Database file not found at: ${dbPath}`);
            }
            
            // Step 2: Create backup folder if it doesn't exist
            backupRepository.createBackupFolder();
            
            // Step 3: Create ZIP backup
            const zipResult = generateBackupZipFile();
            
            if (!zipResult.success) {
                throw new Error(zipResult.error);
            }

            // Step 4: Show Save As dialog
            const win = BrowserWindow.getFocusedWindow();
            const saveResult = await dialog.showSaveDialog(win, {
                title: 'Save Backup',
                defaultPath: path.join(
                    require('electron').app.getPath('documents'),
                    zipResult.filename
                ),
                filters: [
                    { name: 'ZIP Files', extensions: ['zip'] }
                ]
            });

            // Step 5: Handle cancellation
            if (saveResult.canceled) {
                return {
                    success: false,
                    canceled: true,
                    message: "Save cancelled"
                };
            }

            // Step 6: Copy ZIP to selected location
            fs.copyFileSync(zipResult.outputPath, saveResult.filePath);
            
            // Step 7: Return file information
            return {
                success: true,
                message: "Backup created successfully",
                backup: {
                    filename: path.basename(saveResult.filePath),
                    path: saveResult.filePath,
                    size: fs.statSync(saveResult.filePath).size,
                    createdAt: zipResult.createdAt
                }
            };
            
        } catch (error) {
            console.error("Error creating backup:", error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    restoreBackup(zipFilePath) {
        try {
            // Verify zip file exists
            if (!fs.existsSync(zipFilePath)) {
                throw new Error(`Backup file not found at: ${zipFilePath}`);
            }
            
            // Get the target restore path (database folder)
            const targetPath = backupRepository.getDatabasePath();
            const targetFolder = path.dirname(targetPath);
            
            // Perform restoration
            const restoreResult = restoreBackup(zipFilePath, targetFolder);
            
            if (!restoreResult.success) {
                throw new Error(restoreResult.error);
            }
            
            return {
                success: true,
                message: "Backup restored successfully",
                restored: {
                    from: restoreResult.restoredFrom,
                    to: restoreResult.extractedTo,
                    restoredAt: restoreResult.restoredAt
                }
            };
            
        } catch (error) {
            console.error("Error restoring backup:", error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    listBackups() {
        try {
            const backupFolder = backupRepository.getBackupFolderPath();
            
            if (!fs.existsSync(backupFolder)) {
                return {
                    success: true,
                    backups: [],
                    message: "No backups folder found"
                };
            }
            
            const files = fs.readdirSync(backupFolder)
                .filter(file => file.endsWith('.zip'))
                .map(file => {
                    const filePath = path.join(backupFolder, file);
                    const stats = fs.statSync(filePath);
                    return {
                        filename: file,
                        path: filePath,
                        size: stats.size,
                        created: stats.birthtime,
                        modified: stats.mtime
                    };
                })
                .sort((a, b) => b.modified - a.modified);
            
            return {
                success: true,
                count: files.length,
                backups: files
            };
            
        } catch (error) {
            console.error("Error listing backups:", error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    deleteBackup(filename) {
        try {
            const backupFolder = backupRepository.getBackupFolderPath();
            const filePath = path.join(backupFolder, filename);
            
            if (!fs.existsSync(filePath)) {
                throw new Error(`Backup file not found: ${filename}`);
            }
            
            fs.unlinkSync(filePath);
            
            return {
                success: true,
                message: `Backup ${filename} deleted successfully`
            };
            
        } catch (error) {
            console.error("Error deleting backup:", error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new BackupService();