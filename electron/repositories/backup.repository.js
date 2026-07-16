const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const { generateBackupZipFile, restoreBackup } = require("../utils/backup.utils");

// ✅ FIX: Use userData path for backups
const userDataPath = app.getPath("userData");
const destFolder = path.join(userDataPath, "backups");
const srcPath = path.join(userDataPath, "shop.db");

class backupRepository {
    
    createBackupFolder() {
        if (!fs.existsSync(destFolder)) {
            fs.mkdirSync(destFolder, { recursive: true });
            console.log('✅ Backups folder created at:', destFolder);
        }
        return destFolder;
    }

    copyDatabase() {
        const backupFileName = `shop_backup_${Date.now()}.db`;
        const destPath = path.join(destFolder, backupFileName);

        // Verify source exists
        if (!fs.existsSync(srcPath)) {
            console.error('❌ Database not found at:', srcPath);
            throw new Error(`Database file not found at: ${srcPath}`);
        }

        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Database copied successfully to: ${destPath}`);
        return destPath; 
    }

    saveZip() {
        return generateBackupZipFile(); 
    }

    getDatabasePath() {
        return srcPath;
    }

    getBackupFolderPath() {
        this.createBackupFolder(); // Ensure folder exists
        return destFolder;
    }
}

module.exports = new backupRepository();