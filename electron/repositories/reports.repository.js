// electron/repositories/reports.repository.js
const db = require("../database/database");

class ReportsRepository {
    // ============================================
    // SALES REPORT
    // ============================================
    getSalesReport(filters = {}) {
        let query = `
            SELECT 
                s.id,
                s.invoice_number,
                s.sale_date as date,
                c.name as customer,
                COUNT(si.id) as items,
                s.total_amount as total,
                s.paid_amount as paid,
                s.due_amount as due,
                (s.total_amount - (s.discount || 0) - (SELECT COALESCE(SUM(si2.purchase_price * si2.quantity), 0) FROM sale_items si2 WHERE si2.sale_id = s.id)) as profit
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.id
            LEFT JOIN sale_items si ON s.id = si.sale_id
            WHERE 1=1
        `;
        const params = [];

        if (filters.startDate) {
            query += " AND DATE(s.sale_date) >= DATE(?)";
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += " AND DATE(s.sale_date) <= DATE(?)";
            params.push(filters.endDate);
        }

        if (filters.customer) {
            query += " AND s.customer_id = ?";
            params.push(filters.customer);
        }

        if (filters.warehouse) {
            query += " AND s.warehouse_id = ?";
            params.push(filters.warehouse);
        }

        if (filters.paymentMethod) {
            query += " AND s.payment_method = ?";
            params.push(filters.paymentMethod);
        }

        if (filters.search) {
            query += " AND (s.invoice_number LIKE ? OR c.name LIKE ?)";
            const search = `%${filters.search}%`;
            params.push(search, search);
        }

        query += " GROUP BY s.id ORDER BY s.sale_date DESC";

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

    getSalesSummary(filters = {}) {
        let query = `
            SELECT 
                COALESCE(SUM(s.total_amount), 0) as total_sales,
                COALESCE(SUM(CASE WHEN s.payment_method = 'cash' THEN s.total_amount ELSE 0 END), 0) as cash_sales,
                COALESCE(SUM(CASE WHEN s.payment_method != 'cash' OR s.payment_method IS NULL THEN s.total_amount ELSE 0 END), 0) as credit_sales,
                COUNT(DISTINCT s.id) as invoice_count,
                COALESCE(SUM(si.quantity), 0) as total_quantity,
                COALESCE(SUM(s.discount), 0) as discount_given,
                COALESCE(SUM(s.total_amount - (s.discount || 0)), 0) as net_sales,
                COALESCE(SUM(s.total_amount - (s.discount || 0) - (si.purchase_price * si.quantity)), 0) as profit
            FROM sales s
            LEFT JOIN sale_items si ON s.id = si.sale_id
            WHERE 1=1
        `;
        const params = [];

        if (filters.startDate) {
            query += " AND DATE(s.sale_date) >= DATE(?)";
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += " AND DATE(s.sale_date) <= DATE(?)";
            params.push(filters.endDate);
        }

        if (filters.warehouse) {
            query += " AND s.warehouse_id = ?";
            params.push(filters.warehouse);
        }

        return db.prepare(query).get(...params);
    }

    getSalesChartData(filters = {}) {
        let query = `
            SELECT 
                DATE(s.sale_date) as date,
                COALESCE(SUM(s.total_amount), 0) as amount
            FROM sales s
            WHERE 1=1
        `;
        const params = [];

        if (filters.startDate) {
            query += " AND DATE(s.sale_date) >= DATE(?)";
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += " AND DATE(s.sale_date) <= DATE(?)";
            params.push(filters.endDate);
        }

        query += " GROUP BY DATE(s.sale_date) ORDER BY DATE(s.sale_date) ASC";

        return db.prepare(query).all(...params);
    }

    // ============================================
    // PURCHASE REPORT
    // ============================================
    getPurchaseReport(filters = {}) {
        let query = `
            SELECT 
                p.id as purchase_id,
                p.purchase_number,
                p.purchase_date as date,
                s.name as supplier,
                w.name as warehouse,
                COUNT(pi.id) as items,
                COALESCE(SUM(pi.quantity), 0) as quantity,
                p.total_amount as amount
            FROM purchases p
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            LEFT JOIN warehouses w ON p.warehouse_id = w.id
            LEFT JOIN purchase_items pi ON p.id = pi.purchase_id
            WHERE 1=1
        `;
        const params = [];

        if (filters.startDate) {
            query += " AND DATE(p.purchase_date) >= DATE(?)";
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += " AND DATE(p.purchase_date) <= DATE(?)";
            params.push(filters.endDate);
        }

        if (filters.supplier) {
            query += " AND p.supplier_id = ?";
            params.push(filters.supplier);
        }

        if (filters.warehouse) {
            query += " AND p.warehouse_id = ?";
            params.push(filters.warehouse);
        }

        if (filters.search) {
            query += " AND (p.purchase_number LIKE ? OR s.name LIKE ?)";
            const search = `%${filters.search}%`;
            params.push(search, search);
        }

        query += " GROUP BY p.id ORDER BY p.purchase_date DESC";

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

    getPurchaseSummary(filters = {}) {
        let query = `
            SELECT 
                COALESCE(SUM(p.total_amount), 0) as total_purchases,
                COALESCE(SUM(pi.quantity), 0) as total_quantity,
                COALESCE(SUM(pi.purchase_price * pi.quantity), 0) as total_cost
            FROM purchases p
            LEFT JOIN purchase_items pi ON p.id = pi.purchase_id
            WHERE 1=1
        `;
        const params = [];

        if (filters.startDate) {
            query += " AND DATE(p.purchase_date) >= DATE(?)";
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += " AND DATE(p.purchase_date) <= DATE(?)";
            params.push(filters.endDate);
        }

        if (filters.supplier) {
            query += " AND p.supplier_id = ?";
            params.push(filters.supplier);
        }

        if (filters.warehouse) {
            query += " AND p.warehouse_id = ?";
            params.push(filters.warehouse);
        }

        return db.prepare(query).get(...params);
    }

    // ============================================
    // PROFIT & LOSS REPORT
    // ============================================
    getProfitLossSummary(filters = {}) {
        let query = `
            SELECT 
                COALESCE(SUM(s.total_amount), 0) as revenue,
                COALESCE(SUM(si.purchase_price * si.quantity), 0) as purchase_cost,
                COALESCE(SUM(e.amount), 0) as expenses,
                COALESCE(SUM(s.total_amount) - SUM(si.purchase_price * si.quantity) - SUM(e.amount), 0) as net_profit
            FROM sales s
            LEFT JOIN sale_items si ON s.id = si.sale_id
            LEFT JOIN expenses e ON DATE(e.expense_date) BETWEEN DATE(s.sale_date) AND DATE(s.sale_date)
            WHERE 1=1
        `;
        const params = [];

        if (filters.startDate) {
            query += " AND DATE(s.sale_date) >= DATE(?)";
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += " AND DATE(s.sale_date) <= DATE(?)";
            params.push(filters.endDate);
        }

        return db.prepare(query).get(...params);
    }

    getProfitLossTimeline(filters = {}) {
        let query = `
            SELECT 
                strftime('%Y-%m', s.sale_date) as month,
                COALESCE(SUM(s.total_amount), 0) as revenue,
                COALESCE(SUM(si.purchase_price * si.quantity), 0) as cost,
                COALESCE(SUM(e.amount), 0) as expenses,
                COALESCE(SUM(s.total_amount) - SUM(si.purchase_price * si.quantity) - SUM(e.amount), 0) as profit
            FROM sales s
            LEFT JOIN sale_items si ON s.id = si.sale_id
            LEFT JOIN expenses e ON strftime('%Y-%m', e.expense_date) = strftime('%Y-%m', s.sale_date)
            WHERE 1=1
        `;
        const params = [];

        if (filters.startDate) {
            query += " AND DATE(s.sale_date) >= DATE(?)";
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += " AND DATE(s.sale_date) <= DATE(?)";
            params.push(filters.endDate);
        }

        query += " GROUP BY strftime('%Y-%m', s.sale_date) ORDER BY strftime('%Y-%m', s.sale_date) ASC";

        return db.prepare(query).all(...params);
    }

    // ============================================
    // INVENTORY REPORT
    // ============================================
    getInventoryReport(filters = {}) {
        let query = `
            SELECT 
                p.name as product,
                p.code as sku,
                w.name as warehouse,
                COALESCE(i.quantity, 0) as stock,
                p.purchase_price,
                p.sale_price as selling_price,
                COALESCE(i.quantity * p.purchase_price, 0) as stock_value,
                COALESCE(i.quantity * (p.sale_price - p.purchase_price), 0) as profit_potential,
                CASE 
                    WHEN COALESCE(i.quantity, 0) <= 0 THEN 'Out of Stock'
                    WHEN COALESCE(i.quantity, 0) <= p.reorder_level THEN 'Low Stock'
                    ELSE 'In Stock'
                END as status
            FROM products p
            LEFT JOIN inventory i ON p.id = i.product_id
            LEFT JOIN warehouses w ON i.warehouse_id = w.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.warehouse) {
            query += " AND i.warehouse_id = ?";
            params.push(filters.warehouse);
        }

        if (filters.status) {
            if (filters.status === 'in_stock') {
                query += " AND COALESCE(i.quantity, 0) > p.reorder_level";
            } else if (filters.status === 'low_stock') {
                query += " AND COALESCE(i.quantity, 0) <= p.reorder_level AND COALESCE(i.quantity, 0) > 0";
            } else if (filters.status === 'out_of_stock') {
                query += " AND COALESCE(i.quantity, 0) <= 0";
            }
        }

        if (filters.search) {
            query += " AND (p.name LIKE ? OR p.code LIKE ?)";
            const search = `%${filters.search}%`;
            params.push(search, search);
        }

        query += " ORDER BY p.name ASC";

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

    getInventorySummary() {
        const query = `
            SELECT 
                COALESCE(SUM(i.quantity), 0) as total_stock,
                COALESCE(SUM(i.quantity * p.purchase_price), 0) as stock_value,
                COALESCE(AVG(p.purchase_price), 0) as avg_cost,
                COALESCE(SUM(i.quantity * p.sale_price), 0) as selling_value
            FROM inventory i
            JOIN products p ON i.product_id = p.id
            WHERE i.quantity > 0
        `;
        return db.prepare(query).get();
    }

    // ============================================
    // LOW STOCK REPORT
    // ============================================
    getLowStockReport(filters = {}) {
        let query = `
            SELECT 
                p.name as product,
                COALESCE(i.quantity, 0) as current_qty,
                p.reorder_level as min_qty,
                w.name as warehouse,
                CASE 
                    WHEN COALESCE(i.quantity, 0) <= p.reorder_level * 0.3 THEN 'Critical'
                    ELSE 'Low'
                END as status
            FROM products p
            LEFT JOIN inventory i ON p.id = i.product_id
            LEFT JOIN warehouses w ON i.warehouse_id = w.id
            WHERE COALESCE(i.quantity, 0) <= p.reorder_level
        `;
        const params = [];

        if (filters.warehouse) {
            query += " AND i.warehouse_id = ?";
            params.push(filters.warehouse);
        }

        if (filters.search) {
            query += " AND p.name LIKE ?";
            params.push(`%${filters.search}%`);
        }

        query += " ORDER BY (COALESCE(i.quantity, 0) / p.reorder_level) ASC";

        return db.prepare(query).all(...params);
    }

    // ============================================
    // EXPIRY REPORT
    // ============================================
    getExpiryReport(filters = {}) {
        let query = `
            SELECT 
                p.name as product,
                b.batch_number,
                b.created_at as manufacturing_date,
                b.expiry_date,
                julianday(b.expiry_date) - julianday('now') as days_remaining,
                b.quantity,
                w.name as warehouse,
                CASE 
                    WHEN julianday(b.expiry_date) - julianday('now') < 0 THEN 'Expired'
                    WHEN julianday(b.expiry_date) - julianday('now') <= 30 THEN 'Expiring Soon'
                    WHEN julianday(b.expiry_date) - julianday('now') <= 60 THEN 'Expiring'
                    ELSE 'Good'
                END as status
            FROM batches b
            JOIN products p ON b.product_id = p.id
            LEFT JOIN inventory i ON b.id = i.batch_id
            LEFT JOIN warehouses w ON i.warehouse_id = w.id
            WHERE b.expiry_date IS NOT NULL
        `;
        const params = [];

        if (filters.warehouse) {
            query += " AND i.warehouse_id = ?";
            params.push(filters.warehouse);
        }

        if (filters.expiryStatus) {
            if (filters.expiryStatus === 'expired') {
                query += " AND julianday(b.expiry_date) - julianday('now') < 0";
            } else if (filters.expiryStatus === 'expiring_soon') {
                query += " AND julianday(b.expiry_date) - julianday('now') BETWEEN 0 AND 30";
            } else if (filters.expiryStatus === 'good') {
                query += " AND julianday(b.expiry_date) - julianday('now') > 60";
            }
        }

        if (filters.search) {
            query += " AND p.name LIKE ?";
            params.push(`%${filters.search}%`);
        }

        query += " ORDER BY b.expiry_date ASC";

        return db.prepare(query).all(...params);
    }

    getExpirySummary() {
        const query = `
            SELECT 
                COALESCE(SUM(CASE WHEN julianday(expiry_date) - julianday('now') < 0 THEN quantity ELSE 0 END), 0) as expired,
                COALESCE(SUM(CASE WHEN julianday(expiry_date) - julianday('now') BETWEEN 0 AND 30 THEN quantity ELSE 0 END), 0) as expiring30,
                COALESCE(SUM(CASE WHEN julianday(expiry_date) - julianday('now') BETWEEN 31 AND 60 THEN quantity ELSE 0 END), 0) as expiring60
            FROM batches
            WHERE expiry_date IS NOT NULL
        `;
        return db.prepare(query).get();
    }

    // ============================================
    // CUSTOMER LEDGER REPORT
    // ============================================
    getCustomerLedgerReport(filters = {}) {
        let query = `
            SELECT 
                c.id,
                c.name,
                c.phone,
                COALESCE(SUM(s.total_amount), 0) as total_purchases,
                COALESCE(SUM(s.paid_amount), 0) as total_paid,
                COALESCE(SUM(s.due_amount), 0) as outstanding,
                COALESCE(SUM(s.total_amount) - SUM(s.paid_amount), 0) as closing_balance
            FROM customers c
            LEFT JOIN sales s ON c.id = s.customer_id
            WHERE 1=1
        `;
        const params = [];

        if (filters.search) {
            query += " AND (c.name LIKE ? OR c.phone LIKE ?)";
            const search = `%${filters.search}%`;
            params.push(search, search);
        }

        query += " GROUP BY c.id ORDER BY c.name ASC";

        return db.prepare(query).all(...params);
    }

    getCustomerLedgerDetails(customerId) {
        const query = `
            SELECT 
                s.invoice_number,
                s.sale_date as date,
                s.total_amount as debit,
                s.paid_amount as credit,
                s.due_amount as balance
            FROM sales s
            WHERE s.customer_id = ?
            ORDER BY s.sale_date DESC
        `;
        return db.prepare(query).all(customerId);
    }

    // ============================================
    // SUPPLIER LEDGER REPORT
    // ============================================
    getSupplierLedgerReport(filters = {}) {
        let query = `
            SELECT 
                s.id,
                s.name,
                s.phone,
                COALESCE(SUM(p.total_amount), 0) as total_purchases,
                COALESCE(SUM(p.paid_amount), 0) as payments_made,
                COALESCE(SUM(p.due_amount), 0) as payable,
                COALESCE(SUM(p.total_amount) - SUM(p.paid_amount), 0) as closing_balance
            FROM suppliers s
            LEFT JOIN purchases p ON s.id = p.supplier_id
            WHERE 1=1
        `;
        const params = [];

        if (filters.search) {
            query += " AND (s.name LIKE ? OR s.phone LIKE ?)";
            const search = `%${filters.search}%`;
            params.push(search, search);
        }

        query += " GROUP BY s.id ORDER BY s.name ASC";

        return db.prepare(query).all(...params);
    }

    getSupplierLedgerDetails(supplierId) {
        const query = `
            SELECT 
                p.purchase_number,
                p.purchase_date as date,
                p.total_amount as debit,
                p.paid_amount as credit,
                p.due_amount as balance
            FROM purchases p
            WHERE p.supplier_id = ?
            ORDER BY p.purchase_date DESC
        `;
        return db.prepare(query).all(supplierId);
    }

    // ============================================
    // EXPENSE REPORT
    // ============================================
    getExpenseReport(filters = {}) {
        let query = `
            SELECT 
                e.id,
                e.expense_number,
                ec.name as category,
                e.amount,
                e.description,
                e.expense_date as date,
                e.payment_method
            FROM expenses e
            LEFT JOIN expense_categories ec ON e.category_id = ec.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.startDate) {
            query += " AND DATE(e.expense_date) >= DATE(?)";
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += " AND DATE(e.expense_date) <= DATE(?)";
            params.push(filters.endDate);
        }

        if (filters.category) {
            query += " AND e.category_id = ?";
            params.push(filters.category);
        }

        query += " ORDER BY e.expense_date DESC";

        return db.prepare(query).all(...params);
    }

    getExpenseSummary(filters = {}) {
        let query = `
            SELECT 
                COALESCE(SUM(CASE WHEN DATE(e.expense_date) = DATE('now') THEN e.amount ELSE 0 END), 0) as today,
                COALESCE(SUM(CASE WHEN strftime('%Y-%m', e.expense_date) = strftime('%Y-%m', 'now') THEN e.amount ELSE 0 END), 0) as monthly,
                COALESCE(SUM(CASE WHEN strftime('%Y', e.expense_date) = strftime('%Y', 'now') THEN e.amount ELSE 0 END), 0) as yearly
            FROM expenses e
            WHERE 1=1
        `;
        const params = [];

        if (filters.startDate) {
            query += " AND DATE(e.expense_date) >= DATE(?)";
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += " AND DATE(e.expense_date) <= DATE(?)";
            params.push(filters.endDate);
        }

        return db.prepare(query).get(...params);
    }

    getExpenseByCategory(filters = {}) {
        let query = `
            SELECT 
                ec.name as category,
                COALESCE(SUM(e.amount), 0) as value
            FROM expense_categories ec
            LEFT JOIN expenses e ON ec.id = e.category_id
            WHERE 1=1
        `;
        const params = [];

        if (filters.startDate) {
            query += " AND DATE(e.expense_date) >= DATE(?)";
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += " AND DATE(e.expense_date) <= DATE(?)";
            params.push(filters.endDate);
        }

        query += " GROUP BY ec.id ORDER BY value DESC";

        return db.prepare(query).all(...params);
    }

    // ============================================
    // WAREHOUSE REPORT
    // ============================================
    getWarehouseReport(filters = {}) {
        let query = `
            SELECT 
                w.id,
                w.name as warehouse,
                COUNT(DISTINCT i.product_id) as products,
                COALESCE(SUM(i.quantity), 0) as total_qty,
                COALESCE(SUM(i.quantity * p.purchase_price), 0) as inventory_value,
                COALESCE(SUM(CASE WHEN st.to_warehouse_id = w.id THEN st.quantity ELSE 0 END), 0) as incoming,
                COALESCE(SUM(CASE WHEN st.from_warehouse_id = w.id THEN st.quantity ELSE 0 END), 0) as outgoing
            FROM warehouses w
            LEFT JOIN inventory i ON w.id = i.warehouse_id
            LEFT JOIN products p ON i.product_id = p.id
            LEFT JOIN stock_transfers st ON w.id = st.to_warehouse_id OR w.id = st.from_warehouse_id
            WHERE 1=1
        `;
        const params = [];

        if (filters.search) {
            query += " AND w.name LIKE ?";
            params.push(`%${filters.search}%`);
        }

        query += " GROUP BY w.id ORDER BY w.name ASC";

        return db.prepare(query).all(...params);
    }

    getWarehouseSummary() {
        const query = `
            SELECT 
                COUNT(*) as total_warehouses,
                COUNT(DISTINCT i.product_id) as total_products,
                COALESCE(SUM(i.quantity), 0) as total_quantity,
                COALESCE(SUM(i.quantity * p.purchase_price), 0) as inventory_value
            FROM warehouses w
            LEFT JOIN inventory i ON w.id = i.warehouse_id
            LEFT JOIN products p ON i.product_id = p.id
            WHERE w.status = 'active'
        `;
        return db.prepare(query).get();
    }
}

module.exports = ReportsRepository;