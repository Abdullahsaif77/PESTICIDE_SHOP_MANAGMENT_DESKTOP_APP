const backupRepository = require("../repositories/backup.repository");
const { generateBackupZipFile, restoreBackup } = require("../utils/backup.utils");
const fs = require("fs");
const path = require("path");
const { dialog, BrowserWindow, app } = require("electron");

class BackupService {
    
    async createBackup() {
        try {
            // Ensure backup folder exists
            const backupFolder = backupRepository.getBackupFolderPath();
            
            // Get DB path
            const dbPath = backupRepository.getDatabasePath();
            
            // Verify database exists
            if (!fs.existsSync(dbPath)) {
                throw new Error(`Database file not found at: ${dbPath}`);
            }
            
            // Create ZIP backup
            const zipResult = generateBackupZipFile();
            
            if (!zipResult.success) {
                throw new Error(zipResult.error);
            }

            // Show Save As dialog
            const win = BrowserWindow.getFocusedWindow();
            const saveResult = await dialog.showSaveDialog(win, {
                title: 'Save Backup',
                defaultPath: path.join(
                    app.getPath('documents'),
                    zipResult.filename
                ),
                filters: [
                    { name: 'ZIP Files', extensions: ['zip'] }
                ]
            });

            if (saveResult.canceled) {
                return {
                    success: false,
                    canceled: true,
                    message: "Save cancelled"
                };
            }

            // Copy ZIP to selected location
            fs.copyFileSync(zipResult.outputPath, saveResult.filePath);
            
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
            console.error("❌ Error creating backup:", error.message);
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
            
            // Get the database path (where to restore to)
            const targetPath = backupRepository.getDatabasePath();
            const targetFolder = path.dirname(targetPath);
            
            // Perform restoration
            const restoreResult = restoreBackup(zipFilePath, targetFolder);
            
            if (!restoreResult.success) {
                throw new Error(restoreResult.error);
            }
            
            return {
                success: true,
                message: "Backup restored successfully. Please restart the application.",
                restored: {
                    from: restoreResult.restoredFrom,
                    to: restoreResult.extractedTo,
                    restoredAt: restoreResult.restoredAt
                }
            };
            
        } catch (error) {
            console.error("❌ Error restoring backup:", error.message);
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
                backups: files,
                folderPath: backupFolder
            };
            
        } catch (error) {
            console.error("❌ Error listing backups:", error.message);
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
            console.error("❌ Error deleting backup:", error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // NEW: Get backup folder path (for opening in explorer)
    getBackupFolderPath() {
        return backupRepository.getBackupFolderPath();
    }
}

module.exports = new BackupService();