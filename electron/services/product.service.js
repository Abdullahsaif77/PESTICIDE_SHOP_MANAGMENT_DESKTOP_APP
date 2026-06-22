const ProductRepository = require("../repositories/product.repository")

class ProductService {
    getProduct(){
        return ProductRepository.getAll()
    }

    createProduct(data){
        const { name  , category_id , unit_id , purchase_price , sale_price} = data
        if(!name){
            throw new Error("Name required")
        }
         if(!category_id){
            throw new Error("Category is required")
        }
         if(!unit_id){
            throw new Error("unit is required")
        }
       if (!purchase_price || purchase_price <= 0) {
    throw new Error("Purchase price invalid");
}

if (!sale_price || sale_price <= 0) {
    throw new Error("Sale price invalid");
}

        return productRepository.create(name  , category_id , unit_id , purchase_price , sale_price)
    }

    deleteProduct(id){
        return productRepository.delete(id)
    }

}

module.exports = new ProductService()