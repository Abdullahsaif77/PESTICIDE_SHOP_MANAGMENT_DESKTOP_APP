// src/pages/Ledger/Ledger.jsx

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  Building2,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
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
  Clock,
  User,
  Phone,
  MapPin,
  Mail,
  Hash,
  Printer,
  PieChart,
  BarChart3,
  Zap,
  CircleDot,
  CreditCard,
  Receipt,
  ShoppingCart,
  Truck,
  Activity,
  Settings,
  Grid,
  List
} from "lucide-react";

// ==================== MOCK DATA ====================
const MOCK_CUSTOMERS = [
  { id: 1, name: "Muhammad Store", phone: "0300-1234567", address: "Main Bazar, Lahore", balance: 20000 },
  { id: 2, name: "Ali Traders", phone: "0300-7654321", address: "Gulberg, Lahore", balance: 15000 },
  { id: 3, name: "Ahmed Enterprises", phone: "0300-9876543", address: "Industrial Area, Lahore", balance: 0 },
  { id: 4, name: "Usman Store", phone: "0300-5555555", address: "Johar Town, Lahore", balance: 63000 },
  { id: 5, name: "Riaz Agro", phone: "0300-4444444", address: "Farm Area, Lahore", balance: 0 },
];

const MOCK_SUPPLIERS = [
  { id: 1, name: "ABC Chemicals", phone: "0300-1234567", address: "Industrial Zone, Lahore", balance: 45000 },
  { id: 2, name: "XYZ Pesticides", phone: "0300-7654321", address: "Main Road, Faisalabad", balance: 0 },
  { id: 3, name: "Green Agro Supplies", phone: "0300-9876543", address: "Garden Town, Multan", balance: 0 },
  { id: 4, name: "Premium Fertilizers", phone: "0300-5555555", address: "Sheikhupura Road", balance: 63000 },
];

const MOCK_LEDGER = {
  customer: {
    1: [
      { id: 1, entry_type: "debit", amount: 15000, description: "Sale INV-001", reference_type: "sale", reference_id: 1, balance_after: 15000, entry_date: "2024-01-15" },
      { id: 2, entry_type: "credit", amount: 5000, description: "Payment received", reference_type: "payment", reference_id: 1, balance_after: 10000, entry_date: "2024-01-20" },
      { id: 3, entry_type: "debit", amount: 8000, description: "Sale INV-002", reference_type: "sale", reference_id: 2, balance_after: 18000, entry_date: "2024-02-01" },
      { id: 4, entry_type: "credit", amount: 10000, description: "Payment received", reference_type: "payment", reference_id: 2, balance_after: 8000, entry_date: "2024-02-15" },
      { id: 5, entry_type: "debit", amount: 12000, description: "Sale INV-003", reference_type: "sale", reference_id: 3, balance_after: 20000, entry_date: "2024-03-01" },
    ],
    2: [
      { id: 6, entry_type: "debit", amount: 18000, description: "Sale INV-004", reference_type: "sale", reference_id: 4, balance_after: 18000, entry_date: "2024-02-01" },
      { id: 7, entry_type: "credit", amount: 18000, description: "Payment received", reference_type: "payment", reference_id: 3, balance_after: 0, entry_date: "2024-02-10" },
      { id: 8, entry_type: "debit", amount: 15000, description: "Sale INV-005", reference_type: "sale", reference_id: 5, balance_after: 15000, entry_date: "2024-03-15" },
    ],
    4: [
      { id: 9, entry_type: "debit", amount: 45000, description: "Sale INV-006", reference_type: "sale", reference_id: 6, balance_after: 45000, entry_date: "2024-04-10" },
      { id: 10, entry_type: "debit", amount: 68000, description: "Sale INV-007", reference_type: "sale", reference_id: 7, balance_after: 113000, entry_date: "2024-05-15" },
      { id: 11, entry_type: "credit", amount: 50000, description: "Payment received", reference_type: "payment", reference_id: 4, balance_after: 63000, entry_date: "2024-05-20" },
    ],
  },
  supplier: {
    1: [
      { id: 12, entry_type: "debit", amount: 32000, description: "Purchase PO-001", reference_type: "purchase", reference_id: 1, balance_after: 32000, entry_date: "2024-01-20" },
      { id: 13, entry_type: "credit", amount: 32000, description: "Payment made", reference_type: "payment", reference_id: 5, balance_after: 0, entry_date: "2024-02-01" },
      { id: 14, entry_type: "debit", amount: 45000, description: "Purchase PO-002", reference_type: "purchase", reference_id: 2, balance_after: 45000, entry_date: "2024-02-15" },
    ],
    2: [
      { id: 15, entry_type: "debit", amount: 18000, description: "Purchase PO-003", reference_type: "purchase", reference_id: 3, balance_after: 18000, entry_date: "2024-02-01" },
      { id: 16, entry_type: "credit", amount: 18000, description: "Payment made", reference_type: "payment", reference_id: 6, balance_after: 0, entry_date: "2024-02-10" },
    ],
    4: [
      { id: 17, entry_type: "debit", amount: 45000, description: "Purchase PO-004", reference_type: "purchase", reference_id: 4, balance_after: 45000, entry_date: "2024-04-10" },
      { id: 18, entry_type: "debit", amount: 68000, description: "Purchase PO-005", reference_type: "purchase", reference_id: 5, balance_after: 113000, entry_date: "2024-05-15" },
      { id: 19, entry_type: "credit", amount: 50000, description: "Payment made", reference_type: "payment", reference_id: 7, balance_after: 63000, entry_date: "2024-05-20" },
    ],
  }
};

