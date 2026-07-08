// electron/services/dashboard.service.js
const dashboardRepository = require("../repositories/dashboard.repository")

class DashboardService {

  getDashboardData(startDate, endDate) {
    try {
      // 1. Fetch raw data
      const salesMetrics = dashboardRepository.getSalesMetrics(startDate, endDate);
      const totalExpenses = dashboardRepository.getTotalExpenses(startDate, endDate);
      const inventoryValue = dashboardRepository.getInventoryValue();
      const lowStockCount = dashboardRepository.getLowStockCount();
      const expiringBatchesCount = dashboardRepository.getExpiringBatchesCount();
      const ledgerSummary = dashboardRepository.getLedgerSummary();
      const topCustomers = dashboardRepository.getTopCustomers(startDate, endDate);
      const topProducts = dashboardRepository.getTopProducts(startDate, endDate);
      
      // 2. ✅ Call the updated Monthly Chart function
      const monthlyChartData = dashboardRepository.getMonthlyChartData(endDate);

      // 3. Calculate Profit Margins
      const revenue = salesMetrics.total_revenue;
      const cogs = salesMetrics.total_cogs;
      const expenses = totalExpenses.total_expenses;

      // 4. Compile final dashboard object
      return {
        success: true,
        data: {
          summary: {
            total_revenue: revenue,
            total_cogs: cogs,
            gross_profit: revenue - cogs,
            total_expenses: expenses,
            net_profit: (revenue - cogs) - expenses,
            total_sales_count: salesMetrics.total_sales_count
          },
          inventory: {
            total_purchase_value: inventoryValue.total_purchase_value,
            total_sale_value: inventoryValue.total_sale_value,
            total_products: inventoryValue.total_products_in_stock || 0,
            total_quantity: inventoryValue.total_physical_quantity || 0,
            low_stock_items: lowStockCount.count || 0,
            expiring_batches: expiringBatchesCount.count || 0
          },
          finance: {
            receivables: ledgerSummary.total_receivables || 0,
            payables: ledgerSummary.total_payables || 0
          },
          top_performers: {
            customers: topCustomers || [],
            products: topProducts || []
          },
          chart_data: monthlyChartData || [] // ✅ This now returns 6 months
        }
      };
    } catch (error) {
      console.error("Error generating dashboard data:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new DashboardService();