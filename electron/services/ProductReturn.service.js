// electron/services/productReturn.service.js
const ProductReturnRepository = require("../repositories/productReturn.repository");
const salesRepository = require("../repositories/sales.repository"); // ← This is already an instance
const InventoryService = require("./inventory.service");
const LedgerService = require("./ledger.service");
const CustomerService = require("./customer.service");

const returnRepo = new ProductReturnRepository();


class ProductReturnService {
    // Create a return
    async createReturn(data) {
        try {
            // Validate customer
            const customer = await customerService.getCustomerById(data.customer_id);
            if (!customer) {
                throw new Error("Customer not found");
            }
            
            // Validate sale if provided
            if (data.sale_id) {
                const sale = await saleRepo.getById(data.sale_id);
                if (!sale) {
                    throw new Error("Sale not found");
                }
                
                // Check if return is allowed
                const canReturn = returnRepo.canReturn(data.sale_id);
                if (!canReturn.allowed) {
                    throw new Error(canReturn.reason);
                }
                
                // Validate items against sale items
                const saleItems = await saleRepo.getItems(data.sale_id); // ← Use getItems instead of getSaleItems
                for (const returnItem of data.items) {
                    const saleItem = saleItems.find(item => item.product_id === returnItem.product_id);
                    if (!saleItem) {
                        throw new Error(`Product ${returnItem.product_id} not found in the original sale`);
                    }
                    if (returnItem.quantity > saleItem.quantity) {
                        throw new Error(`Return quantity for product ${returnItem.product_id} exceeds sale quantity`);
                    }
                }
            }
            
            // Generate return number
            const returnNumber = returnRepo.generateReturnNumber();
            
            // Calculate total
            const totalReturnAmount = data.items.reduce((sum, item) => {
                return sum + (item.quantity * item.unit_price);
            }, 0);
            
            // Create return record
            const result = returnRepo.createReturn({
                return_number: returnNumber,
                sale_id: data.sale_id || null,
                customer_id: data.customer_id,
                return_date: data.return_date || new Date().toISOString(),
                total_return_amount: totalReturnAmount,
                refund_method: data.refund_method || 'cash',
                refund_status: data.refund_status || 'completed',
                reason: data.reason,
                notes: data.notes,
                created_by: data.created_by || 1
            });
            
            const returnId = result.lastInsertRowid;
            
            // Add return items and restock inventory
            const itemsWithRestock = data.items.map(item => ({
                ...item,
                restocked: data.auto_restock !== false ? 1 : 0
            }));
            
            returnRepo.addReturnItems(returnId, itemsWithRestock);
            
            // Restock inventory and update ledger
            if (data.auto_restock !== false) {
                for (const item of itemsWithRestock) {
                    // Add stock back to inventory
                    await inventoryService.addStock(
                        item.product_id,
                        data.warehouse_id || 1,
                        item.batch_id || null,
                        item.quantity
                    );
                    
                    // Update product stock quantity
                    await inventoryService.updateProductStockQuantity(item.product_id);
                }
            }
            
            // Update ledger for customer
            if (data.refund_method === 'cash') {
                await ledgerService.recordCustomerPayment(
                    data.customer_id,
                    totalReturnAmount,
                    'cash',
                    returnNumber,
                    `Product return refund - ${returnNumber}`
                );
            } else if (data.refund_method === 'credit_note') {
                await ledgerService.adjustCustomerBalance(
                    data.customer_id,
                    totalReturnAmount,
                    `Product return credit note - ${returnNumber}`,
                    returnNumber
                );
            }
            
            // Update customer balance
            await customerService.updateCustomerBalance(data.customer_id);
            
            // Get the complete return data
            const newReturn = returnRepo.getById(returnId);
            
            return {
                success: true,
                data: newReturn,
                message: "Return created successfully"
            };
        } catch (error) {
            console.error("❌ Error in createReturn:", error);
            throw error;
        }
    }

    // Get return by ID
    getReturnById(id) {
        try {
            const returnData = returnRepo.getById(id);
            if (!returnData) {
                throw new Error("Return not found");
            }
            return returnData;
        } catch (error) {
            console.error("❌ Error in getReturnById:", error);
            throw error;
        }
    }

