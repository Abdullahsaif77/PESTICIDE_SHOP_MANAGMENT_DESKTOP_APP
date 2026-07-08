// electron/database/repositories/dashboard.repository.js
const db = require("../database/database");

class DashboardRepository {
  
  getSalesMetrics(startDate, endDate) {
    const query = `
      SELECT 
        COALESCE(SUM(s.total_amount), 0) as total_revenue,
        COALESCE(SUM(si.purchase_price * si.quantity), 0) as total_cogs,
        COUNT(DISTINCT s.id) as total_sales_count
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE s.status != 'cancelled'
      AND DATE(s.sale_date) BETWEEN DATE(?) AND DATE(?)
    `;
    return db.prepare(query).get(startDate, endDate);
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

  // ✅ UPDATED: Now safely returns grouped by Month
  getMonthlyChartData(endDate) {
    const query = `
      SELECT 
        strftime('%Y-%m', s.sale_date) as month,
        COALESCE(SUM(s.total_amount), 0) as revenue,
        COALESCE(SUM(si.purchase_price * si.quantity), 0) as cogs,
        (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE strftime('%Y-%m', expense_date) = strftime('%Y-%m', s.sale_date)) as expenses
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE s.status != 'cancelled'
      AND DATE(s.sale_date) >= DATE(?, '-6 months')
      GROUP BY strftime('%Y-%m', s.sale_date)
      ORDER BY month ASC
    `;
    return db.prepare(query).all(endDate);
  }
}

module.exports = new DashboardRepository();