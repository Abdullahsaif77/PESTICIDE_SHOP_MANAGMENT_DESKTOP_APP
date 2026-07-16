// electron/repositories/dashboard.repository.js

const db = require("../database/database");

class DashboardRepository {
  
  // ✅ FIXED: No JOIN - direct from sales table
  getSalesMetrics(startDate, endDate) {
    // Get total revenue directly from sales table
    const revenueQuery = `
      SELECT COALESCE(SUM(total_amount), 0) as total_revenue,
             COUNT(id) as total_sales_count
      FROM sales
      WHERE status != 'cancelled'
      AND DATE(sale_date) BETWEEN DATE(?) AND DATE(?)
    `;
    const revenueResult = db.prepare(revenueQuery).get(startDate, endDate);
    
    // Get COGS from sale_items (needs join to filter by date)
    const cogsQuery = `
      SELECT COALESCE(SUM(si.purchase_price * si.quantity), 0) as total_cogs
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE s.status != 'cancelled'
      AND DATE(s.sale_date) BETWEEN DATE(?) AND DATE(?)
    `;
    const cogsResult = db.prepare(cogsQuery).get(startDate, endDate);
    
    return {
      total_revenue: revenueResult.total_revenue,
      total_cogs: cogsResult.total_cogs,
      total_sales_count: revenueResult.total_sales_count
    };
  }

  getTotalExpenses(startDate, endDate) {
    const query = `
      SELECT COALESCE(SUM(amount), 0) as total_expenses
      FROM expenses
      WHERE DATE(expense_date) BETWEEN DATE(?) AND DATE(?)
    `;
    return db.prepare(query).get(startDate, endDate);
  }

  getInventoryValue() {
    const query = `
      SELECT 
        COALESCE(SUM(i.quantity * p.purchase_price), 0) as total_purchase_value,
        COALESCE(SUM(i.quantity * p.sale_price), 0) as total_sale_value,
        COUNT(DISTINCT i.product_id) as total_products_in_stock,
        SUM(i.quantity) as total_physical_quantity
      FROM inventory i
      LEFT JOIN products p ON i.product_id = p.id
      WHERE i.quantity > 0
    `;
    return db.prepare(query).get();
  }

  getLowStockCount() {
    const query = `
      SELECT COUNT(*) as count
      FROM inventory i
      LEFT JOIN products p ON i.product_id = p.id
      WHERE (i.quantity - i.reserved_quantity) <= p.reorder_level
      AND p.reorder_level > 0 AND i.quantity > 0
    `;
    return db.prepare(query).get();
  }

  getExpiringBatchesCount() {
    const query = `
      SELECT COUNT(*) as count
      FROM batches 
      WHERE expiry_date IS NOT NULL 
      AND expiry_date <= date('now', '+30 days')
      AND expiry_date >= date('now')
      AND is_active = 1
    `;
    return db.prepare(query).get();
  }

  getLedgerSummary() {
    const query = `
      SELECT 
        COALESCE(SUM(CASE WHEN entry_type = 'debit' AND customer_id IS NOT NULL THEN amount ELSE 0 END), 0) as total_receivables,
        COALESCE(SUM(CASE WHEN entry_type = 'debit' AND supplier_id IS NOT NULL THEN amount ELSE 0 END), 0) as total_payables
      FROM ledger
    `;
    return db.prepare(query).get();
  }

  getTotalCustomers() {
    const query = `
      SELECT COUNT(*) as total
      FROM customers
      WHERE is_active = 1
    `;
    return db.prepare(query).get();
  }

  getCategorySales(startDate, endDate) {
    const query = `
      SELECT 
        c.name,
        COALESCE(SUM(si.total), 0) as value
      FROM sale_items si
      LEFT JOIN products p ON si.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sales s ON si.sale_id = s.id
      WHERE s.status != 'cancelled'
      AND DATE(s.sale_date) BETWEEN DATE(?) AND DATE(?)
      AND c.name IS NOT NULL
      GROUP BY c.id
      ORDER BY value DESC
      LIMIT 5
    `;
    return db.prepare(query).all(startDate, endDate);
  }

