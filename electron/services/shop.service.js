const ShopRepository = require("../repositories/shop.repository");
const shopRepository = new ShopRepository();

class ShopService {

    getShop() {
        const shop = shopRepository.get();

        if (!shop) {
            throw new Error("Shop is not found");
        }

        return shop;
    }

    createShop(data) {
        const result = shopRepository.createDefault(data);

        if (result.changes === 0) {
            throw new Error("Shop already exists or failed to create Shop");
        }

        return result;
    }

    updateShop(data) {
        const result = shopRepository.update(data);

        if (result.changes === 0) {
            throw new Error("Failed to update Shop info");
        }

        return result;
    }
}

module.exports = ShopService;