const MOCK_STATS = {
  totalEntries: 19,
  totalDebit: 295000,
  totalCredit: 105000,
  totalCustomers: 5,
  totalSuppliers: 4
};

const api = window.api || {};

class LedgerAPI {
  async getCustomerLedger(customerId, filters = {}) {
    try {
      const result = await api.getCustomerLedger(customerId, filters);
      if (result.success && result.data) {
        return result;
      }
      return { success: true, data: { entries: MOCK_LEDGER.customer[customerId] || [], summary: { total_debit: 0, total_credit: 0, balance: 0 } } };
    } catch (error) {
      return { success: true, data: { entries: MOCK_LEDGER.customer[customerId] || [], summary: { total_debit: 0, total_credit: 0, balance: 0 } } };
    }
  }

  async getSupplierLedger(supplierId, filters = {}) {
    try {
      const result = await api.getSupplierLedger(supplierId, filters);
      if (result.success && result.data) {
        return result;
      }
      return { success: true, data: { entries: MOCK_LEDGER.supplier[supplierId] || [], summary: { total_debit: 0, total_credit: 0, balance: 0 } } };
    } catch (error) {
      return { success: true, data: { entries: MOCK_LEDGER.supplier[supplierId] || [], summary: { total_debit: 0, total_credit: 0, balance: 0 } } };
    }
  }

  async getCustomers() {
    try {
      const result = await api.getAllCustomers({ is_active: 1 });
      if (result.success && result.data.length > 0) {
        return result;
      }
      return { success: true, data: MOCK_CUSTOMERS };
    } catch (error) {
      return { success: true, data: MOCK_CUSTOMERS };
    }
  }

  async getSuppliers() {
    try {
      const result = await api.getAllSuppliers({ is_active: 1 });
      if (result.success && result.data.length > 0) {
        return result;
      }
      return { success: true, data: MOCK_SUPPLIERS };
    } catch (error) {
      return { success: true, data: MOCK_SUPPLIERS };
    }
  }

