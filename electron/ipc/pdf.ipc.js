// electron/ipc/pdf.ipc.js
const { ipcMain } = require('electron');
const pdfGenerator = require('../utils/pdfGenerator');

function registerPDFIPC() {
    ipcMain.handle('pdf:generateInvoice', async (event, saleData, items) => {
        try {
            const result = await pdfGenerator.generateAndSave(saleData, items);
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
}

module.exports = { registerPDFIPC };