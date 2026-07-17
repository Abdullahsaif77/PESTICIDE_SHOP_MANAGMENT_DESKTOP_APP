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
            WHERE s.status != 'cancelled'
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
            WHERE s.status != 'cancelled'
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
            WHERE s.status != 'cancelled'
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
            WHERE p.status != 'cancelled'
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
        // ✅ FIXED: Get total purchases directly from purchases table (no JOIN)
        const purchasesQuery = `
            SELECT COALESCE(SUM(total_amount), 0) as total_purchases
            FROM purchases
            WHERE status != 'cancelled'
            ${filters.startDate ? "AND DATE(purchase_date) >= DATE(?)" : ""}
            ${filters.endDate ? "AND DATE(purchase_date) <= DATE(?)" : ""}
        `;
        
        // ✅ Get total quantity and total cost from purchase_items
        const itemsQuery = `
            SELECT 
                COALESCE(SUM(pi.quantity), 0) as total_quantity,
                COALESCE(SUM(pi.purchase_price * pi.quantity), 0) as total_cost
            FROM purchase_items pi
            JOIN purchases p ON pi.purchase_id = p.id
            WHERE p.status != 'cancelled'
            ${filters.startDate ? "AND DATE(p.purchase_date) >= DATE(?)" : ""}
            ${filters.endDate ? "AND DATE(p.purchase_date) <= DATE(?)" : ""}
        `;
        
        // Build params for purchases query
        const purchaseParams = [];
        if (filters.startDate) purchaseParams.push(filters.startDate);
        if (filters.endDate) purchaseParams.push(filters.endDate);
        
        // Build params for items query
        const itemParams = [];
        if (filters.startDate) itemParams.push(filters.startDate);
        if (filters.endDate) itemParams.push(filters.endDate);
        
        const purchasesResult = db.prepare(purchasesQuery).get(...purchaseParams);
        const itemsResult = db.prepare(itemsQuery).get(...itemParams);
        
        return {
            total_purchases: purchasesResult.total_purchases || 0,
            total_quantity: itemsResult.total_quantity || 0,
            total_cost: itemsResult.total_cost || 0
        };
    }

    // ============================================
    // PROFIT & LOSS REPORT - COMPLETELY FIXED
    // ============================================
    
    // ✅ FIXED: Properly calculate revenue, cost, expenses, and profit using subqueries
    getProfitLossSummary(filters = {}) {
        // Build the query with separate subqueries for each metric
        const query = `
            SELECT 
                COALESCE((
                    SELECT SUM(total_amount) 
                    FROM sales 
                    WHERE status != 'cancelled'
                    ${filters.startDate ? "AND DATE(sale_date) >= DATE(?)" : ""}
                    ${filters.endDate ? "AND DATE(sale_date) <= DATE(?)" : ""}
                ), 0) as revenue,
                COALESCE((
                    SELECT SUM(si.purchase_price * si.quantity)
                    FROM sale_items si
                    JOIN sales s ON si.sale_id = s.id
                    WHERE s.status != 'cancelled'
                    ${filters.startDate ? "AND DATE(s.sale_date) >= DATE(?)" : ""}
                    ${filters.endDate ? "AND DATE(s.sale_date) <= DATE(?)" : ""}
                ), 0) as purchase_cost,
                COALESCE((
                    SELECT SUM(amount)
                    FROM expenses
                    WHERE 1=1
                    ${filters.startDate ? "AND DATE(expense_date) >= DATE(?)" : ""}
                    ${filters.endDate ? "AND DATE(expense_date) <= DATE(?)" : ""}
                ), 0) as expenses,
                -- Calculate net profit using the values above
                COALESCE((
                    SELECT SUM(total_amount) 
                    FROM sales 
                    WHERE status != 'cancelled'
                    ${filters.startDate ? "AND DATE(sale_date) >= DATE(?)" : ""}
                    ${filters.endDate ? "AND DATE(sale_date) <= DATE(?)" : ""}
                ), 0) 
                - COALESCE((
                    SELECT SUM(si.purchase_price * si.quantity)
                    FROM sale_items si
                    JOIN sales s ON si.sale_id = s.id
                    WHERE s.status != 'cancelled'
                    ${filters.startDate ? "AND DATE(s.sale_date) >= DATE(?)" : ""}
                    ${filters.endDate ? "AND DATE(s.sale_date) <= DATE(?)" : ""}
                ), 0) 
                - COALESCE((
                    SELECT SUM(amount)
                    FROM expenses
                    WHERE 1=1
                    ${filters.startDate ? "AND DATE(expense_date) >= DATE(?)" : ""}
                    ${filters.endDate ? "AND DATE(expense_date) <= DATE(?)" : ""}
                ), 0) as net_profit
        `;

        // Build the complete parameter array
        // Each subquery needs its own set of date params
        // Order: revenue, cost, expenses, net_profit_revenue, net_profit_cost, net_profit_expenses
        const params = [];
        
        // Revenue subquery params
        if (filters.startDate) params.push(filters.startDate);
        if (filters.endDate) params.push(filters.endDate);
        
        // Cost subquery params
        if (filters.startDate) params.push(filters.startDate);
        if (filters.endDate) params.push(filters.endDate);
        
        // Expenses subquery params
        if (filters.startDate) params.push(filters.startDate);
        if (filters.endDate) params.push(filters.endDate);
        
        // Net profit - revenue subquery params (appears again)
        if (filters.startDate) params.push(filters.startDate);
        if (filters.endDate) params.push(filters.endDate);
        
        // Net profit - cost subquery params (appears again)
        if (filters.startDate) params.push(filters.startDate);
        if (filters.endDate) params.push(filters.endDate);
        
        // Net profit - expenses subquery params (appears again)
        if (filters.startDate) params.push(filters.startDate);
        if (filters.endDate) params.push(filters.endDate);

        console.log('📊 P&L Summary - Params count:', params.length);
        console.log('📊 Params:', params);

        return db.prepare(query).get(...params);
    }

    // ✅ FIXED: Properly get profit timeline by month
    getProfitLossTimeline(filters = {}) {
        let query = `
            SELECT 
                strftime('%Y-%m', s.sale_date) as month,
                COALESCE(SUM(s.total_amount), 0) as revenue,
                COALESCE(SUM(si.purchase_price * si.quantity), 0) as cost,
                COALESCE((
                    SELECT SUM(amount)
                    FROM expenses e
                    WHERE strftime('%Y-%m', e.expense_date) = strftime('%Y-%m', s.sale_date)
                ), 0) as expenses,
                COALESCE(SUM(s.total_amount), 0) - COALESCE(SUM(si.purchase_price * si.quantity), 0) - COALESCE((
                    SELECT SUM(amount)
                    FROM expenses e
                    WHERE strftime('%Y-%m', e.expense_date) = strftime('%Y-%m', s.sale_date)
                ), 0) as profit
            FROM sales s
            LEFT JOIN sale_items si ON s.id = si.sale_id
            WHERE s.status != 'cancelled'
        `;
        
        const params = [];

        // Main sales date filters
        if (filters.startDate) {
            query += " AND DATE(s.sale_date) >= DATE(?)";
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += " AND DATE(s.sale_date) <= DATE(?)";
            params.push(filters.endDate);
        }

        query += " GROUP BY strftime('%Y-%m', s.sale_date) ORDER BY strftime('%Y-%m', s.sale_date) ASC";

        console.log('📊 P&L Timeline - Params count:', params.length);
        console.log('📊 Timeline Params:', params);

        return db.prepare(query).all(...params);
    }

    // ============================================
    // EXPENSE BY CATEGORY (Used for P&L breakdown)
    // ============================================
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
    // CUSTOMER LEDGER REPORT - FIXED ✅
    // ============================================
    getCustomerLedgerReport(filters = {}) {
        try {
            // ✅ Build query to get customer ledger summary from ledger table
            let query = `
                WITH customer_ledger_summary AS (
                    SELECT 
                        l.customer_id,
                        c.id as customer_id_alt,
                        c.name as customer_name,
                        c.phone,
                        c.email,
                        c.address,
                        c.is_active,
                        COALESCE(SUM(CASE WHEN l.entry_type = 'debit' THEN l.amount ELSE 0 END), 0) as total_debit,
                        COALESCE(SUM(CASE WHEN l.entry_type = 'credit' THEN l.amount ELSE 0 END), 0) as total_credit
                    FROM ledger l
                    INNER JOIN customers c ON c.id = l.customer_id
                    WHERE l.customer_id IS NOT NULL
            `;
            
            const params = [];
            
            if (filters.customerId) {
                query += ` AND l.customer_id = ?`;
                params.push(filters.customerId);
            }
            
            if (filters.startDate) {
                query += ` AND DATE(l.entry_date) >= DATE(?)`;
                params.push(filters.startDate);
            }
            
            if (filters.endDate) {
                query += ` AND DATE(l.entry_date) <= DATE(?)`;
                params.push(filters.endDate);
            }
            
            query += `
                    GROUP BY l.customer_id, c.id, c.name, c.phone, c.email, c.address, c.is_active
                )
                SELECT 
                    customer_id,
                    customer_name,
                    phone,
                    email,
                    address,
                    is_active,
                    total_debit as total_purchases,
                    total_credit as total_paid,
                    (total_debit - total_credit) as outstanding,
                    (total_debit - total_credit) as closing_balance
                FROM customer_ledger_summary
                WHERE is_active = 1 OR is_active IS NULL
                ORDER BY customer_name ASC
            `;
            
            const result = db.prepare(query).all(...params);
            console.log(`📊 [Repository] getCustomerLedgerReport returned ${result.length} customers`);
            return result;
        } catch (error) {
            console.error('❌ [Repository] Error in getCustomerLedgerReport:', error);
            return [];
        }
    }

    /**
     * Get customer ledger details with running balance (real-time from ledger)
     * This matches exactly what Ledger page uses
     */
    getCustomerLedgerDetails(customerId, filters = {}) {
        try {
            // First, get the opening balance (balance before the filter period)
            let openingBalanceQuery = `
                SELECT 
                    COALESCE(SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE 0 END), 0) -
                    COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END), 0) as opening_balance
                FROM ledger
                WHERE customer_id = ?
            `;
            
            const openingParams = [customerId];
            
            if (filters.startDate) {
                openingBalanceQuery += ` AND DATE(entry_date) < DATE(?)`;
                openingParams.push(filters.startDate);
            }
            
            const openingResult = db.prepare(openingBalanceQuery).get(...openingParams);
            const openingBalance = openingResult?.opening_balance || 0;
            
            // Now get the entries with running balance
            let query = `
                SELECT 
                    l.id,
                    l.entry_date as date,
                    l.entry_type as type,
                    l.description,
                    l.reference_type,
                    l.reference_id,
                    l.amount,
                    l.balance_after
                FROM ledger l
                WHERE l.customer_id = ?
            `;
            
            const params = [customerId];
            
            if (filters.startDate) {
                query += ` AND DATE(l.entry_date) >= DATE(?)`;
                params.push(filters.startDate);
            }
            
            if (filters.endDate) {
                query += ` AND DATE(l.entry_date) <= DATE(?)`;
                params.push(filters.endDate);
            }
            
            if (filters.reference_type) {
                query += ` AND l.reference_type = ?`;
                params.push(filters.reference_type);
            }
            
            query += `
                ORDER BY l.entry_date ASC, l.id ASC
            `;
            
            const entries = db.prepare(query).all(...params);
            
            // Calculate running balance for each entry
            let runningBalance = openingBalance;
            const result = entries.map(entry => {
                if (entry.type === 'debit') {
                    runningBalance += entry.amount;
                } else if (entry.type === 'credit') {
                    runningBalance -= entry.amount;
                }
                
                return {
                    ...entry,
                    calculated_balance: runningBalance
                };
            });
            
            // Return in DESC order for display (newest first)
            return result.reverse();
        } catch (error) {
            console.error('❌ [Repository] Error in getCustomerLedgerDetails:', error);
            return [];
        }
    }

    // ============================================
    // SUPPLIER LEDGER REPORT - FIXED ✅
    // ============================================
    getSupplierLedgerReport(filters = {}) {
        try {
            let query = `
                WITH supplier_ledger_summary AS (
                    SELECT 
                        l.supplier_id,
                        s.id as supplier_id_alt,
                        s.name as supplier_name,
                        s.phone,
                        s.email,
                        s.address,
                        s.is_active,
                        COALESCE(SUM(CASE WHEN l.entry_type = 'debit' THEN l.amount ELSE 0 END), 0) as total_debit,
                        COALESCE(SUM(CASE WHEN l.entry_type = 'credit' THEN l.amount ELSE 0 END), 0) as total_credit
                    FROM ledger l
                    INNER JOIN suppliers s ON s.id = l.supplier_id
                    WHERE l.supplier_id IS NOT NULL
            `;
            
            const params = [];
            
            if (filters.supplierId) {
                query += ` AND l.supplier_id = ?`;
                params.push(filters.supplierId);
            }
            
            if (filters.startDate) {
                query += ` AND DATE(l.entry_date) >= DATE(?)`;
                params.push(filters.startDate);
            }
            
            if (filters.endDate) {
                query += ` AND DATE(l.entry_date) <= DATE(?)`;
                params.push(filters.endDate);
            }
            
            query += `
                    GROUP BY l.supplier_id, s.id, s.name, s.phone, s.email, s.address, s.is_active
                )
                SELECT 
                    supplier_id,
                    supplier_name,
                    phone,
                    email,
                    address,
                    is_active,
                    total_debit as total_purchases,
                    total_credit as payments_made,
                    (total_debit - total_credit) as payable,
                    (total_debit - total_credit) as closing_balance
                FROM supplier_ledger_summary
                WHERE is_active = 1 OR is_active IS NULL
                ORDER BY supplier_name ASC
            `;
            
            const result = db.prepare(query).all(...params);
            console.log(`📊 [Repository] getSupplierLedgerReport returned ${result.length} suppliers`);
            return result;
        } catch (error) {
            console.error('❌ [Repository] Error in getSupplierLedgerReport:', error);
            return [];
        }
    }

    /**
     * Get supplier ledger details with running balance
     */
    getSupplierLedgerDetails(supplierId, filters = {}) {
        try {
            let openingBalanceQuery = `
                SELECT 
                    COALESCE(SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE 0 END), 0) -
                    COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END), 0) as opening_balance
                FROM ledger
                WHERE supplier_id = ?
            `;
            
            const openingParams = [supplierId];
            
            if (filters.startDate) {
                openingBalanceQuery += ` AND DATE(entry_date) < DATE(?)`;
                openingParams.push(filters.startDate);
            }
            
            const openingResult = db.prepare(openingBalanceQuery).get(...openingParams);
            const openingBalance = openingResult?.opening_balance || 0;
            
            let query = `
                SELECT 
                    l.id,
                    l.entry_date as date,
                    l.entry_type as type,
                    l.description,
                    l.reference_type,
                    l.reference_id,
                    l.amount,
                    l.balance_after
                FROM ledger l
                WHERE l.supplier_id = ?
            `;
            
            const params = [supplierId];
            
            if (filters.startDate) {
                query += ` AND DATE(l.entry_date) >= DATE(?)`;
                params.push(filters.startDate);
            }
            
            if (filters.endDate) {
                query += ` AND DATE(l.entry_date) <= DATE(?)`;
                params.push(filters.endDate);
            }
            
            if (filters.reference_type) {
                query += ` AND l.reference_type = ?`;
                params.push(filters.reference_type);
            }
            
            query += `
                ORDER BY l.entry_date ASC, l.id ASC
            `;
            
            const entries = db.prepare(query).all(...params);
            
            let runningBalance = openingBalance;
            const result = entries.map(entry => {
                if (entry.type === 'debit') {
                    runningBalance += entry.amount;
                } else if (entry.type === 'credit') {
                    runningBalance -= entry.amount;
                }
                
                return {
                    ...entry,
                    calculated_balance: runningBalance
                };
            });
            
            return result.reverse();
        } catch (error) {
            console.error('❌ [Repository] Error in getSupplierLedgerDetails:', error);
            return [];
        }
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

    // ============================================
    // WAREHOUSE REPORT
    // ============================================
   getWarehouseReport(filters = {}) {
    try {
        let query = `
            SELECT 
                w.id,
                w.name as warehouse,
                w.location,
                w.status,
                COUNT(DISTINCT i.product_id) as products,
                COALESCE(SUM(i.quantity), 0) as total_qty,
                -- ✅ Use sale_price instead of purchase_price for inventory value
                COALESCE(SUM(i.quantity * p.sale_price), 0) as inventory_value,
                COALESCE(SUM(i.quantity * p.purchase_price), 0) as purchase_value,
                -- Calculate potential profit
                COALESCE(SUM(i.quantity * (p.sale_price - p.purchase_price)), 0) as potential_profit,
                -- Count low stock items
                COUNT(DISTINCT CASE WHEN i.quantity <= p.reorder_level AND i.quantity > 0 THEN p.id END) as low_stock_items,
                -- Count out of stock items
                COUNT(DISTINCT CASE WHEN i.quantity <= 0 THEN p.id END) as out_of_stock_items
            FROM warehouses w
            LEFT JOIN inventory i ON w.id = i.warehouse_id
            LEFT JOIN products p ON i.product_id = p.id
            WHERE w.status = 'active'
        `;
        
        const params = [];

        if (filters.search) {
            query += " AND (w.name LIKE ? OR w.location LIKE ?)";
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        // ✅ Only include warehouses that actually have inventory
        // If we want to show all warehouses including empty ones, remove this line
        // query += " AND i.quantity > 0";

        query += " GROUP BY w.id, w.name, w.location, w.status ORDER BY w.name ASC";

        const result = db.prepare(query).all(...params);
        console.log(`📊 [Repository] getWarehouseReport returned ${result.length} warehouses`);
        return result;
    } catch (error) {
        console.error('❌ [Repository] Error in getWarehouseReport:', error);
        return [];
    }
}

getWarehouseSummary() {
    try {
        const query = `
            SELECT 
                COUNT(DISTINCT w.id) as total_warehouses,
                COUNT(DISTINCT i.product_id) as total_products,
                COALESCE(SUM(i.quantity), 0) as total_quantity,
                -- ✅ Use sale_price instead of purchase_price
                COALESCE(SUM(i.quantity * p.sale_price), 0) as inventory_value,
                COALESCE(SUM(i.quantity * p.purchase_price), 0) as purchase_value,
                -- ✅ Calculate potential profit
                COALESCE(SUM(i.quantity * (p.sale_price - p.purchase_price)), 0) as potential_profit,
                COUNT(DISTINCT CASE WHEN i.quantity <= p.reorder_level AND i.quantity > 0 THEN p.id END) as low_stock_items,
                COUNT(DISTINCT CASE WHEN i.quantity <= 0 THEN p.id END) as out_of_stock_items
            FROM warehouses w
            LEFT JOIN inventory i ON w.id = i.warehouse_id
            LEFT JOIN products p ON i.product_id = p.id
            WHERE w.status = 'active'
        `;
        
        const result = db.prepare(query).get();
        return result || {
            total_warehouses: 0,
            total_products: 0,
            total_quantity: 0,
            inventory_value: 0,
            purchase_value: 0,
            potential_profit: 0,
            low_stock_items: 0,
            out_of_stock_items: 0
        };
    } catch (error) {
        console.error('❌ [Repository] Error in getWarehouseSummary:', error);
        return {
            total_warehouses: 0,
            total_products: 0,
            total_quantity: 0,
            inventory_value: 0,
            purchase_value: 0,
            potential_profit: 0,
            low_stock_items: 0,
            out_of_stock_items: 0
        };
    }
}
}

module.exports = ReportsRepository;