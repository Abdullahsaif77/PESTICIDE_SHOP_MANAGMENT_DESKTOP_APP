// electron/services/backupService.js

const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");
const { app } = require("electron");

// ============================================
// SMART BACKUP PATH - App Directory
// ============================================

let backupFolderPath;

if (app.isPackaged) {
    // ============================================
    // PRODUCTION: Store in App Installation Directory
    // ============================================
    
    // Get the directory where the app executable is located
    const appExePath = app.getPath("exe");
    const appDirectory = path.dirname(appExePath);
    
    // Create backup folder inside app directory
    backupFolderPath = path.join(appDirectory, "backups");
    
    console.log(`📦 Production Mode - App Directory: ${appDirectory}`);
    console.log(`📁 Backups will be saved to: ${backupFolderPath}`);
    
    // ⚠️ IMPORTANT: In production, the app directory might not be writable!
    // Windows: Program Files is usually read-only
    // macOS: /Applications is usually read-only
    // Linux: /opt is usually read-only
    
    // If app directory is not writable, fallback to userData
    if (!isDirectoryWritable(appDirectory)) {
        console.warn(`⚠️ App directory is not writable. Falling back to userData...`);
        const userDataPath = app.getPath("userData");
        backupFolderPath = path.join(userDataPath, "backups");
        console.log(`📁 Fallback backups path: ${backupFolderPath}`);
    }
    
} else {
    // ============================================
    // DEVELOPMENT: Store in Project Folder
    // ============================================
    
    // Store backups in project-root/backups/
    backupFolderPath = path.join(__dirname, "../../backups");
    
    console.log(`🔧 Development Mode - Project Directory`);
    console.log(`📁 Backups will be saved to: ${backupFolderPath}`);
}

// Helper function to check if directory is writable
function isDirectoryWritable(dirPath) {
    try {
        const testFile = path.join(dirPath, '.write-test');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        return true;
    } catch (error) {
        return false;
    }
}

// Ensure backup folder exists
if (!fs.existsSync(backupFolderPath)) {
    try {
        fs.mkdirSync(backupFolderPath, { recursive: true });
        console.log(`✅ Created backup folder: ${backupFolderPath}`);
    } catch (error) {
        console.error(`❌ Failed to create backup folder: ${error.message}`);
        // Fallback to userData if creation fails
        const userDataPath = app.getPath("userData");
        backupFolderPath = path.join(userDataPath, "backups");
        if (!fs.existsSync(backupFolderPath)) {
            fs.mkdirSync(backupFolderPath, { recursive: true });
        }
        console.log(`📁 Using fallback backup path: ${backupFolderPath}`);
    }
}

// Database path (same as your database)
const userDataPath = app.getPath("userData");
const dbPath = path.join(userDataPath, "shop.db");

console.log(`📁 Database path: ${dbPath}`);
console.log(`📁 Backup folder path: ${backupFolderPath}`);

// ============================================
// BACKUP FUNCTIONS
// ============================================

function generateBackupZipFile() {
    try {
        // Ensure backup folder exists
        if (!fs.existsSync(backupFolderPath)) {
            fs.mkdirSync(backupFolderPath, { recursive: true });
        }

        // Check if database exists
        if (!fs.existsSync(dbPath)) {
            throw new Error(`Database file not found at: ${dbPath}`);
        }

        const zipName = `shop_backup_${Date.now()}.zip`;
        const outputPath = path.join(backupFolderPath, zipName);

        const zip = new AdmZip();
        zip.addLocalFile(dbPath, "");
        zip.writeZip(outputPath);

        console.log(`✅ Successfully created backup zip at: ${outputPath}`);

        return {
            success: true,
            filename: zipName,
            outputPath: outputPath,
            createdAt: new Date(),
            backupFolder: backupFolderPath
        };

    } catch (error) {
        console.error("❌ Backup creation failed:", error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

function restoreBackup(zipFilePath, targetExtractPath) {
    try {
        // If no target path provided, use the backup folder
        const extractPath = targetExtractPath || backupFolderPath;
        
        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(extractPath, true);

        console.log("✅ Backup restored successfully!");
        console.log("📁 Extracted to:", extractPath);

        return {
            success: true,
            restoredFrom: zipFilePath,
            extractedTo: extractPath,
            restoredAt: new Date()
        };

    } catch (error) {
        console.error("❌ Failed to restore backup:", error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

function listBackups() {
    try {
        if (!fs.existsSync(backupFolderPath)) {
            return { success: true, backups: [] };
        }

        const files = fs.readdirSync(backupFolderPath)
            .filter(file => file.startsWith('shop_backup_') && file.endsWith('.zip'))
            .map(file => {
                const filePath = path.join(backupFolderPath, file);
                const stats = fs.statSync(filePath);
                return {
                    filename: file,
                    path: filePath,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                };
            })
            .sort((a, b) => b.created - a.created); // Newest first

        return {
            success: true,
            backups: files,
            count: files.length,
            totalSize: files.reduce((sum, f) => sum + f.size, 0)
        };

    } catch (error) {
        console.error("❌ Failed to list backups:", error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

function deleteBackup(filename) {
    try {
        const filePath = path.join(backupFolderPath, filename);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Backup file not found: ${filename}`);
        }
        fs.unlinkSync(filePath);
        console.log(`✅ Deleted backup: ${filename}`);
        return { success: true, deleted: filename };
    } catch (error) {
        console.error("❌ Failed to delete backup:", error.message);
        return { success: false, error: error.message };
    }
}

module.exports = {
    generateBackupZipFile,
    restoreBackup,
    listBackups,
    deleteBackup,
    backupFolderPath
};