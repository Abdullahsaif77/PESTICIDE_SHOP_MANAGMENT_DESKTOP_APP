const WareHouseService = require("../services/warehouse.service")
const { ipcMain } = require("electron")

function SetWareHouseIPC() {
    console.log("Setting up warehouse IPC handlers...") // Add debug log
    
    ipcMain.handle("warehouse:create", async (event, data) => {
        try {
            return await WareHouseService.createWarehouse(data)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("warehouse:getById", async (event, id) => {
        try {
            return await WareHouseService.getWarehouseById(id)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("warehouse:update", async (event, id, data) => {
        try {
            return await WareHouseService.updateWarehouse(id, data)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle("warehouse:delete", async (event, id) => {
        try {
            return await WareHouseService.deleteWarehouse(id)
        } catch (error) {
            return { success: false, error: error.message }
        }
    })
    ipcMain.handle("warehouse:ActiveOnly" , async()=>{
        try{
            return await WareHouseService.getOnlyActive();
        }
        catch(error){
            return { success : false , error:error.message}
        }
    })
    
    console.log("Warehouse IPC handlers registered successfully")
}

// Export both as a function and as an object
module.exports = { SetWareHouseIPC }