  getCategoryPurchases(startDate, endDate) {
    const query = `
      SELECT 
        c.name,
        COALESCE(SUM(pi.total), 0) as value
      FROM purchase_items pi
      LEFT JOIN products p ON pi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN purchases pu ON pi.purchase_id = pu.id
      WHERE pu.status != 'cancelled'
      AND DATE(pu.purchase_date) BETWEEN DATE(?) AND DATE(?)
      AND c.name IS NOT NULL
      GROUP BY c.id
      ORDER BY value DESC
      LIMIT 5
    `;
    return db.prepare(query).all(startDate, endDate);
  }

  getTopCustomers(startDate, endDate) {
    const query = `
      SELECT 
        c.id, c.name, 
        SUM(s.total_amount) as total_spent,
        COUNT(s.id) as sale_count
      FROM customers c
      LEFT JOIN sales s ON c.id = s.customer_id AND s.status != 'cancelled'
      WHERE c.is_active = 1
      AND DATE(s.sale_date) BETWEEN DATE(?) AND DATE(?)
      GROUP BY c.id
      ORDER BY total_spent DESC
      LIMIT 5
    `;
    return db.prepare(query).all(startDate, endDate);
  }

  getTopProducts(startDate, endDate) {
    const query = `
      SELECT 
        p.id, p.name, 
        SUM(si.quantity) as total_qty_sold,
        SUM(si.total) as total_revenue
      FROM sale_items si
      LEFT JOIN products p ON si.product_id = p.id
      LEFT JOIN sales s ON si.sale_id = s.id
      WHERE s.status != 'cancelled'
      AND DATE(s.sale_date) BETWEEN DATE(?) AND DATE(?)
      GROUP BY p.id
      ORDER BY total_qty_sold DESC
      LIMIT 5
    `;
    return db.prepare(query).all(startDate, endDate);
  }

  // ✅ FIXED: Monthly chart data - also needs to avoid JOIN duplication
  getMonthlyChartData(endDate) {
    // Get revenue per month from sales table (no JOIN needed)
    const revenueQuery = `
      SELECT 
        strftime('%Y-%m', sale_date) as month,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM sales
      WHERE status != 'cancelled'
      AND DATE(sale_date) >= DATE(?, '-6 months')
      GROUP BY strftime('%Y-%m', sale_date)
    `;
    const revenueData = db.prepare(revenueQuery).all(endDate);
    
    // Get COGS per month from sale_items
    const cogsQuery = `
      SELECT 
        strftime('%Y-%m', s.sale_date) as month,
        COALESCE(SUM(si.purchase_price * si.quantity), 0) as cogs
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE s.status != 'cancelled'
      AND DATE(s.sale_date) >= DATE(?, '-6 months')
      GROUP BY strftime('%Y-%m', s.sale_date)
    `;
    const cogsData = db.prepare(cogsQuery).all(endDate);
    
    // Get expenses per month
    const expensesQuery = `
      SELECT 
        strftime('%Y-%m', expense_date) as month,
        COALESCE(SUM(amount), 0) as expenses
      FROM expenses
      WHERE DATE(expense_date) >= DATE(?, '-6 months')
      GROUP BY strftime('%Y-%m', expense_date)
    `;
    const expensesData = db.prepare(expensesQuery).all(endDate);
    
    // Combine results
    const monthMap = {};
    
    revenueData.forEach(item => {
      monthMap[item.month] = { ...monthMap[item.month], month: item.month, revenue: item.revenue };
    });
    
    cogsData.forEach(item => {
      monthMap[item.month] = { ...monthMap[item.month], cogs: item.cogs };
    });
    
    expensesData.forEach(item => {
      monthMap[item.month] = { ...monthMap[item.month], expenses: item.expenses };
    });
    
    // Convert to array and ensure all months have values
    const result = Object.values(monthMap).map(item => ({
      month: item.month,
      revenue: item.revenue || 0,
      cogs: item.cogs || 0,
      expenses: item.expenses || 0
    }));
    
    // Sort by month
    result.sort((a, b) => a.month.localeCompare(b.month));
    
    return result;
  }
}

module.exports = new DashboardRepository();