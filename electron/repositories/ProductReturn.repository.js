// electron/repositories/productReturn.repository.js
const db = require("../database/database");

class ProductReturnRepository {
    // Generate return number - FIXED
    generateReturnNumber() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}${month}${day}`;
        
        // Get the last sequence number for today
        const lastReturn = db.prepare(`
            SELECT return_number 
            FROM product_returns 
            WHERE return_number LIKE ?
            ORDER BY return_number DESC 
            LIMIT 1
        `).get(`RET-${dateStr}-%`);
        
        let sequence = 1;
        if (lastReturn) {
            const parts = lastReturn.return_number.split('-');
            if (parts.length === 3) {
                const lastSeq = parseInt(parts[2]);
                if (!isNaN(lastSeq)) {
                    sequence = lastSeq + 1;
                }
            }
        }
        
        const sequenceStr = String(sequence).padStart(4, '0');
        const returnNumber = `RET-${dateStr}-${sequenceStr}`;
        
        console.log(`📝 Generated return number: ${returnNumber}`);
        return returnNumber;
    }

    // Create return
    createReturn(data) {
        const stmt = db.prepare(`
            INSERT INTO product_returns (
                return_number, sale_id, customer_id, return_date,
                total_return_amount, refund_method, refund_status,
                reason, notes, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        return stmt.run(
            data.return_number,
            data.sale_id || null,
            data.customer_id,
            data.return_date || new Date().toISOString(),
            data.total_return_amount,
            data.refund_method || 'cash',
            data.refund_status || 'pending',
            data.reason || null,
            data.notes || null,
            data.created_by || 1
        );
    }

    // Add return items
    addReturnItems(returnId, items) {
        const stmt = db.prepare(`
            INSERT INTO product_return_items (
                return_id, product_id, batch_id, quantity,
                unit_price, total_price, reason, condition, restocked
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const insertMany = db.transaction((items) => {
            for (const item of items) {
                stmt.run(
                    returnId,
                    item.product_id,
                    item.batch_id || null,
                    item.quantity,
                    item.unit_price,
                    item.quantity * item.unit_price,
                    item.reason || null,
                    item.condition || 'good',
                    item.restocked || 0
                );
            }
        });
        
        return insertMany(items);
    }

    // Get return by ID
    getById(id) {
        const returnData = db.prepare(`
            SELECT pr.*, 
                   c.name as customer_name,
                   c.phone as customer_phone,
                   c.email as customer_email,
                   s.invoice_number as sale_invoice
            FROM product_returns pr
            LEFT JOIN customers c ON pr.customer_id = c.id
            LEFT JOIN sales s ON pr.sale_id = s.id
            WHERE pr.id = ?
        `).get(id);
        
        if (!returnData) return null;
        
        // Get return items
        const items = db.prepare(`
            SELECT pri.*,
                   p.name as product_name,
                   p.code as product_code,
                   p.unit as unit,
                   b.batch_number,
                   b.expiry_date
            FROM product_return_items pri
            LEFT JOIN products p ON pri.product_id = p.id
            LEFT JOIN batches b ON pri.batch_id = b.id
            WHERE pri.return_id = ?
        `).all(id);
        
        return { ...returnData, items };
    }

    // Get return by return number
    getByReturnNumber(returnNumber) {
        return db.prepare("SELECT * FROM product_returns WHERE return_number = ?").get(returnNumber);
    }

    // Get all returns with filters
    getAll(filters = {}) {
        let query = `
            SELECT pr.*, 
                   c.name as customer_name,
                   c.phone as customer_phone,
                   s.invoice_number as sale_invoice,
                   COUNT(pri.id) as item_count
            FROM product_returns pr
            LEFT JOIN customers c ON pr.customer_id = c.id
            LEFT JOIN sales s ON pr.sale_id = s.id
            LEFT JOIN product_return_items pri ON pr.id = pri.return_id
            WHERE 1=1
        `;
        const params = [];
        
        if (filters.customer_id) {
            query += " AND pr.customer_id = ?";
            params.push(filters.customer_id);
        }
        
        if (filters.sale_id) {
            query += " AND pr.sale_id = ?";
            params.push(filters.sale_id);
        }
        
        if (filters.refund_status) {
            query += " AND pr.refund_status = ?";
            params.push(filters.refund_status);
        }
        
        if (filters.start_date) {
            query += " AND DATE(pr.return_date) >= DATE(?)";
            params.push(filters.start_date);
        }
        
        if (filters.end_date) {
            query += " AND DATE(pr.return_date) <= DATE(?)";
            params.push(filters.end_date);
        }
        
        if (filters.search) {
            query += ` AND (pr.return_number LIKE ? OR c.name LIKE ? OR c.phone LIKE ?)`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        query += " GROUP BY pr.id ORDER BY pr.created_at DESC";
        
        if (filters.limit) {
            query += " LIMIT ?";
            params.push(filters.limit);
        }
        
        if (filters.offset) {
            query += " OFFSET ?";
            params.push(filters.offset);
        }
        
        return db.prepare(query).all(...params);
    }

    // Update return
    update(id, data) {
        const fields = [];
        const values = [];
        
        const allowedFields = ['refund_method', 'refund_status', 'reason', 'notes'];
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }
        
        if (fields.length === 0) return { changes: 0 };
        
        values.push(id);
        const query = `UPDATE product_returns SET ${fields.join(', ')} WHERE id = ?`;
        return db.prepare(query).run(...values);
    }

    // Update return status
    updateStatus(id, status) {
        return db.prepare(`
            UPDATE product_returns 
            SET refund_status = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `).run(status, id);
    }

    // Delete return
    delete(id) {
        return db.prepare("DELETE FROM product_returns WHERE id = ?").run(id);
    }

    // Get returns by customer
    getByCustomer(customerId) {
        return db.prepare(`
            SELECT pr.*, 
                   COUNT(pri.id) as item_count,
                   s.invoice_number
            FROM product_returns pr
            LEFT JOIN product_return_items pri ON pr.id = pri.return_id
            LEFT JOIN sales s ON pr.sale_id = s.id
            WHERE pr.customer_id = ?
            GROUP BY pr.id
            ORDER BY pr.created_at DESC
        `).all(customerId);
    }

    // Get return summary
    getSummary() {
        const totalReturns = db.prepare(`
            SELECT 
                COUNT(*) as total_returns,
                COALESCE(SUM(total_return_amount), 0) as total_amount,
                COUNT(CASE WHEN refund_status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN refund_status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN refund_status = 'cancelled' THEN 1 END) as cancelled
            FROM product_returns
        `).get();
        
        const today = new Date().toISOString().split('T')[0];
        const todayReturns = db.prepare(`
            SELECT 
                COUNT(*) as count,
                COALESCE(SUM(total_return_amount), 0) as total
            FROM product_returns 
            WHERE DATE(return_date) = DATE(?)
        `).get(today);
        
        return {
            ...totalReturns,
            today_returns: todayReturns?.count || 0,
            today_amount: todayReturns?.total || 0
        };
    }

    // Get top returned products
    getTopReturnedProducts(limit = 10) {
        return db.prepare(`
            SELECT 
                p.id,
                p.name,
                p.code,
                COUNT(pri.id) as return_count,
                SUM(pri.quantity) as total_quantity,
                SUM(pri.total_price) as total_amount
            FROM product_return_items pri
            JOIN products p ON pri.product_id = p.id
            GROUP BY pri.product_id
            ORDER BY total_quantity DESC
            LIMIT ?
        `).all(limit);
    }

    // Check if return can be processed
    canReturn(saleId) {
        // Check if there's already a return for this sale
        const existing = db.prepare(`
            SELECT id FROM product_returns 
            WHERE sale_id = ? AND refund_status != 'cancelled'
        `).get(saleId);
        
        if (existing) {
            return { allowed: false, reason: 'Return already exists for this sale' };
        }
        
        // Check if sale is within return period (e.g., 30 days)
        const sale = db.prepare(`
            SELECT sale_date FROM sales WHERE id = ?
        `).get(saleId);
        
        if (sale) {
            const saleDate = new Date(sale.sale_date);
            const now = new Date();
            const daysDiff = (now - saleDate) / (1000 * 60 * 60 * 24);
            
            if (daysDiff > 30) {
                return { allowed: false, reason: 'Sale is more than 30 days old' };
            }
        }
        
        return { allowed: true };
    }
}

module.exports = ProductReturnRepository;