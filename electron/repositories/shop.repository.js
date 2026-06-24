const db = require("../database/database")

class ShopRepository {
    get(){
        return db.prepare("SELECT * FROM shop_settings WHERE id = 1").get()
    }

    createDefault(data){
        return db.prepare(` INSERT OR IGNORE INTO shop_settings (id, shop_name, address, phone, email, license_number, gst_number, currency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    1,
    data.shop_name,
    data.address,
    data.phone,
    data.email,
    data.license_number,
    data.gst_number,
    data.currency
      )
    }

    update(data){
        return db.prepare(`
            UPDATE shop_settings
      SET shop_name = ?,
          address = ?,
          phone = ?,
          email = ?,
          license_number = ?,
          gst_number = ?,
          currency = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(
      data.shop_name,
      data.address,
      data.phone,
      data.email,
      data.license_number,
      data.gst_number,
      data.currency
        )
    }
}

module.exports = ShopRepository
