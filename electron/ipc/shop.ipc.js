const { ipcMain } = require("electron");
const ShopService = require("../services/shop.service");
const shopService = new ShopService();

function setupShopIpc() {

  ipcMain.handle("shop:get", async () => {
    return shopService.getShop();
  });

  ipcMain.handle("shop:create", async (event, data) => {
    return shopService.createShop(data);
  });

  ipcMain.handle("shop:update", async (event, data) => {
    return shopService.updateShop(data);
  });

}

module.exports = { setupShopIpc };