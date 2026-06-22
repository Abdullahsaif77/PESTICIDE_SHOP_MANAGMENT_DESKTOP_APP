const db = require("../database/database")

class ProductRepository {
    getAll(){
        return db.prepare("SELECT * FROM products").all()
    }

    create(name , category_id , unit_id , purchase_price , sale_price){
        return db
      .prepare("INSERT INTO products (name , category_id , unit_id , purchase_price , sale_price) VALUES (?, ?, ? , ? , ?)")
      .run(name , category_id , unit_id , purchase_price , sale_price);
    }

    delete(id){
        return db.prepare("DELETE FROM products WHERE id = ?").run(id);
    }

}

module.exports = new ProductRepository()