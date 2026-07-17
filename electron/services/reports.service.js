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
    // PROFIT & LOSS REPORT - FIXED ✅
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
    // CUSTOMER LEDGER REPORT - FIXED ✅
    // ============================================
    async getCustomerLedgerReport(filters = {}) {
        try {
            console.log('📊 [Service] getCustomerLedgerReport called with filters:', filters);
            
            // ✅ Get data from ledger table (real-time)
            const items = reportsRepo.getCustomerLedgerReport(filters);
            console.log(`📊 [Service] Found ${items.length} customer records`);
            
            // Calculate summary from actual data
            const totalCustomers = items.length;
            const totalDebit = items.reduce((sum, item) => sum + (item.total_purchases || 0), 0);
            const totalCredit = items.reduce((sum, item) => sum + (item.total_paid || 0), 0);
            const totalOutstanding = totalDebit - totalCredit;
            const totalBalance = items.reduce((sum, item) => sum + (item.closing_balance || 0), 0);
            
            return {
                success: true,
                data: {
                    items,
                    summary: {
                        totalCustomers,
                        totalOutstanding,
                        totalBalance,
                        totalDebit,
                        totalCredit,
                        netBalance: totalDebit - totalCredit
                    }
                }
            };
        } catch (error) {
            console.error("Error in getCustomerLedgerReport:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get customer ledger details with running balance
     * Matches what Ledger page uses - FIXED ✅
     */
    async getCustomerLedgerDetails(customerId, filters = {}) {
        try {
            console.log(`📊 [Service] getCustomerLedgerDetails called for customer ${customerId}`);
            
            // ✅ Get details from ledger table with running balance
            const items = reportsRepo.getCustomerLedgerDetails(customerId, filters);
            console.log(`📊 [Service] Found ${items.length} ledger entries`);
            
            // Calculate summary
            let totalDebit = 0;
            let totalCredit = 0;
            let openingBalance = 0;
            let closingBalance = 0;
            
            if (items.length > 0) {
                // Calculate totals from entries
                for (const entry of items) {
                    if (entry.type === 'debit') {
                        totalDebit += entry.amount;
                    } else if (entry.type === 'credit') {
                        totalCredit += entry.amount;
                    }
                }
                
                // Get opening balance (balance before first entry)
                const firstEntry = items[items.length - 1];
                if (firstEntry) {
                    const balanceBeforeFirst = firstEntry.calculated_balance - 
                        (firstEntry.type === 'debit' ? firstEntry.amount : -firstEntry.amount);
                    openingBalance = balanceBeforeFirst;
                }
                
                closingBalance = items[0]?.calculated_balance || 0;
            }
            
            return {
                success: true,
                data: {
                    entries: items,
                    summary: {
                        totalEntries: items.length,
                        totalDebit,
                        totalCredit,
                        netBalance: totalDebit - totalCredit,
                        openingBalance,
                        closingBalance
                    }
                }
            };
        } catch (error) {
            console.error("Error in getCustomerLedgerDetails:", error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // SUPPLIER LEDGER REPORT - FIXED ✅
    // ============================================
    async getSupplierLedgerReport(filters = {}) {
        try {
            console.log('📊 [Service] getSupplierLedgerReport called with filters:', filters);
            
            // ✅ Get data from ledger table (real-time)
            const items = reportsRepo.getSupplierLedgerReport(filters);
            console.log(`📊 [Service] Found ${items.length} supplier records`);
            
            // Calculate summary from actual data
            const totalSuppliers = items.length;
            const totalDebit = items.reduce((sum, item) => sum + (item.total_purchases || 0), 0);
            const totalCredit = items.reduce((sum, item) => sum + (item.payments_made || 0), 0);
            const totalPayable = totalDebit - totalCredit;
            const totalBalance = items.reduce((sum, item) => sum + (item.closing_balance || 0), 0);
            
            return {
                success: true,
                data: {
                    items,
                    summary: {
                        totalSuppliers,
                        totalPayable,
                        totalBalance,
                        totalDebit,
                        totalCredit,
                        netBalance: totalDebit - totalCredit
                    }
                }
            };
        } catch (error) {
            console.error("Error in getSupplierLedgerReport:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get supplier ledger details with running balance
     * Matches what Ledger page uses - FIXED ✅
     */
    async getSupplierLedgerDetails(supplierId, filters = {}) {
        try {
            console.log(`📊 [Service] getSupplierLedgerDetails called for supplier ${supplierId}`);
            
            // ✅ Get details from ledger table with running balance
            const items = reportsRepo.getSupplierLedgerDetails(supplierId, filters);
            console.log(`📊 [Service] Found ${items.length} ledger entries`);
            
            // Calculate summary
            let totalDebit = 0;
            let totalCredit = 0;
            let openingBalance = 0;
            let closingBalance = 0;
            
            if (items.length > 0) {
                // Calculate totals from entries
                for (const entry of items) {
                    if (entry.type === 'debit') {
                        totalDebit += entry.amount;
                    } else if (entry.type === 'credit') {
                        totalCredit += entry.amount;
                    }
                }
                
                // Get opening balance (balance before first entry)
                const firstEntry = items[items.length - 1];
                if (firstEntry) {
                    const balanceBeforeFirst = firstEntry.calculated_balance - 
                        (firstEntry.type === 'debit' ? firstEntry.amount : -firstEntry.amount);
                    openingBalance = balanceBeforeFirst;
                }
                
                closingBalance = items[0]?.calculated_balance || 0;
            }
            
            return {
                success: true,
                data: {
                    entries: items,
                    summary: {
                        totalEntries: items.length,
                        totalDebit,
                        totalCredit,
                        netBalance: totalDebit - totalCredit,
                        openingBalance,
                        closingBalance
                    }
                }
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
        console.log('📊 [Service] getWarehouseReport called with filters:', filters);
        
        const items = reportsRepo.getWarehouseReport(filters);
        const summary = reportsRepo.getWarehouseSummary();
        
        // ✅ Ensure items is always an array
        const safeItems = Array.isArray(items) ? items : [];
        console.log(`📊 [Service] Found ${safeItems.length} warehouse records`);
        
        // Calculate additional statistics
        const totalProducts = safeItems.reduce((sum, item) => sum + (item.products || 0), 0);
        const totalQuantity = safeItems.reduce((sum, item) => sum + (item.total_qty || 0), 0);
        const totalInventoryValue = safeItems.reduce((sum, item) => sum + (item.inventory_value || 0), 0);
        const totalPurchaseValue = safeItems.reduce((sum, item) => sum + (item.purchase_value || 0), 0);
        const totalPotentialProfit = safeItems.reduce((sum, item) => sum + (item.potential_profit || 0), 0);
        const totalLowStock = safeItems.reduce((sum, item) => sum + (item.low_stock_items || 0), 0);
        const totalOutOfStock = safeItems.reduce((sum, item) => sum + (item.out_of_stock_items || 0), 0);
        
        return {
            success: true,
            data: {
                items: safeItems,
                summary: {
                    totalWarehouses: safeItems.length,
                    totalProducts,
                    totalQuantity,
                    inventoryValue: totalInventoryValue,
                    purchaseValue: totalPurchaseValue,
                    potentialProfit: totalPotentialProfit,
                    lowStockItems: totalLowStock,
                    outOfStockItems: totalOutOfStock,
                    // Summary from the summary query
                    ...summary
                }
            }
        };
    } catch (error) {
        console.error("Error in getWarehouseReport:", error);
        return { 
            success: false, 
            error: error.message,
            data: {
                items: [],
                summary: {
                    totalWarehouses: 0,
                    totalProducts: 0,
                    totalQuantity: 0,
                    inventoryValue: 0,
                    purchaseValue: 0,
                    potentialProfit: 0,
                    lowStockItems: 0,
                    outOfStockItems: 0
                }
            }
        };
    }
}

}

module.exports = ReportsService;