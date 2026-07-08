// electron/services/reports.service.js
const ReportsRepository = require("../repositories/reports.repository");
const reportsRepo = new ReportsRepository();

class ReportsService {
    // ============================================
    // SALES REPORT
    // ============================================
    async getSalesReport(filters = {}) {
        try {
            const page = parseInt(filters.page) || 1;
            const pageSize = parseInt(filters.pageSize) || 10;
            const offset = (page - 1) * pageSize;

            const items = reportsRepo.getSalesReport({
                ...filters,
                limit: pageSize,
                offset: offset
            });

            const summary = reportsRepo.getSalesSummary(filters);
            const chartData = reportsRepo.getSalesChartData(filters);

            return {
                success: true,
                data: {
                    summary,
                    items,
                    chartData,
                    total: items.length
                }
            };
        } catch (error) {
            console.error("Error in getSalesReport:", error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // PURCHASE REPORT
    // ============================================
    async getPurchaseReport(filters = {}) {
        try {
            const page = parseInt(filters.page) || 1;
            const pageSize = parseInt(filters.pageSize) || 10;
            const offset = (page - 1) * pageSize;

            const items = reportsRepo.getPurchaseReport({
                ...filters,
                limit: pageSize,
                offset: offset
            });

            const summary = reportsRepo.getPurchaseSummary(filters);

            return {
                success: true,
                data: {
                    summary,
                    items,
                    total: items.length
                }
            };
        } catch (error) {
            console.error("Error in getPurchaseReport:", error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // PROFIT & LOSS REPORT
    // ============================================
    async getProfitLossReport(filters = {}) {
        try {
            const summary = reportsRepo.getProfitLossSummary(filters);
            const chartData = reportsRepo.getProfitLossTimeline(filters);
            const breakdown = reportsRepo.getExpenseByCategory(filters);

            // Calculate today, week, month, year profit
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            const yearAgo = new Date(today);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);

            const todayProfit = reportsRepo.getProfitLossSummary({ startDate: todayStr, endDate: todayStr });
            const weekProfit = reportsRepo.getProfitLossSummary({ startDate: weekAgo.toISOString().split('T')[0], endDate: todayStr });
            const monthProfit = reportsRepo.getProfitLossSummary({ startDate: monthAgo.toISOString().split('T')[0], endDate: todayStr });
            const yearProfit = reportsRepo.getProfitLossSummary({ startDate: yearAgo.toISOString().split('T')[0], endDate: todayStr });

            return {
                success: true,
                data: {
                    summary: {
                        ...summary,
                        todayProfit: todayProfit.net_profit || 0,
                        weekProfit: weekProfit.net_profit || 0,
                        monthProfit: monthProfit.net_profit || 0,
                        yearProfit: yearProfit.net_profit || 0
                    },
                    chartData,
                    breakdown
                }
            };
        } catch (error) {
            console.error("Error in getProfitLossReport:", error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // INVENTORY REPORT
    // ============================================
    async getInventoryReport(filters = {}) {
        try {
            const page = parseInt(filters.page) || 1;
            const pageSize = parseInt(filters.pageSize) || 10;
            const offset = (page - 1) * pageSize;

            const items = reportsRepo.getInventoryReport({
                ...filters,
                limit: pageSize,
                offset: offset
            });

            const summary = reportsRepo.getInventorySummary();

            return {
                success: true,
                data: {
                    summary,
                    items,
                    total: items.length
                }
            };
        } catch (error) {
            console.error("Error in getInventoryReport:", error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // LOW STOCK REPORT
    // ============================================
    async getLowStockReport(filters = {}) {
        try {
            const items = reportsRepo.getLowStockReport(filters);
            return {
                success: true,
                data: items
            };
        } catch (error) {
            console.error("Error in getLowStockReport:", error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // EXPIRY REPORT
    // ============================================
    async getExpiryReport(filters = {}) {
        try {
            const items = reportsRepo.getExpiryReport(filters);
            const summary = reportsRepo.getExpirySummary();
            return {
                success: true,
                data: {
                    summary,
                    items
                }
            };
        } catch (error) {
            console.error("Error in getExpiryReport:", error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // CUSTOMER LEDGER REPORT
    // ============================================
    async getCustomerLedgerReport(filters = {}) {
        try {
            const items = reportsRepo.getCustomerLedgerReport(filters);
            const summary = {
                totalCustomers: items.length,
                totalOutstanding: items.reduce((sum, item) => sum + item.outstanding, 0),
                totalBalance: items.reduce((sum, item) => sum + item.closing_balance, 0)
            };
            return {
                success: true,
                data: {
                    summary,
                    items
                }
            };
        } catch (error) {
            console.error("Error in getCustomerLedgerReport:", error);
            return { success: false, error: error.message };
        }
    }

    async getCustomerLedgerDetails(customerId) {
        try {
            const items = reportsRepo.getCustomerLedgerDetails(customerId);
            return {
                success: true,
                data: items
            };
        } catch (error) {
            console.error("Error in getCustomerLedgerDetails:", error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // SUPPLIER LEDGER REPORT
    // ============================================
    async getSupplierLedgerReport(filters = {}) {
        try {
            const items = reportsRepo.getSupplierLedgerReport(filters);
            const summary = {
                totalSuppliers: items.length,
                totalPayable: items.reduce((sum, item) => sum + item.payable, 0),
                totalBalance: items.reduce((sum, item) => sum + item.closing_balance, 0)
            };
            return {
                success: true,
                data: {
                    summary,
                    items
                }
            };
        } catch (error) {
            console.error("Error in getSupplierLedgerReport:", error);
            return { success: false, error: error.message };
        }
    }

    async getSupplierLedgerDetails(supplierId) {
        try {
            const items = reportsRepo.getSupplierLedgerDetails(supplierId);
            return {
                success: true,
                data: items
            };
        } catch (error) {
            console.error("Error in getSupplierLedgerDetails:", error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // EXPENSE REPORT
    // ============================================
    async getExpenseReport(filters = {}) {
        try {
            const items = reportsRepo.getExpenseReport(filters);
            const summary = reportsRepo.getExpenseSummary(filters);
            const breakdown = reportsRepo.getExpenseByCategory(filters);
            const chartData = items.map(item => ({
                month: item.date ? item.date.substring(0, 7) : '',
                amount: item.amount
            }));

            // Aggregate chart data by month
            const chartMap = {};
            chartData.forEach(item => {
                if (item.month) {
                    chartMap[item.month] = (chartMap[item.month] || 0) + item.amount;
                }
            });
            const aggregatedChartData = Object.keys(chartMap).map(month => ({
                month,
                amount: chartMap[month]
            }));

            return {
                success: true,
                data: {
                    summary,
                    chartData: aggregatedChartData,
                    breakdown,
                    items
                }
            };
        } catch (error) {
            console.error("Error in getExpenseReport:", error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // WAREHOUSE REPORT
    // ============================================
    async getWarehouseReport(filters = {}) {
        try {
            const items = reportsRepo.getWarehouseReport(filters);
            const summary = reportsRepo.getWarehouseSummary();
            return {
                success: true,
                data: {
                    summary,
                    items
                }
            };
        } catch (error) {
            console.error("Error in getWarehouseReport:", error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = ReportsService;