    // Get return by number
    getReturnByNumber(returnNumber) {
        return returnRepo.getByReturnNumber(returnNumber);
    }

    // Get all returns
    getAllReturns(filters = {}) {
        try {
            return returnRepo.getAll(filters);
        } catch (error) {
            console.error("❌ Error in getAllReturns:", error);
            throw error;
        }
    }

    // Update return
    updateReturn(id, data) {
        try {
            const existing = returnRepo.getById(id);
            if (!existing) {
                throw new Error("Return not found");
            }
            
            if (data.refund_status === 'cancelled' && existing.refund_status !== 'cancelled') {
                const items = existing.items || [];
                for (const item of items) {
                    if (item.restocked) {
                        inventoryService.removeStock(
                            item.product_id,
                            1,
                            item.batch_id || null,
                            item.quantity
                        );
                    }
                }
            }
            
            const result = returnRepo.update(id, data);
            
            return {
                success: true,
                data: result,
                message: "Return updated successfully"
            };
        } catch (error) {
            console.error("❌ Error in updateReturn:", error);
            throw error;
        }
    }

    // Update return status
    updateReturnStatus(id, status) {
        try {
            const existing = returnRepo.getById(id);
            if (!existing) {
                throw new Error("Return not found");
            }
            
            if (status === 'cancelled' && existing.refund_status !== 'cancelled') {
                const items = existing.items || [];
                for (const item of items) {
                    if (item.restocked) {
                        inventoryService.removeStock(
                            item.product_id,
                            1,
                            item.batch_id || null,
                            item.quantity
                        );
                    }
                }
            }
            
            const result = returnRepo.updateStatus(id, status);
            
            return {
                success: true,
                data: result,
                message: `Return status updated to ${status}`
            };
        } catch (error) {
            console.error("❌ Error in updateReturnStatus:", error);
            throw error;
        }
    }

    // Delete return
    deleteReturn(id) {
        try {
            const existing = returnRepo.getById(id);
            if (!existing) {
                throw new Error("Return not found");
            }
            
            if (existing.refund_status === 'completed') {
                throw new Error("Cannot delete a completed return");
            }
            
            const items = existing.items || [];
            for (const item of items) {
                if (item.restocked) {
                    inventoryService.removeStock(
                        item.product_id,
                        1,
                        item.batch_id || null,
                        item.quantity
                    );
                }
            }
            
            const result = returnRepo.delete(id);
            
            return {
                success: true,
                data: result,
                message: "Return deleted successfully"
            };
        } catch (error) {
            console.error("❌ Error in deleteReturn:", error);
            throw error;
        }
    }

    // Get returns by customer
    getCustomerReturns(customerId) {
        return returnRepo.getByCustomer(customerId);
    }

    // Get return summary
    getReturnSummary() {
        return returnRepo.getSummary();
    }

    // Get top returned products
    getTopReturnedProducts(limit = 10) {
        return returnRepo.getTopReturnedProducts(limit);
    }

    // Process return and update everything
    async processReturn(id) {
        try {
            const returnData = returnRepo.getById(id);
            if (!returnData) {
                throw new Error("Return not found");
            }
            
            if (returnData.refund_status === 'completed') {
                throw new Error("Return already processed");
            }
            
            returnRepo.updateStatus(id, 'completed');
            
            if (returnData.refund_method === 'cash') {
                await ledgerService.recordCustomerPayment(
                    returnData.customer_id,
                    returnData.total_return_amount,
                    'cash',
                    returnData.return_number,
                    `Product return refund - ${returnData.return_number}`
                );
            }
            
            await customerService.updateCustomerBalance(returnData.customer_id);
            
            const updatedReturn = returnRepo.getById(id);
            
            return {
                success: true,
                data: updatedReturn,
                message: "Return processed successfully"
            };
        } catch (error) {
            console.error("❌ Error in processReturn:", error);
            throw error;
        }
    }
}

module.exports = ProductReturnService;