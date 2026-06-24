const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");

function generateBackupZipFile() {
  try {
    const dbPath = path.join(__dirname, "..", "database", "shop.db");
    const backupFolderPath = path.join(__dirname, "..", "backups");

    const zipName = `shop_backup_${Date.now()}.zip`;
    const outputPath = path.join(backupFolderPath, zipName);

    // Fixed: changed backupFolder to backupFolderPath
    if (!fs.existsSync(backupFolderPath)) {
      fs.mkdirSync(backupFolderPath, { recursive: true });
    }

    const zip = new AdmZip();
    zip.addLocalFile(dbPath, "");
    zip.writeZip(outputPath);

    console.log(`Successfully created backup zip at: ${outputPath}`);

    // Return the created file's details
    return {
      success: true,
      filename: zipName,
      outputPath: outputPath,
      createdAt: new Date()
    };

  } catch (error) {
    console.error("Message", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function restoreBackup(zipFilePath, targetExtractPath) {
  try {
    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(targetExtractPath, true);

    console.log("Backup restored successfully!");

    // Return restoration summary details
    return {
      success: true,
      restoredFrom: zipFilePath,
      extractedTo: targetExtractPath,
      restoredAt: new Date()
    };

  } catch (error) {
    console.error("Failed to restore backup:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  generateBackupZipFile,
  restoreBackup
};