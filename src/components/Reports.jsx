// src/pages/Reports/index.jsx
import React, { useState, useEffect } from 'react';
import {
  FileText, TrendingUp, TrendingDown, Package, AlertCircle,
  Calendar, Users, Handshake, CreditCard, Warehouse,
  BarChart3, PieChart, Download, Printer, FileSpreadsheet,
  DollarSign, ShoppingCart, Box, Clock, LayoutDashboard,
  ArrowRight, ChevronRight, Sparkles, Zap, Award,
  Target, TrendingUp as TrendIcon, Globe, Briefcase, Search, X, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const api = window.api || {};

const reportCards = [
  {
    id: 'sales',
    title: 'Sales Report',
    description: 'View sales analytics, revenue, and profit',
    icon: TrendingUp,
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    gradient: 'from-emerald-50 to-emerald-100/50',
    borderColor: 'border-emerald-200',
    apiKey: 'sales'
  },
  {
    id: 'purchases',
    title: 'Purchase Report',
    description: 'Track purchase history and costs',
    icon: ShoppingCart,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    gradient: 'from-blue-50 to-blue-100/50',
    borderColor: 'border-blue-200',
    apiKey: 'purchases'
  },
  {
    id: 'profit-loss',
    title: 'Profit & Loss',
    description: 'Revenue, costs, and net profit analysis',
    icon: DollarSign,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    gradient: 'from-purple-50 to-purple-100/50',
    borderColor: 'border-purple-200',
    apiKey: 'profit'
  },
  {
    id: 'inventory',
    title: 'Inventory Report',
    description: 'Current stock, value, and potential profit',
    icon: Package,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    gradient: 'from-amber-50 to-amber-100/50',
    borderColor: 'border-amber-200',
    apiKey: 'inventory'
  },
  {
    id: 'low-stock',
    title: 'Low Stock Report',
    description: 'Products below minimum stock levels',
    icon: AlertCircle,
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
    gradient: 'from-red-50 to-red-100/50',
    borderColor: 'border-red-200',
    apiKey: 'lowStock'
  },
  {
    id: 'expiry',
    title: 'Expiry Report',
    description: 'Track product expiry dates',
    icon: Clock,
    color: 'from-rose-500 to-rose-600',
    bgColor: 'bg-rose-50',
    iconColor: 'text-rose-600',
    gradient: 'from-rose-50 to-rose-100/50',
    borderColor: 'border-rose-200',
    apiKey: 'expiry'
  },
  {
    id: 'customer-ledger',
    title: 'Customer Ledger',
    description: 'Customer balances and transaction history',
    icon: Users,
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    gradient: 'from-indigo-50 to-indigo-100/50',
    borderColor: 'border-indigo-200',
    apiKey: 'customers'
  },
  {
    id: 'supplier-ledger',
    title: 'Supplier Ledger',
    description: 'Supplier balances and payment history',
    icon: Handshake,
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50',
    iconColor: 'text-teal-600',
    gradient: 'from-teal-50 to-teal-100/50',
    borderColor: 'border-teal-200',
    apiKey: 'suppliers'
  },
  {
    id: 'expenses',
    title: 'Expense Report',
    description: 'Expense breakdown by category',
    icon: CreditCard,
    color: 'from-rose-500 to-rose-600',
    bgColor: 'bg-rose-50',
    iconColor: 'text-rose-600',
    gradient: 'from-rose-50 to-rose-100/50',
    borderColor: 'border-rose-200',
    apiKey: 'expenses'
  },
  {
    id: 'warehouse',
    title: 'Warehouse Report',
    description: 'Stock distribution across warehouses',
    icon: Warehouse,
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    gradient: 'from-cyan-50 to-cyan-100/50',
    borderColor: 'border-cyan-200',
    apiKey: 'warehouse'
  }
];

export default function Reports({ setActiveTab }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredReports, setFilteredReports] = useState(reportCards);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    totalSales: 0,
    totalPurchases: 0,
    netProfit: 0,
    expenses: 0,
    inventoryValue: 0,
    customers: 0,
    suppliers: 0,
    products: 0
  });
  const [reportStats, setReportStats] = useState({});

  useEffect(() => {
    fetchSummaryData();
    fetchReportStats();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredReports(reportCards);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredReports(
        reportCards.filter(
          report => 
            report.title.toLowerCase().includes(query) ||
            report.description.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery]);

  const fetchSummaryData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from multiple APIs to get real numbers
      const [salesResult, purchasesResult, expenseResult, customerResult, supplierResult, productResult, inventoryResult] = await Promise.all([
        api.getSalesReport({ limit: 1 }),
        api.getPurchaseReport({ limit: 1 }),
        api.getTotalExpenses(),
        api.getAllCustomers({}),
        api.getAllSuppliers({}),
        api.getProducts(),
        api.getInventorySummary()
      ]);

      // Calculate total sales
      let totalSales = 0;
      if (salesResult?.success && salesResult.data?.summary) {
        totalSales = salesResult.data.summary.total_sales || 0;
      }

      // Calculate total purchases
      let totalPurchases = 0;
      if (purchasesResult?.success && purchasesResult.data?.summary) {
        totalPurchases = purchasesResult.data.summary.total_purchases || 0;
      }

      // Calculate expenses
      let expenses = 0;
      if (expenseResult && !expenseResult.error) {
        expenses = expenseResult.total || 0;
      }

      // Calculate customers
      let customers = 0;
      if (customerResult && !customerResult.error) {
        customers = Array.isArray(customerResult) ? customerResult.length : 
                    customerResult.data?.length || 0;
      }

      // Calculate suppliers
      let suppliers = 0;
      if (supplierResult && !supplierResult.error) {
        suppliers = Array.isArray(supplierResult) ? supplierResult.length :
                    supplierResult.data?.length || 0;
      }

      // Calculate products
      let products = 0;
      if (productResult && !productResult.error) {
        products = Array.isArray(productResult) ? productResult.length :
                   productResult.data?.length || 0;
      }

      // Calculate inventory value
      let inventoryValue = 0;
      if (inventoryResult && !inventoryResult.error) {
        inventoryValue = inventoryResult.total_value || 0;
      }

      // Calculate net profit (Sales - Purchases - Expenses)
      const netProfit = totalSales - totalPurchases - expenses;

      setSummaryData({
        totalSales,
        totalPurchases,
        netProfit,
        expenses,
        inventoryValue,
        customers,
        suppliers,
        products
      });
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportStats = async () => {
    try {
      const stats = {};
      
      // Sales count
      const salesResult = await api.getSalesReport({ limit: 1 });
      if (salesResult?.success) {
        stats.sales = salesResult.data?.total || salesResult.data?.items?.length || 0;
      }

      // Purchases count
      const purchasesResult = await api.getPurchaseReport({ limit: 1 });
      if (purchasesResult?.success) {
        stats.purchases = purchasesResult.data?.total || purchasesResult.data?.items?.length || 0;
      }

      // Customers count
      const customersResult = await api.getAllCustomers({});
      if (customersResult && !customersResult.error) {
        stats.customers = Array.isArray(customersResult) ? customersResult.length : 
                          customersResult.data?.length || 0;
      }

      // Suppliers count
      const suppliersResult = await api.getAllSuppliers({});
      if (suppliersResult && !suppliersResult.error) {
        stats.suppliers = Array.isArray(suppliersResult) ? suppliersResult.length :
                          suppliersResult.data?.length || 0;
      }

      // Products count
      const productsResult = await api.getProducts();
      if (productsResult && !productsResult.error) {
        stats.products = Array.isArray(productsResult) ? productsResult.length :
                         productsResult.data?.length || 0;
      }

      // Expenses count
      const expenseResult = await api.getExpenses(1, 0);
      if (expenseResult && !expenseResult.error) {
        stats.expenses = Array.isArray(expenseResult) ? expenseResult.length :
                         expenseResult.data?.length || 0;
      }

      // Inventory count
      const inventoryResult = await api.getInventorySummary();
      if (inventoryResult && !inventoryResult.error) {
        stats.inventory = inventoryResult.total_products || 0;
      }

      // Low stock count
      const lowStockResult = await api.getLowStockReport();
      if (lowStockResult && !lowStockResult.error) {
        stats.lowStock = Array.isArray(lowStockResult) ? lowStockResult.length :
                         lowStockResult.data?.length || 0;
      }

      // Expiry count
      const expiryResult = await api.getExpiryReport();
      if (expiryResult && !expiryResult.error) {
        stats.expiry = expiryResult.data?.items?.length || 0;
      }

      // Warehouse count
      const warehouseResult = await api.getActiveOnlyWarehouses();
      if (warehouseResult && !warehouseResult.error) {
        stats.warehouse = Array.isArray(warehouseResult) ? warehouseResult.length :
                          warehouseResult.data?.length || 0;
      }

      // Profit stats
      stats.profit = summaryData.netProfit || 0;

      setReportStats(stats);
    } catch (error) {
      console.error('Error fetching report stats:', error);
    }
  };

  const handleReportClick = (reportId) => {
    setActiveTab(`reports-${reportId}`);
  };

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '₨0';
    if (amount >= 1000000) return `₨${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `₨${(amount / 1000).toFixed(1)}K`;
    return `₨${amount.toFixed(0)}`;
  };

  const formatNumber = (num) => {
    if (!num || isNaN(num)) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100/50 min-h-screen"
    >
      {/* ===== HEADER ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Reports & Analytics
            </h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <BarChart3 size={14} />
              Comprehensive business intelligence and performance tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <Calendar size={14} />
              <span>{new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}</span>
            </div>
            <button
              onClick={() => { fetchSummaryData(); fetchReportStats(); }}
              className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-100"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ===== SEARCH BAR ===== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mb-6"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </motion.div>

      {/* ===== SUMMARY CARDS ===== */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6"
      >
        <SummaryCard 
          icon={TrendingUp} 
          label="Total Sales" 
          value={formatCurrency(summaryData.totalSales)}
          loading={loading}
          color="text-emerald-600" 
          bgColor="bg-emerald-50"
          gradient="from-emerald-50 to-emerald-100/30"
        />
        <SummaryCard 
          icon={ShoppingCart} 
          label="Total Purchases" 
          value={formatCurrency(summaryData.totalPurchases)}
          loading={loading}
          color="text-blue-600" 
          bgColor="bg-blue-50"
          gradient="from-blue-50 to-blue-100/30"
        />
        <SummaryCard 
          icon={DollarSign} 
          label="Net Profit" 
          value={formatCurrency(summaryData.netProfit)}
          loading={loading}
          color={summaryData.netProfit >= 0 ? 'text-purple-600' : 'text-red-600'}
          bgColor={summaryData.netProfit >= 0 ? 'bg-purple-50' : 'bg-red-50'}
          gradient={summaryData.netProfit >= 0 ? 'from-purple-50 to-purple-100/30' : 'from-red-50 to-red-100/30'}
        />
        <SummaryCard 
          icon={CreditCard} 
          label="Expenses" 
          value={formatCurrency(summaryData.expenses)}
          loading={loading}
          color="text-rose-600" 
          bgColor="bg-rose-50"
          gradient="from-rose-50 to-rose-100/30"
        />
        <SummaryCard 
          icon={Package} 
          label="Inventory Value" 
          value={formatCurrency(summaryData.inventoryValue)}
          loading={loading}
          color="text-amber-600" 
          bgColor="bg-amber-50"
          gradient="from-amber-50 to-amber-100/30"
        />
        <SummaryCard 
          icon={Users} 
          label="Customers" 
          value={formatNumber(summaryData.customers)}
          loading={loading}
          color="text-indigo-600" 
          bgColor="bg-indigo-50"
          gradient="from-indigo-50 to-indigo-100/30"
        />
        <SummaryCard 
          icon={Handshake} 
          label="Suppliers" 
          value={formatNumber(summaryData.suppliers)}
          loading={loading}
          color="text-teal-600" 
          bgColor="bg-teal-50"
          gradient="from-teal-50 to-teal-100/30"
        />
        <SummaryCard 
          icon={Box} 
          label="Products" 
          value={formatNumber(summaryData.products)}
          loading={loading}
          color="text-sky-600" 
          bgColor="bg-sky-50"
          gradient="from-sky-50 to-sky-100/30"
        />
      </motion.div>

      {/* ===== REPORT CARDS GRID ===== */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {filteredReports.map((report) => {
          const Icon = report.icon;
          const isHovered = hoveredCard === report.id;
          const statCount = reportStats[report.apiKey] || 0;

          return (
            <motion.div
              key={report.id}
              variants={itemVariants}
              whileHover={{ 
                y: -8,
                transition: { type: 'spring', stiffness: 300, damping: 20 }
              }}
              onMouseEnter={() => setHoveredCard(report.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleReportClick(report.id)}
              className="group relative bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl"
            >
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${report.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Top Border Glow */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${report.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className="relative p-5">
                <div className="flex items-start gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                    className={`p-3 rounded-xl ${report.bgColor} group-hover:shadow-lg transition-all duration-300`}
                  >
                    <Icon size={20} className={report.iconColor} />
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors duration-300">
                      {report.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                      {report.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${report.iconColor}`}>
                      {loading ? '...' : formatNumber(statCount)}
                    </span>
                    <span className="text-[8px] text-slate-400 font-medium uppercase tracking-wider">
                      records
                    </span>
                  </div>
                  
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: isHovered ? 0 : -10, opacity: isHovered ? 1 : 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="flex items-center gap-1 text-emerald-600"
                  >
                    <span className="text-[10px] font-medium">Open</span>
                    <ChevronRight size={14} />
                  </motion.div>
                </div>

                {/* Decorative Element */}
                <div className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-gradient-to-br ${report.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ===== EMPTY STATE ===== */}
      {filteredReports.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">No reports found</h3>
          <p className="text-sm text-slate-400 mt-1">
            Try adjusting your search terms
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ===== SUB-COMPONENTS =====

const SummaryCard = ({ icon: Icon, label, value, color, bgColor, gradient, loading }) => (
  <motion.div
    whileHover={{ y: -3, transition: { type: 'spring', stiffness: 400 } }}
    className="relative bg-white rounded-xl border border-slate-200/60 shadow-sm p-3 overflow-hidden group"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    <div className="relative flex items-center gap-2">
      <div className={`p-1.5 rounded-lg ${bgColor} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={12} className={color} />
      </div>
      <div>
        <p className="text-[8px] text-slate-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-xs font-bold text-slate-700">
          {loading ? <span className="animate-pulse">...</span> : value}
        </p>
      </div>
    </div>
  </motion.div>
);