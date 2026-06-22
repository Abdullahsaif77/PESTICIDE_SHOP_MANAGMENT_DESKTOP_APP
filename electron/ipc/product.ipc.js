const { ipcMain } = require("electron")
const ProductService = require("../services/product.service")

function registerProductIPC(){
    ipcMain.handle("product:get",()=>{
        try{
            return productService.getProduct()
        }catch(error){
            return { error: err.message };
        }
        
    })
   ipcMain.handle("product:add", async (event, data) => {
    try {
        return productService.createProduct(data);
    } catch (err) {
        return { error: err.message };
    }
});
    ipcMain.handle("product:delete",(event,id)=>{
        try{
            return productService.deleteProduct(id)
        }catch(error){
            return { error: err.message };
        }
    })
}

module.exports = registerProductIPC