  async getStats() {
    try {
      const result = await api.getLedgerStats();
      if (result.success) return result;
      return { success: true, data: MOCK_STATS };
    } catch (error) {
      return { success: true, data: MOCK_STATS };
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
  const [stats, setStats] = useState({ totalEntries: 0, totalDebit: 0, totalCredit: 0, totalCustomers: 0, totalSuppliers: 0 });
  const [detailModal, setDetailModal] = useState({ open: false, entry: null });
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [viewMode, setViewMode] = useState("table");
  
  const referenceTypes = ["all", "sale", "purchase", "payment", "receipt"];

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadData();
    loadStats();
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

      if (customersResult.success) setCustomers(customersResult.data || []);
      if (suppliersResult.success) setSuppliers(suppliersResult.data || []);

      if (ledgerType === "customer" && customersResult.data?.length > 0) {
        setSelectedId(customersResult.data[0].id);
      } else if (ledgerType === "supplier" && suppliersResult.data?.length > 0) {
        setSelectedId(suppliersResult.data[0].id);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      showNotification("error", "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await ledgerAPI.getStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
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
      }
    } catch (err) {
      console.error("Error loading ledger:", err);
      showNotification("error", "Failed to load ledger");
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

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const getEntryTypeBadge = (type) => {
    if (type === "debit") {
      return "bg-red-50 text-red-600 border-red-200";
    }
    return "bg-emerald-50 text-emerald-600 border-emerald-200";
  };

  const getReferenceTypeBadge = (type) => {
    const types = {
      sale: "bg-blue-50 text-blue-600 border-blue-200",
      purchase: "bg-amber-50 text-amber-600 border-amber-200",
      payment: "bg-purple-50 text-purple-600 border-purple-200",
      receipt: "bg-emerald-50 text-emerald-600 border-emerald-200"
    };
    return types[type] || "bg-slate-50 text-slate-600 border-slate-200";
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

  const handleExport = () => {
    const headers = ["Date", "Type", "Description", "Reference", "Amount", "Balance"];
    const rows = filteredEntries.map(e => [
      formatDate(e.entry_date),
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
          notification.type === "success" ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
        }`}>
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 p-1.5 rounded-full ${notification.type === "success" ? "bg-emerald-100" : "bg-red-100"}`}>
              {notification.type === "success" ? (
                <CheckCircle size={16} className="text-emerald-600" />
              ) : (
                <X size={16} className="text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${notification.type === "success" ? "text-emerald-800" : "text-red-800"}`}>
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
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-indigo-700 to-purple-600 bg-clip-text text-transparent">
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
            onClick={() => { loadData(); loadStats(); loadLedger(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards - Cleaner Design */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: "Total Entries", value: stats.totalEntries || 0, icon: FileText, color: "text-indigo-600" },
          { label: "Total Debit", value: formatCurrency(stats.totalDebit), icon: TrendingUp, color: "text-red-600" },
          { label: "Total Credit", value: formatCurrency(stats.totalCredit), icon: TrendingDown, color: "text-emerald-600" },
          { label: "Customers", value: stats.totalCustomers || 0, icon: Users, color: "text-blue-600" },
          { label: "Suppliers", value: stats.totalSuppliers || 0, icon: Building2, color: "text-amber-600" },
          { label: "Net Balance", value: formatCurrency((stats.totalDebit || 0) - (stats.totalCredit || 0)), icon: Wallet, color: "text-purple-600" }
        ].map((item, index) => (
          <div key={index} className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-3 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-medium">{item.label}</span>
              <item.icon size={16} className={item.color} />
            </div>
            <p className={`text-xl font-bold ${item.color} mt-1`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Sidebar - Selector & Entity List */}
        <div className="lg:col-span-1 space-y-3">
          {/* Type Selector */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-3">
            <div className="flex gap-1">
              <button
                onClick={() => setLedgerType("customer")}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-300 ${
                  ledgerType === "customer"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Users size={14} className="inline mr-1.5" />
                Customers
              </button>
              <button
                onClick={() => setLedgerType("supplier")}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-300 ${
                  ledgerType === "supplier"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Building2 size={14} className="inline mr-1.5" />
                Suppliers
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
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-slate-50 transition-all"
                onChange={(e) => {
                  const query = e.target.value.toLowerCase();
                  const list = ledgerType === "customer" ? customers : suppliers;
                  const filtered = list.filter(item => 
                    item.name.toLowerCase().includes(query) ||
                    (item.phone && item.phone.includes(query))
                  );
                  // You can add state for filtered list here
                }}
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-1">
              {(ledgerType === "customer" ? customers : suppliers).map((entity) => {
                const isActive = selectedId === String(entity.id);
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
                      {entity.balance !== undefined && (
                        <span className={`text-[10px] font-bold ${entity.balance > 0 ? 'text-red-600' : entity.balance < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {formatCurrency(entity.balance)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {(ledgerType === "customer" ? customers : suppliers).length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400">
                  No {ledgerType}s found
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
                          <p className="text-[8px] text-slate-400 uppercase font-medium">Debit</p>
                          <p className="text-sm font-bold text-red-600">{formatCurrency(summary.total_debit || 0)}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div className="text-center">
                          <p className="text-[8px] text-slate-400 uppercase font-medium">Credit</p>
                          <p className="text-sm font-bold text-emerald-600">{formatCurrency(summary.total_credit || 0)}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div className="text-center">
                          <p className="text-[8px] text-slate-400 uppercase font-medium">Balance</p>
                          <p className={`text-sm font-bold ${(summary.balance || 0) > 0 ? 'text-red-600' : (summary.balance || 0) < 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                            {formatCurrency(summary.balance || 0)}
                          </p>
                        </div>
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
                              <td className="px-3 py-2 text-right font-medium text-[10px] text-slate-700">
                                {formatCurrency(entry.balance_after)}
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
                            <p className="text-[9px] text-slate-400">Balance: {formatCurrency(entry.balance_after)}</p>
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
                <div className="p-4 rounded-full bg-slate-50">
                  <BookOpen size={48} className="text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-600">Select a {ledgerType}</p>
                <p className="text-xs text-slate-400">Choose a customer or supplier from the sidebar to view their ledger</p>
              </div>
            </div>
          )}
        </div>
      </div>

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
                  <p className={`text-lg font-bold ${(detailModal.entry.balance_after || 0) > 0 ? 'text-red-600' : 'text-emerald-600'} mt-1`}>
                    {formatCurrency(detailModal.entry.balance_after)}
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