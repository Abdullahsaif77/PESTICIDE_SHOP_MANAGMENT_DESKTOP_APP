// src/pages/Ledger/Ledger.jsx

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  Building2,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  Download,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Phone,
  MapPin,
  CreditCard,
  Receipt,
  ShoppingCart,
  Truck,
  Grid,
  List,
  Plus
} from "lucide-react";

const api = window.api || {};

class LedgerAPI {
  async getCustomerLedger(customerId, filters = {}) {
    try {
      const result = await api.getCustomerLedger(customerId, filters);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch customer ledger");
      }
      return result;
    } catch (error) {
      console.error("Error fetching customer ledger:", error);
      return { 
        success: false, 
        error: error.message,
        data: { entries: [], summary: { total_debit: 0, total_credit: 0, balance: 0 } }
      };
    }
  }

  async getSupplierLedger(supplierId, filters = {}) {
    try {
      const result = await api.getSupplierLedger(supplierId, filters);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch supplier ledger");
      }
      return result;
    } catch (error) {
      console.error("Error fetching supplier ledger:", error);
      return { 
        success: false, 
        error: error.message,
        data: { entries: [], summary: { total_debit: 0, total_credit: 0, balance: 0 } }
      };
    }
  }

  async getCustomers() {
    try {
      const result = await api.getAllCustomers({ is_active: 1 });
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch customers");
      }
      return result;
    } catch (error) {
      console.error("Error fetching customers:", error);
      return { success: false, data: [], error: error.message };
    }
  }

  async getSuppliers() {
    try {
      const result = await api.getAllSuppliers({ is_active: 1 });
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch suppliers");
      }
      return result;
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      return { success: false, data: [], error: error.message };
    }
  }

  async getStats() {
    try {
      const result = await api.getLedgerStats();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch ledger stats");
      }
      return result;
    } catch (error) {
      console.error("Error fetching ledger stats:", error);
      return { success: false, data: { totalEntries: 0, totalDebit: 0, totalCredit: 0 } };
    }
  }

  async getCustomerStats() {
    try {
      const result = await api.getAllCustomerLedgerStats();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch customer stats");
      }
      return result;
    } catch (error) {
      console.error("Error fetching customer stats:", error);
      return { success: false, data: [], error: error.message };
    }
  }

  async getSupplierStats() {
    try {
      const result = await api.getAllSupplierLedgerStats();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch supplier stats");
      }
      return result;
    } catch (error) {
      console.error("Error fetching supplier stats:", error);
      return { success: false, data: [], error: error.message };
    }
  }

  async recordCustomerPayment(customerId, amount, paymentMethod = 'cash', notes = '') {
    try {
      if (api.recordCustomerPayment) {
        const result = await api.recordCustomerPayment(customerId, amount, paymentMethod, null, notes);
        return result;
      }
      
      const entryData = {
        customer_id: customerId,
        entry_type: 'credit',
        amount: amount,
        description: `Payment received${notes ? ` - ${notes}` : ''}`,
        reference_type: 'payment',
        reference_id: null,
        created_by: null
      };
      
      const result = await api.createLedgerEntry(entryData);
      return result;
    } catch (error) {
      console.error('Error recording customer payment:', error);
      return { success: false, error: error.message };
    }
  }

  async recordSupplierPayment(supplierId, amount, paymentMethod = 'cash', notes = '') {
    try {
      if (api.recordSupplierPayment) {
        const result = await api.recordSupplierPayment(supplierId, amount, paymentMethod, null, notes);
        return result;
      }
      
      const entryData = {
        supplier_id: supplierId,
        entry_type: 'credit',
        amount: amount,
        description: `Payment made${notes ? ` - ${notes}` : ''}`,
        reference_type: 'payment',
        reference_id: null,
        created_by: null
      };
      
      const result = await api.createLedgerEntry(entryData);
      return result;
    } catch (error) {
      console.error('Error recording supplier payment:', error);
      return { success: false, error: error.message };
    }
  }

  async adjustCustomerBalance(customerId, amount, reason = 'Manual adjustment') {
    try {
      if (api.adjustCustomerBalance) {
        const result = await api.adjustCustomerBalance(customerId, amount, reason, null);
        return result;
      }
      
      const entryType = amount > 0 ? 'debit' : 'credit';
      const absAmount = Math.abs(amount);
      const entryData = {
        customer_id: customerId,
        entry_type: entryType,
        amount: absAmount,
        description: `${reason} (${entryType === 'debit' ? 'Increase' : 'Decrease'} balance)`,
        reference_type: 'adjustment',
        reference_id: null,
        created_by: null
      };
      
      const result = await api.createLedgerEntry(entryData);
      return result;
    } catch (error) {
      console.error('Error adjusting customer balance:', error);
      return { success: false, error: error.message };
    }
  }

  async adjustSupplierBalance(supplierId, amount, reason = 'Manual adjustment') {
    try {
      if (api.adjustSupplierBalance) {
        const result = await api.adjustSupplierBalance(supplierId, amount, reason, null);
        return result;
      }
      
      const entryType = amount > 0 ? 'debit' : 'credit';
      const absAmount = Math.abs(amount);
      const entryData = {
        supplier_id: supplierId,
        entry_type: entryType,
        amount: absAmount,
        description: `${reason} (${entryType === 'debit' ? 'Increase' : 'Decrease'} balance)`,
        reference_type: 'adjustment',
        reference_id: null,
        created_by: null
      };
      
      const result = await api.createLedgerEntry(entryData);
      return result;
    } catch (error) {
      console.error('Error adjusting supplier balance:', error);
      return { success: false, error: error.message };
    }
  }
}

