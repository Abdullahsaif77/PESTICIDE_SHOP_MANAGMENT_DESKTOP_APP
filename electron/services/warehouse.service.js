const WareHouseRepository = require("../repositories/warehouse.repository")

class WareHouseService {
    async createWarehouse(data) {
        if (!data.name || data.name.trim() === '') {
            return { success: false, error: 'Warehouse name is required' }
        }

        const existing = await WareHouseRepository.getByName(data.name.trim())
        if (existing.success && existing.data) {
            return { success: false, error: `Warehouse "${data.name}" already exists` }
        }

        const result = await WareHouseRepository.create(data)
        if (result.success) {
            const warehouse = await WareHouseRepository.getById(result.id)
            return { success: true, data: warehouse.data, message: 'Warehouse created' }
        }
        return result
    }

     async getOnlyActive() {
        const result = await WareHouseRepository.getActiveOnly()
        return result
    }

    async getWarehouseById(id) {
        const result = await WareHouseRepository.getById(id)
        return result
    }

    async updateWarehouse(id, data) {
        const exists = await WareHouseRepository.getById(id)
        if (!exists.success) return exists

        if (data.name) {
            const duplicate = await WareHouseRepository.getByName(data.name.trim())
            if (duplicate.success && duplicate.data && duplicate.data.id !== id) {
                return { success: false, error: `Warehouse "${data.name}" already exists` }
            }
        }

        const result = await WareHouseRepository.update(id, data)
        if (result.success) {
            const updated = await WareHouseRepository.getById(id)
            return { success: true, data: updated.data, message: 'Warehouse updated' }
        }
        return result
    }

    async deleteWarehouse(id) {
        const result = await WareHouseRepository.delete(id)
        return result
    }
}

module.exports = new WareHouseService()