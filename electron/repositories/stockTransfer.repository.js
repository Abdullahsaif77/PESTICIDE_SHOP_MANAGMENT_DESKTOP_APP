const db = require("../database/database")

class StockTransferRepository {
    create(data) {
        const stmt = db.prepare(`
            INSERT INTO stock_transfers (
                transfer_number,
                product_id,
                from_warehouse_id,
                to_warehouse_id,
                quantity,
                batch_id,
                transferred_by,
                status,
                notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        return stmt.run(
            data.transfer_number,
            data.product_id,
            data.from_warehouse_id,
            data.to_warehouse_id,
            data.quantity,
            data.batch_id || null,
            data.transferred_by || null,
            data.status || 'pending',
            data.notes || null
        );
    }

    getById(id) {
        const stmt = db.prepare(`
            SELECT 
                st.*,
                p.name as product_name,
                p.code as product_code,
                fw.name as from_warehouse_name,
                tw.name as to_warehouse_name,
                b.batch_number,
                u.full_name as transferred_by_name
            FROM stock_transfers st
            LEFT JOIN products p ON st.product_id = p.id
            LEFT JOIN warehouses fw ON st.from_warehouse_id = fw.id
            LEFT JOIN warehouses tw ON st.to_warehouse_id = tw.id
            LEFT JOIN batches b ON st.batch_id = b.id
            LEFT JOIN users u ON st.transferred_by = u.id
            WHERE st.id = ?
        `);
        return stmt.get(id);
    }

    getByTransferNumber(transferNumber) {
        const stmt = db.prepare(`
            SELECT 
                st.*,
                p.name as product_name,
                p.code as product_code,
                fw.name as from_warehouse_name,
                tw.name as to_warehouse_name,
                b.batch_number,
                u.full_name as transferred_by_name
            FROM stock_transfers st
            LEFT JOIN products p ON st.product_id = p.id
            LEFT JOIN warehouses fw ON st.from_warehouse_id = fw.id
            LEFT JOIN warehouses tw ON st.to_warehouse_id = tw.id
            LEFT JOIN batches b ON st.batch_id = b.id
            LEFT JOIN users u ON st.transferred_by = u.id
            WHERE st.transfer_number = ?
        `);
        return stmt.get(transferNumber);
    }

    getAll(filters = {}) {
        let query = `
            SELECT 
                st.*,
                p.name as product_name,
                p.code as product_code,
                fw.name as from_warehouse_name,
                tw.name as to_warehouse_name,
                b.batch_number,
                u.full_name as transferred_by_name
            FROM stock_transfers st
            LEFT JOIN products p ON st.product_id = p.id
            LEFT JOIN warehouses fw ON st.from_warehouse_id = fw.id
            LEFT JOIN warehouses tw ON st.to_warehouse_id = tw.id
            LEFT JOIN batches b ON st.batch_id = b.id
            LEFT JOIN users u ON st.transferred_by = u.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.status) {
            query += ' AND st.status = ?';
            params.push(filters.status);
        }

        if (filters.product_id) {
            query += ' AND st.product_id = ?';
            params.push(filters.product_id);
        }

        if (filters.from_warehouse_id) {
            query += ' AND st.from_warehouse_id = ?';
            params.push(filters.from_warehouse_id);
        }

        if (filters.to_warehouse_id) {
            query += ' AND st.to_warehouse_id = ?';
            params.push(filters.to_warehouse_id);
        }

        if (filters.transfer_number) {
            query += ' AND st.transfer_number LIKE ?';
            params.push(`%${filters.transfer_number}%`);
        }

        if (filters.date_from) {
            query += ' AND DATE(st.created_at) >= DATE(?)';
            params.push(filters.date_from);
        }

        if (filters.date_to) {
            query += ' AND DATE(st.created_at) <= DATE(?)';
            params.push(filters.date_to);
        }

        query += ' ORDER BY st.created_at DESC';

        const stmt = db.prepare(query);
        return stmt.all(...params);
    }

    getPending() {
        const stmt = db.prepare(`
            SELECT 
                st.*,
                p.name as product_name,
                p.code as product_code,
                fw.name as from_warehouse_name,
                tw.name as to_warehouse_name,
                b.batch_number
            FROM stock_transfers st
            LEFT JOIN products p ON st.product_id = p.id
            LEFT JOIN warehouses fw ON st.from_warehouse_id = fw.id
            LEFT JOIN warehouses tw ON st.to_warehouse_id = tw.id
            LEFT JOIN batches b ON st.batch_id = b.id
            WHERE st.status = 'pending'
            ORDER BY st.created_at ASC
        `);
        return stmt.all();
    }

    getCompleted() {
        const stmt = db.prepare(`
            SELECT 
                st.*,
                p.name as product_name,
                p.code as product_code,
                fw.name as from_warehouse_name,
                tw.name as to_warehouse_name,
                b.batch_number
            FROM stock_transfers st
            LEFT JOIN products p ON st.product_id = p.id
            LEFT JOIN warehouses fw ON st.from_warehouse_id = fw.id
            LEFT JOIN warehouses tw ON st.to_warehouse_id = tw.id
            LEFT JOIN batches b ON st.batch_id = b.id
            WHERE st.status = 'completed'
            ORDER BY st.completed_at DESC
        `);
        return stmt.all();
    }