const ledgerAPI = new LedgerAPI();

export default function Ledger() {
  // ==================== STATE ====================
  const [isLoading, setIsLoading] = useState(false);
  const [ledgerType, setLedgerType] = useState("customer");
  const [selectedId, setSelectedId] = useState("");
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({ total_debit: 0, total_credit: 0, balance: 0 });
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [referenceType, setReferenceType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEntries, setFilteredEntries] = useState([]);
  
  // Total stats (overall)
  const [totalStats, setTotalStats] = useState({ 
    totalEntries: 0, 
    totalDebit: 0, 
    totalCredit: 0
  });
  
  // Customer stats (overall customers)
  const [customerStats, setCustomerStats] = useState({
    totalDebit: 0,
    totalCredit: 0,
    netBalance: 0,
    totalSales: 0,
    totalSalesAmount: 0
  });
  
  // Supplier stats (overall suppliers)
  const [supplierStats, setSupplierStats] = useState({
    totalDebit: 0,
    totalCredit: 0,
    netBalance: 0,
    totalPurchases: 0,
    totalPurchasesAmount: 0
  });
  
  const [detailModal, setDetailModal] = useState({ open: false, entry: null });
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [viewMode, setViewMode] = useState("table");
  const [paymentModal, setPaymentModal] = useState({ open: false, type: "", entity: null });
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "cash", notes: "" });
  const [entitySearchQuery, setEntitySearchQuery] = useState("");
  
  const referenceTypes = ["all", "sale", "purchase", "payment", "receipt"];

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadData();
    loadTotalStats();
    loadCustomerStats();
    loadSupplierStats();
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadLedger();
    }
  }, [ledgerType, selectedId]);

  useEffect(() => {
    filterEntries();
  }, [entries, searchQuery, referenceType, startDate, endDate]);

  // ==================== DATA LOADING ====================
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [customersResult, suppliersResult] = await Promise.all([
        ledgerAPI.getCustomers(),
        ledgerAPI.getSuppliers()
      ]);

      if (customersResult.success) {
        setCustomers(customersResult.data || []);
      }
      
      if (suppliersResult.success) {
        setSuppliers(suppliersResult.data || []);
      }

      if (ledgerType === "customer" && customersResult.data?.length > 0) {
        setSelectedId(String(customersResult.data[0].id));
      } else if (ledgerType === "supplier" && suppliersResult.data?.length > 0) {
        setSelectedId(String(suppliersResult.data[0].id));
      }
    } catch (err) {
      console.error("Error loading data:", err);
      showNotification("error", err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTotalStats = async () => {
    try {
      const result = await ledgerAPI.getStats();
      if (result.success) {
        setTotalStats({
          totalEntries: result.data.totalEntries || 0,
          totalDebit: result.data.totalDebit || 0,
          totalCredit: result.data.totalCredit || 0
        });
      }
    } catch (err) {
      console.error("Error loading total stats:", err);
    }
  };

  const loadCustomerStats = async () => {
    try {
      const result = await ledgerAPI.getCustomerStats();
      if (result.success && result.data) {
        const data = result.data;
        const totalDebit = data.reduce((sum, c) => sum + (c.totalDebit || 0), 0);
        const totalCredit = data.reduce((sum, c) => sum + (c.totalCredit || 0), 0);
        const netBalance = totalDebit - totalCredit;
        const totalSales = data.reduce((sum, c) => sum + (c.totalSales || 0), 0);
        const totalSalesAmount = data.reduce((sum, c) => sum + (c.totalSalesAmount || 0), 0);

        setCustomerStats({
          totalDebit,
          totalCredit,
          netBalance,
          totalSales,
          totalSalesAmount
        });
      }
    } catch (err) {
      console.error("Error loading customer stats:", err);
    }
  };

  const loadSupplierStats = async () => {
    try {
      const result = await ledgerAPI.getSupplierStats();
      if (result.success && result.data) {
        const data = result.data;
        const totalDebit = data.reduce((sum, s) => sum + (s.totalDebit || 0), 0);
        const totalCredit = data.reduce((sum, s) => sum + (s.totalCredit || 0), 0);
        const netBalance = totalDebit - totalCredit;
        const totalPurchases = data.reduce((sum, s) => sum + (s.totalPurchases || 0), 0);
        const totalPurchasesAmount = data.reduce((sum, s) => sum + (s.totalPurchasesAmount || 0), 0);

        setSupplierStats({
          totalDebit,
          totalCredit,
          netBalance,
          totalPurchases,
          totalPurchasesAmount
        });
      }
    } catch (err) {
      console.error("Error loading supplier stats:", err);
    }
  };

  const loadLedger = async () => {
    if (!selectedId) return;
    setIsLoading(true);
    try {
      let result;
      if (ledgerType === "customer") {
        result = await ledgerAPI.getCustomerLedger(selectedId);
      } else {
        result = await ledgerAPI.getSupplierLedger(selectedId);
      }

      if (result.success) {
        setEntries(result.data.entries || []);
        setSummary(result.data.summary || { total_debit: 0, total_credit: 0, balance: 0 });
      } else {
        showNotification("error", result.error || "Failed to load ledger");
      }
    } catch (err) {
      console.error("Error loading ledger:", err);
      showNotification("error", err.message || "Failed to load ledger");
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== FILTERS ====================
  const filterEntries = () => {
    let filtered = [...entries];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(e =>
        e.description?.toLowerCase().includes(query) ||
        e.reference_type?.toLowerCase().includes(query)
      );
    }
    if (referenceType !== "all") {
      filtered = filtered.filter(e => e.reference_type === referenceType);
    }
    if (startDate) {
      filtered = filtered.filter(e => e.entry_date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(e => e.entry_date <= endDate);
    }
    setFilteredEntries(filtered);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setReferenceType("all");
    setStartDate("");
    setEndDate("");
  };

  // ==================== PAYMENT MODAL ====================
  const openPaymentModal = (type, entity) => {
    setPaymentForm({ amount: "", method: "cash", notes: "" });
    setPaymentModal({ open: true, type, entity });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      showNotification("error", "Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      const amount = parseFloat(paymentForm.amount);
      let result;

      if (paymentModal.type === "customer") {
        result = await ledgerAPI.recordCustomerPayment(
          paymentModal.entity.id,
          amount,
          paymentForm.method,
          paymentForm.notes
        );
      } else {
        result = await ledgerAPI.recordSupplierPayment(
          paymentModal.entity.id,
          amount,
          paymentForm.method,
          paymentForm.notes
        );
      }

      if (result.success) {
        showNotification("success", `Payment of ${formatCurrency(amount)} recorded successfully`);
        setPaymentModal({ open: false, type: "", entity: null });
        await loadLedger();
        await loadTotalStats();
        await loadCustomerStats();
        await loadSupplierStats();
        await loadData();
      } else {
        showNotification("error", result.error || "Failed to record payment");
      }
    } catch (err) {
      console.error("Payment error:", err);
      showNotification("error", err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== HELPERS ====================
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 3000);
  };

  const formatCurrency = (amount) => {
    return `₨${(amount || 0).toFixed(2)}`;
  };

  const getBalanceColor = (amount) => {
    const num = amount || 0;
    
    if (ledgerType === "supplier") {
      if (num < 0) return 'text-emerald-600';
      if (num > 0) return 'text-red-600';
      return 'text-slate-600';
    } else {
      if (num > 0) return 'text-emerald-600';
      if (num < 0) return 'text-red-600';
      return 'text-slate-600';
    }
  };

  const getBalanceSign = (amount) => {
    const num = amount || 0;
    
    if (ledgerType === "supplier") {
      if (num < 0) return '';
      if (num > 0) return '-';
      return '';
    } else {
      if (num > 0) return '+';
      if (num < 0) return '-';
      return '';
    }
  };

  const getBalanceLabel = (amount) => {
    const num = amount || 0;
    
    if (ledgerType === "supplier") {
      if (num < 0) return 'Supplier owes us';
      if (num > 0) return 'We owe supplier';
      return 'Settled';
    } else {
      if (num > 0) return 'Customer owes us';
      if (num < 0) return 'We owe customer';
      return 'Settled';
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleDateString();
    } catch (e) {
      return "-";
    }
  };

  const getEntryTypeBadge = (type) => {
    if (type === "debit") {
      return "bg-gradient-to-r from-red-100 to-red-50 text-red-600 border-red-200";
    }
    return "bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-600 border-emerald-200";
  };

  const getReferenceTypeBadge = (type) => {
    const types = {
      sale: "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-600 border-blue-200",
      purchase: "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-600 border-amber-200",
      payment: "bg-gradient-to-r from-purple-100 to-purple-50 text-purple-600 border-purple-200",
      receipt: "bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-600 border-emerald-200"
    };
    return types[type] || "bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 border-slate-200";
  };

  const getReferenceIcon = (type) => {
    const icons = {
      sale: <ShoppingCart size={12} />,
      purchase: <Truck size={12} />,
      payment: <CreditCard size={12} />,
      receipt: <Receipt size={12} />
    };
    return icons[type] || <FileText size={12} />;
  };

  const getEntityName = (id) => {
    if (ledgerType === "customer") {
      const customer = customers.find(c => c.id === parseInt(id));
      return customer?.name || "Unknown Customer";
    }
    const supplier = suppliers.find(s => s.id === parseInt(id));
    return supplier?.name || "Unknown Supplier";
  };

  const getEntityDetails = (id) => {
    if (ledgerType === "customer") {
      return customers.find(c => c.id === parseInt(id));
    }
    return suppliers.find(s => s.id === parseInt(id));
  };

  const getFilteredEntities = () => {
    const entities = ledgerType === "customer" ? customers : suppliers;
    if (!entitySearchQuery.trim()) return entities;
    const query = entitySearchQuery.toLowerCase().trim();
    return entities.filter(entity => 
      entity.name?.toLowerCase().includes(query) ||
      entity.phone?.includes(query)
    );
  };

  const handleExport = () => {
    if (filteredEntries.length === 0) {
      showNotification("info", "No entries to export");
      return;
    }

    const headers = ["Date", "Type", "Description", "Reference", "Amount", "Balance"];
    const rows = filteredEntries.map(e => [
      formatDate(e.entry_date || e.created_at),
      e.entry_type.toUpperCase(),
      e.description,
      e.reference_type || "-",
      formatCurrency(e.amount),
      formatCurrency(e.balance_after)
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger_${ledgerType}_${selectedId}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showNotification("success", "Ledger exported successfully!");
  };

  // ==================== RENDER ====================
  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 min-h-screen">

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-xl shadow-lg animate-slide-down border ${
          notification.type === "success" ? "bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200" : 
          notification.type === "info" ? "bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200" :
          "bg-gradient-to-r from-red-50 to-red-100/50 border-red-200"
        }`}>
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 p-1.5 rounded-full ${
              notification.type === "success" ? "bg-emerald-100" : 
              notification.type === "info" ? "bg-blue-100" :
              "bg-red-100"
            }`}>
              {notification.type === "success" ? (
                <CheckCircle size={16} className="text-emerald-600" />
              ) : notification.type === "info" ? (
                <AlertCircle size={16} className="text-blue-600" />
              ) : (
                <X size={16} className="text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                notification.type === "success" ? "text-emerald-800" : 
                notification.type === "info" ? "text-blue-800" :
                "text-red-800"
              }`}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification({ show: false, type: "", message: "" })}
              className="text-slate-400 hover:text-slate-600 transition-transform hover:scale-110"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/25">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Ledger (Khata)
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <FileText size={12} />
              Track all financial transactions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setViewMode(viewMode === "table" ? "card" : "table")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-all duration-300 shadow-sm hover:shadow-md bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
          >
            {viewMode === "table" ? (
              <><Grid size={14} /> Card View</>
            ) : (
              <><List size={14} /> Table View</>
            )}
          </button>
          <button
            onClick={handleExport}
            disabled={filteredEntries.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
          >
            <Download size={14} />
            Export
          </button>
          <button
            onClick={() => { loadData(); loadTotalStats(); loadCustomerStats(); loadSupplierStats(); loadLedger(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ===== STATS SECTION ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Overall Stats */}
        <div className="bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 rounded-xl border border-slate-200/60 shadow-sm p-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
            Overall Ledger
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/80 rounded-lg p-2.5 text-center shadow-sm">
              <p className="text-[8px] text-slate-400 uppercase font-medium">Total Entries</p>
              <p className="text-lg font-bold text-indigo-600">{totalStats.totalEntries || 0}</p>
            </div>
            <div className="bg-white/80 rounded-lg p-2.5 text-center shadow-sm">
              <p className="text-[8px] text-slate-400 uppercase font-medium">Net Balance</p>
              <p className="text-lg font-bold text-purple-600">{formatCurrency((totalStats.totalDebit || 0) - (totalStats.totalCredit || 0))}</p>
            </div>
            <div className="bg-white/80 rounded-lg p-2.5 text-center shadow-sm">
              <p className="text-[8px] text-slate-400 uppercase font-medium">Total Debit</p>
              <p className="text-base font-bold text-red-600">{formatCurrency(totalStats.totalDebit || 0)}</p>
            </div>
            <div className="bg-white/80 rounded-lg p-2.5 text-center shadow-sm">
              <p className="text-[8px] text-slate-400 uppercase font-medium">Total Credit</p>
              <p className="text-base font-bold text-emerald-600">{formatCurrency(totalStats.totalCredit || 0)}</p>
            </div>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="bg-gradient-to-br from-blue-50/80 via-white to-cyan-50/50 rounded-xl border border-slate-200/60 shadow-sm p-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
            Customer Summary ({customers.length})
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/80 rounded-lg p-2.5 text-center shadow-sm">
              <p className="text-[8px] text-slate-400 uppercase font-medium">Total Debit</p>
              <p className="text-base font-bold text-red-600">{formatCurrency(customerStats.totalDebit || 0)}</p>
            </div>
            <div className="bg-white/80 rounded-lg p-2.5 text-center shadow-sm">
              <p className="text-[8px] text-slate-400 uppercase font-medium">Total Credit</p>
              <p className="text-base font-bold text-emerald-600">{formatCurrency(customerStats.totalCredit || 0)}</p>
            </div>
            <div className="bg-white/80 rounded-lg p-2.5 text-center col-span-2 shadow-sm">
              <p className="text-[8px] text-slate-400 uppercase font-medium">Net Balance</p>
              <p className={`text-base font-bold ${customerStats.netBalance > 0 ? 'text-emerald-600' : customerStats.netBalance < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                {formatCurrency(customerStats.netBalance || 0)}
              </p>
              <p className="text-[7px] text-slate-400 mt-0.5">
                {customerStats.netBalance > 0 ? '✅ Customers owe us' : customerStats.netBalance < 0 ? '⚠️ We owe customers' : '⚖️ Settled'}
              </p>
            </div>
          </div>
        </div>

        {/* Supplier Stats */}
        <div className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 rounded-xl border border-slate-200/60 shadow-sm p-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
            Supplier Summary ({suppliers.length})
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/80 rounded-lg p-2.5 text-center shadow-sm">
              <p className="text-[8px] text-slate-400 uppercase font-medium">Total Debit</p>
              <p className="text-base font-bold text-red-600">{formatCurrency(supplierStats.totalDebit || 0)}</p>
            </div>
            <div className="bg-white/80 rounded-lg p-2.5 text-center shadow-sm">
              <p className="text-[8px] text-slate-400 uppercase font-medium">Total Credit</p>
              <p className="text-base font-bold text-emerald-600">{formatCurrency(supplierStats.totalCredit || 0)}</p>
            </div>
            <div className="bg-white/80 rounded-lg p-2.5 text-center col-span-2 shadow-sm">
              <p className="text-[8px] text-slate-400 uppercase font-medium">Net Balance</p>
              <p className={`text-base font-bold ${supplierStats.netBalance < 0 ? 'text-emerald-600' : supplierStats.netBalance > 0 ? 'text-red-600' : 'text-slate-600'}`}>
                {formatCurrency(Math.abs(supplierStats.netBalance || 0))}
              </p>
              <p className="text-[7px] text-slate-400 mt-0.5">
                {supplierStats.netBalance < 0 ? '✅ Suppliers owe us' : supplierStats.netBalance > 0 ? '⚠️ We owe suppliers' : '⚖️ Settled'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Sidebar - Selector & Entity List */}
        <div className="lg:col-span-1 space-y-3">
          {/* Type Selector - Show counts */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-3">
            <div className="flex gap-1">
              <button
                onClick={() => setLedgerType("customer")}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-300 ${
                  ledgerType === "customer"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Users size={14} className="inline mr-1.5" />
                Customers ({customers.length})
              </button>
              <button
                onClick={() => setLedgerType("supplier")}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-300 ${
                  ledgerType === "supplier"
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Building2 size={14} className="inline mr-1.5" />
                Suppliers ({suppliers.length})
              </button>
            </div>
          </div>

          {/* Search & Entity List */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-3">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder={`Search ${ledgerType}s...`}
                value={entitySearchQuery}
                onChange={(e) => setEntitySearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-slate-50 transition-all"
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-1">
              {getFilteredEntities().map((entity) => {
                const isActive = selectedId === String(entity.id);
                const balance = (entity.credit || 0) - (entity.debit || 0);
                return (
                  <div
                    key={entity.id}
                    onClick={() => setSelectedId(String(entity.id))}
                    className={`p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${isActive ? "text-indigo-700" : "text-slate-700"}`}>
                          {entity.name}
                        </p>
                        {entity.phone && (
                          <p className="text-[9px] text-slate-400 truncate">{entity.phone}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {entity.credit !== undefined && entity.debit !== undefined && (
                          <span className={`text-[10px] font-bold ${getBalanceColor(balance)}`}>
                            {getBalanceSign(balance)}{formatCurrency(Math.abs(balance))}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openPaymentModal(ledgerType, entity);
                          }}
                          className="p-1 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                          title="Record Payment"
                        >
                          <DollarSign size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {getFilteredEntities().length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400">
                  {entitySearchQuery ? `No ${ledgerType}s found matching "${entitySearchQuery}"` : `No ${ledgerType}s found`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Content - Ledger Entries */}
        <div className="lg:col-span-3 space-y-3">
          {selectedId ? (
            <>
              {/* Entity Info & Summary */}
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
                {(() => {
                  const entity = getEntityDetails(selectedId);
                  if (!entity) return null;
                  const balance = summary.balance || 0;
                  const balanceColor = getBalanceColor(balance);
                  const balanceSign = getBalanceSign(balance);
                  const balanceLabel = getBalanceLabel(balance);
                  
                  return (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {entity.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-800">{entity.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                            {entity.phone && <span><Phone size={10} className="inline mr-0.5" /> {entity.phone}</span>}
                            {entity.address && <span><MapPin size={10} className="inline mr-0.5" /> {entity.address}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-[8px] text-slate-400 uppercase font-medium">
                            {ledgerType === "supplier" ? "We Owe" : "They Owe"}
                          </p>
                          <p className="text-sm font-bold text-red-600">{formatCurrency(summary.total_debit || 0)}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div className="text-center">
                          <p className="text-[8px] text-slate-400 uppercase font-medium">
                            {ledgerType === "supplier" ? "They Owe" : "We Owe"}
                          </p>
                          <p className="text-sm font-bold text-emerald-600">{formatCurrency(summary.total_credit || 0)}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div className="text-center">
                          <p className="text-[8px] text-slate-400 uppercase font-medium">Balance</p>
                          <p className={`text-sm font-bold ${balanceColor}`}>
                            {balanceSign}{formatCurrency(Math.abs(balance))}
                          </p>
                          <p className="text-[8px] text-slate-400 mt-0.5">{balanceLabel}</p>
                        </div>
                        <button
                          onClick={() => openPaymentModal(ledgerType, entity)}
                          className="px-3 py-1.5 text-[10px] font-medium text-white rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-sm hover:shadow-md transition-all"
                        >
                          <DollarSign size={12} className="inline mr-1" />
                          Record Payment
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Filters */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm p-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input
                      type="text"
                      placeholder="Search entries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-7.5 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white transition-all"
                    />
                  </div>

                  <div className="relative w-full sm:w-28">
                    <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={referenceType}
                      onChange={(e) => setReferenceType(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white transition-all appearance-none"
                    >
                      {referenceTypes.map((type) => (
                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="relative w-full sm:w-32">
                    <Calendar size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white transition-all"
                      placeholder="From"
                    />
                  </div>

                  <div className="relative w-full sm:w-32">
                    <Calendar size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white transition-all"
                      placeholder="To"
                    />
                  </div>

                  <button
                    onClick={resetFilters}
                    className="px-2.5 py-1.5 text-[10px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <X size={12} className="inline mr-0.5" />
                    Reset
                  </button>

                  <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                    {filteredEntries.length} entries
                  </div>
                </div>
              </div>

              {/* Entries Table/Cards */}
              {isLoading ? (
                <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-8 text-center">
                  <div className="inline-flex items-center gap-2 text-slate-400">
                    <span className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
                    <span className="text-xs">Loading ledger...</span>
                  </div>
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-12 text-center">
                  <BookOpen size={32} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600">No entries found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {searchQuery || referenceType !== "all" || startDate || endDate
                      ? "Try adjusting your filters"
                      : `No transactions for this ${ledgerType}`}
                  </p>
                </div>
              ) : viewMode === "table" ? (
                <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gradient-to-r from-slate-50 to-indigo-50/50 border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                          <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                          <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                          <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Reference</th>
                          <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                          <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Balance</th>
                          <th className="px-3 py-2.5 text-center text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredEntries.map((entry, index) => {
                          const isDebit = entry.entry_type === "debit";
                          const balance = entry.balance_after || 0;
                          return (
                            <tr key={entry.id || index} className="hover:bg-indigo-50/30 transition-colors duration-200">
                              <td className="px-3 py-2 text-[10px] text-slate-600">{formatDate(entry.entry_date)}</td>
                              <td className="px-3 py-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-medium rounded-full border ${getEntryTypeBadge(entry.entry_type)}`}>
                                  {isDebit ? <ArrowUpRight size={10} className="text-red-500" /> : <ArrowDownRight size={10} className="text-emerald-500" />}
                                  {entry.entry_type.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-[10px] text-slate-700">{entry.description}</td>
                              <td className="px-3 py-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-medium rounded-full border ${getReferenceTypeBadge(entry.reference_type)}`}>
                                  {getReferenceIcon(entry.reference_type)}
                                  {entry.reference_type ? entry.reference_type.charAt(0).toUpperCase() + entry.reference_type.slice(1) : "-"}
                                  {entry.reference_id && ` #${entry.reference_id}`}
                                </span>
                              </td>
                              <td className={`px-3 py-2 text-right font-medium text-[10px] ${isDebit ? 'text-red-600' : 'text-emerald-600'}`}>
                                {isDebit ? '+' : '-'} {formatCurrency(entry.amount)}
                              </td>
                              <td className="px-3 py-2 text-right font-medium text-[10px]">
                                <span className={getBalanceColor(balance)}>
                                  {getBalanceSign(balance)}{formatCurrency(Math.abs(balance))}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <button
                                  onClick={() => setDetailModal({ open: true, entry })}
                                  className="p-1 rounded hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={12} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredEntries.map((entry, index) => {
                    const isDebit = entry.entry_type === "debit";
                    const balance = entry.balance_after || 0;
                    return (
                      <div key={entry.id || index} className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-3 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-medium rounded-full border ${getEntryTypeBadge(entry.entry_type)}`}>
                                {isDebit ? <ArrowUpRight size={10} className="text-red-500" /> : <ArrowDownRight size={10} className="text-emerald-500" />}
                                {entry.entry_type.toUpperCase()}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-medium rounded-full border ${getReferenceTypeBadge(entry.reference_type)}`}>
                                {getReferenceIcon(entry.reference_type)}
                                {entry.reference_type ? entry.reference_type.charAt(0).toUpperCase() + entry.reference_type.slice(1) : "-"}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-slate-800 mt-1.5">{entry.description}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(entry.entry_date)}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${isDebit ? 'text-red-600' : 'text-emerald-600'}`}>
                              {isDebit ? '+' : '-'} {formatCurrency(entry.amount)}
                            </p>
                            <p className="text-[9px]">
                              <span className={getBalanceColor(balance)}>
                                Balance: {getBalanceSign(balance)}{formatCurrency(Math.abs(balance))}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end">
                          <button
                            onClick={() => setDetailModal({ open: true, entry })}
                            className="p-1 rounded hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors text-[10px]"
                          >
                            <Eye size={12} className="inline mr-1" />
                            Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200">
                  <BookOpen size={48} className="text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-600">Select a {ledgerType}</p>
                <p className="text-xs text-slate-400">Choose a customer or supplier from the sidebar to view their ledger</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== PAYMENT MODAL ===== */}
      {paymentModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-5 animate-scale-in relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-t-xl" />
            <button
              onClick={() => setPaymentModal({ open: false, type: "", entity: null })}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-transform hover:scale-110"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mt-2 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25">
                <DollarSign size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Record Payment
                </h3>
                <p className="text-xs text-slate-500">
                  {paymentModal.type === "customer" ? "Customer" : "Supplier"}: {paymentModal.entity?.name}
                </p>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white transition-all"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, method: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white transition-all appearance-none"
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="credit">Credit Card</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white transition-all"
                  placeholder="Payment notes..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModal({ open: false, type: "", entity: null })}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-medium text-white rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  {isLoading ? 'Processing...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal.open && detailModal.entry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-5 animate-scale-in relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-t-xl" />
            <button
              onClick={() => setDetailModal({ open: false, entry: null })}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-transform hover:scale-110"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mt-2 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Transaction Details</h3>
                <p className="text-xs text-slate-500">
                  {getEntityName(selectedId)} - {formatDate(detailModal.entry.entry_date)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[8px] text-slate-400 uppercase font-medium">Type</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${getEntryTypeBadge(detailModal.entry.entry_type)} mt-1`}>
                    {detailModal.entry.entry_type.toUpperCase()}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[8px] text-slate-400 uppercase font-medium">Amount</p>
                  <p className={`text-lg font-bold ${detailModal.entry.entry_type === "debit" ? 'text-red-600' : 'text-emerald-600'} mt-1`}>
                    {formatCurrency(detailModal.entry.amount)}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[8px] text-slate-400 uppercase font-medium">Description</p>
                <p className="text-sm text-slate-700 mt-1">{detailModal.entry.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[8px] text-slate-400 uppercase font-medium">Reference</p>
                  <p className="text-sm font-medium text-slate-700 mt-1 capitalize">
                    {detailModal.entry.reference_type || "-"}
                    {detailModal.entry.reference_id && ` #${detailModal.entry.reference_id}`}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[8px] text-slate-400 uppercase font-medium">Balance After</p>
                  <p className={`text-lg font-bold ${getBalanceColor(detailModal.entry.balance_after)} mt-1`}>
                    {getBalanceSign(detailModal.entry.balance_after)}
                    {formatCurrency(Math.abs(detailModal.entry.balance_after || 0))}
                  </p>
                  <p className="text-[8px] text-slate-400 mt-0.5">
                    {getBalanceLabel(detailModal.entry.balance_after)}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[8px] text-slate-400 uppercase font-medium">Date & Time</p>
                <p className="text-sm text-slate-700 mt-1">{formatDate(detailModal.entry.entry_date)}</p>
              </div>
            </div>

            <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDetailModal({ open: false, entry: null })}
                className="px-4 py-2 text-xs font-medium text-white rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-slide-down {
          animation: slideDown 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}