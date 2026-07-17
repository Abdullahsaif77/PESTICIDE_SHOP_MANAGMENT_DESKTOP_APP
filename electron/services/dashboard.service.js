// electron/services/dashboard.service.js

const dashboardRepository = require("../repositories/dashboard.repository");

class DashboardService {

  getDashboardData(startDate, endDate) {
    try {
      // 1. Fetch raw data
      const salesMetrics = dashboardRepository.getSalesMetrics(startDate, endDate);
      const totalExpenses = dashboardRepository.getTotalExpenses(startDate, endDate);
      const inventoryValue = dashboardRepository.getInventoryValue();
      const lowStockCount = dashboardRepository.getLowStockCount();
      const lowStockCountFromInventory = dashboardRepository.getLowStockCountFromInventory();
      const expiringBatchesCount = dashboardRepository.getExpiringBatchesCount();
      const ledgerSummary = dashboardRepository.getLedgerSummary();
      const totalCustomers = dashboardRepository.getTotalCustomers();
      const totalSuppliers = dashboardRepository.getTotalSuppliers();
      const categorySales = dashboardRepository.getCategorySales(startDate, endDate);
      const categoryPurchases = dashboardRepository.getCategoryPurchases(startDate, endDate);
      const topCustomers = dashboardRepository.getTopCustomers(startDate, endDate);
      const topProducts = dashboardRepository.getTopProducts(startDate, endDate);
      const monthlyChartData = dashboardRepository.getMonthlyChartData(endDate);

      // 2. Calculate Profit Margins
      const revenue = salesMetrics.total_revenue || 0;
      const cogs = salesMetrics.total_cogs || 0;
      const expenses = totalExpenses?.total_expenses || 0;

      // 3. Use the low stock count (try inventory table first, fallback to product table)
      const lowStockItems = lowStockCountFromInventory.count > 0 
        ? lowStockCountFromInventory.count 
        : lowStockCount.count;

      console.log('📊 Dashboard Data Summary:');
      console.log(`  - Total Revenue: ${revenue}`);
      console.log(`  - Total COGS: ${cogs}`);
      console.log(`  - Total Expenses: ${expenses}`);
      console.log(`  - Total Customers: ${totalCustomers.total}`);
      console.log(`  - Low Stock Items: ${lowStockItems}`);
      console.log(`  - Total Products in Stock: ${inventoryValue.total_products_in_stock}`);

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
            total_sales_count: salesMetrics.total_sales_count || 0,
            total_customers: totalCustomers.total || 0
          },
          inventory: {
            total_purchase_value: inventoryValue.total_purchase_value || 0,
            total_sale_value: inventoryValue.total_sale_value || 0,
            total_products: inventoryValue.total_products_in_stock || 0,
            total_quantity: inventoryValue.total_physical_quantity || 0,
            low_stock_items: lowStockItems,
            expiring_batches: expiringBatchesCount.count || 0
          },
          finance: {
            receivables: ledgerSummary?.total_receivables || 0,
            payables: ledgerSummary?.total_payables || 0,
            total_customers: totalCustomers.total || 0,
            total_suppliers: totalSuppliers.total || 0
          },
          category_sales: categorySales || [],
          category_purchases: categoryPurchases || [],
          top_performers: {
            customers: topCustomers || [],
            products: topProducts || []
          },
          chart_data: monthlyChartData || []
        }
      };
    } catch (error) {
      console.error("Error generating dashboard data:", error);
      return { 
        success: false, 
        error: error.message,
        data: {
          summary: { total_revenue: 0, total_cogs: 0, gross_profit: 0, total_expenses: 0, net_profit: 0, total_sales_count: 0, total_customers: 0 },
          inventory: { total_purchase_value: 0, total_sale_value: 0, total_products: 0, total_quantity: 0, low_stock_items: 0, expiring_batches: 0 },
          finance: { receivables: 0, payables: 0, total_customers: 0, total_suppliers: 0 },
          category_sales: [], category_purchases: [], top_performers: { customers: [], products: [] }, chart_data: []
        }
      };
    }
  }
}

module.exports = new DashboardService();