    getByProduct(productId) {
        const stmt = db.prepare(`
            SELECT 
                st.*,
                fw.name as from_warehouse_name,
                tw.name as to_warehouse_name,
                b.batch_number,
                u.full_name as transferred_by_name
            FROM stock_transfers st
            LEFT JOIN warehouses fw ON st.from_warehouse_id = fw.id
            LEFT JOIN warehouses tw ON st.to_warehouse_id = tw.id
            LEFT JOIN batches b ON st.batch_id = b.id
            LEFT JOIN users u ON st.transferred_by = u.id
            WHERE st.product_id = ?
            ORDER BY st.created_at DESC
        `);
        return stmt.all(productId);
    }

    getByFromWarehouse(warehouseId) {
        const stmt = db.prepare(`
            SELECT 
                st.*,
                p.name as product_name,
                p.code as product_code,
                tw.name as to_warehouse_name,
                b.batch_number
            FROM stock_transfers st
            LEFT JOIN products p ON st.product_id = p.id
            LEFT JOIN warehouses tw ON st.to_warehouse_id = tw.id
            LEFT JOIN batches b ON st.batch_id = b.id
            WHERE st.from_warehouse_id = ?
            ORDER BY st.created_at DESC
        `);
        return stmt.all(warehouseId);
    }

    getByToWarehouse(warehouseId) {
        const stmt = db.prepare(`
            SELECT 
                st.*,
                p.name as product_name,
                p.code as product_code,
                fw.name as from_warehouse_name,
                b.batch_number
            FROM stock_transfers st
            LEFT JOIN products p ON st.product_id = p.id
            LEFT JOIN warehouses fw ON st.from_warehouse_id = fw.id
            LEFT JOIN batches b ON st.batch_id = b.id
            WHERE st.to_warehouse_id = ?
            ORDER BY st.created_at DESC
        `);
        return stmt.all(warehouseId);
    }

    update(id, data) {
        const updates = [];
        const params = [];

        if (data.product_id !== undefined) {
            updates.push('product_id = ?');
            params.push(data.product_id);
        }
        if (data.from_warehouse_id !== undefined) {
            updates.push('from_warehouse_id = ?');
            params.push(data.from_warehouse_id);
        }
        if (data.to_warehouse_id !== undefined) {
            updates.push('to_warehouse_id = ?');
            params.push(data.to_warehouse_id);
        }
        if (data.quantity !== undefined) {
            updates.push('quantity = ?');
            params.push(data.quantity);
        }
        if (data.batch_id !== undefined) {
            updates.push('batch_id = ?');
            params.push(data.batch_id);
        }
        if (data.status !== undefined) {
            updates.push('status = ?');
            params.push(data.status);
        }
        if (data.notes !== undefined) {
            updates.push('notes = ?');
            params.push(data.notes);
        }

        if (updates.length === 0) {
            return { success: false, error: 'No fields to update' };
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        const stmt = db.prepare(`
            UPDATE stock_transfers SET ${updates.join(', ')} WHERE id = ?
        `);
        return stmt.run(...params);
    }

    complete(id) {
        const stmt = db.prepare(`
            UPDATE stock_transfers 
            SET status = 'completed', 
                completed_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND status = 'pending'
        `);
        return stmt.run(id);
    }

    cancel(id) {
        const stmt = db.prepare(`
            UPDATE stock_transfers 
            SET status = 'cancelled',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND status != 'completed'
        `);
        return stmt.run(id);
    }

    delete(id) {
        const stmt = db.prepare(`
            DELETE FROM stock_transfers WHERE id = ?
        `);
        return stmt.run(id);
    }

    // Additional helper methods
    getRecentTransfers(limit = 10) {
        const stmt = db.prepare(`
            SELECT 
                st.*,
                p.name as product_name,
                fw.name as from_warehouse_name,
                tw.name as to_warehouse_name
            FROM stock_transfers st
            LEFT JOIN products p ON st.product_id = p.id
            LEFT JOIN warehouses fw ON st.from_warehouse_id = fw.id
            LEFT JOIN warehouses tw ON st.to_warehouse_id = tw.id
            ORDER BY st.created_at DESC
            LIMIT ?
        `);
        return stmt.all(limit);
    }

    getTransferStats() {
        const stmt = db.prepare(`
            SELECT 
                COUNT(*) as total_transfers,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                SUM(CASE WHEN status = 'completed' THEN quantity ELSE 0 END) as total_quantity_transferred
            FROM stock_transfers
        `);
        return stmt.get();
    }

    getTransfersByDateRange(startDate, endDate) {
        const stmt = db.prepare(`
            SELECT 
                st.*,
                p.name as product_name,
                fw.name as from_warehouse_name,
                tw.name as to_warehouse_name
            FROM stock_transfers st
            LEFT JOIN products p ON st.product_id = p.id
            LEFT JOIN warehouses fw ON st.from_warehouse_id = fw.id
            LEFT JOIN warehouses tw ON st.to_warehouse_id = tw.id
            WHERE DATE(st.created_at) >= DATE(?) AND DATE(st.created_at) <= DATE(?)
            ORDER BY st.created_at DESC
        `);
        return stmt.all(startDate, endDate);
    }
}

module.exports = new StockTransferRepository();