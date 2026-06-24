const fs = require("fs");
const path = require("path");
const { generateBackupZipFile, restoreBackup } = require("../utils/backup.utils");

const destFolder = path.join(__dirname, "..", "backups");
const srcPath = path.join(__dirname, "..", "database", "shop.db");

class backupRepository {
    
    createBackupFolder() {
        if (!fs.existsSync(destFolder)) {
            fs.mkdirSync(destFolder, { recursive: true });
        }
    }

    copyDatabase() {
        const backupFileName = `shop_backup_${Date.now()}.db`;
        const destPath = path.join(destFolder, backupFileName);

        fs.copyFileSync(srcPath, destPath);
        console.log(`Database copied successfully to: ${destPath}`);
        return destPath; 
    }

    saveZip() {
        
        return generateBackupZipFile(); 
    }

    getDatabasePath() {
        return srcPath;
    }

    getBackupFolderPath() {
        return destFolder;
    }
}

module.exports = new backupRepository();