import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  ShoppingBag,
  X,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Building2,
  Filter,
  ChevronDown,
  Download,
  RefreshCw,
  User,
  Users,
  Wallet,
  TrendingUp,
  BarChart3,
  Eye,
  FileText,
  Calendar,
  DollarSign,
  Database,
  Award,
  Star,
  Clock,
  Zap,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CircleDot,
  Hash,
  Link2,
  CreditCard as CreditIcon,
  Receipt,
  PiggyBank,
  Loader2,
  BookOpen,
  Layers
} from "lucide-react";

const api = window.api || {};

class SupplierAPI {
  // ==================== CRUD OPERATIONS ====================
  async createSupplier(data) {
    const result = await api.createSupplier(data);
    if (!result.success) {
      throw new Error(result.error || "Failed to create supplier");
    }
    return result;
  }

  async getAllSuppliers(filters = {}) {
    const result = await api.getAllSuppliers(filters);
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch suppliers");
    }
    return result;
  }

  async getSupplierById(id) {
    const result = await api.getSupplierById(id);
    if (!result.success) {
      throw new Error(result.error || "Supplier not found");
    }
    return result;
  }

  async updateSupplier(id, data) {
    const result = await api.updateSupplier(id, data);
    if (!result.success) {
      throw new Error(result.error || "Failed to update supplier");
    }
    return result;
  }

  async deleteSupplier(id) {
    const result = await api.deleteSupplier(id);
    if (!result.success) {
      throw new Error(result.error || "Failed to delete supplier");
    }
    return result;
  }

  // ==================== READ OPERATIONS ====================
  async getActiveSuppliers() {
    const result = await api.getActiveSuppliers();
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch active suppliers");
    }
    return result;
  }

  async searchSuppliers(query) {
    const result = await api.searchSuppliers(query);
    if (!result.success) {
      throw new Error(result.error || "Failed to search suppliers");
    }
    return result;
  }

  // ==================== STATS OPERATIONS ====================
  async getSupplierStats() {
    const result = await api.getSupplierStats();
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch supplier stats");
    }
    return result;
  }

  async getTopSuppliers(limit = 5) {
    const result = await api.getTopSuppliers(limit);
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch top suppliers");
    }
    return result;
  }

  async getSupplierPurchases(id) {
    const result = await api.getSupplierPurchases(id);
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch supplier purchases");
    }
    return result;
  }

  // ✅ NEW: Get supplier stats from ledger
  async getSupplierLedgerStats(supplierId) {
    const result = await api.getSupplierLedgerStats(supplierId);
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch supplier ledger stats");
    }
    return result;
  }

  // ✅ NEW: Get all suppliers with ledger stats
  async getAllSupplierLedgerStats() {
    const result = await api.getAllSupplierLedgerStats();
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch all supplier ledger stats");
    }
    return result;
  }

  // ==================== EXPORT ====================
  async exportSuppliers(filters = {}) {
    const result = await api.exportSuppliers(filters);
    if (!result.success) {
      throw new Error(result.error || "Failed to export suppliers");
    }
    return result;
  }
}

const supplierAPI = new SupplierAPI();

// ==================== MAIN COMPONENT ====================
export default function Suppliers() {
  // ==================== STATE ====================
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalCredit: 0,
    totalDebit: 0,
    totalBalance: 0,
    totalPurchases: 0,
    totalPurchasesAmount: 0,
    avgPurchase: 0,
    totalEntries: 0
  });

  // ==================== MODAL STATES ====================
  const [modal, setModal] = useState({ open: false, mode: "add", data: null });
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    cnic: "",
    notes: "",
    credit: 0,
    debit: 0,
    is_active: 1
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: ""
  });

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchQuery, selectedStatus]);

  // ==================== DATA LOADING ====================
  const loadData = async () => {
    setIsLoading(true);
    try {
      // ✅ Get suppliers with ledger stats
      const suppliersResult = await supplierAPI.getAllSupplierLedgerStats();
      if (suppliersResult.success && suppliersResult.data) {
        setSuppliers(suppliersResult.data);
        if (suppliersResult.data.length > 0) {
          setSelectedSupplier(suppliersResult.data[0]);
        }
        calculateStats(suppliersResult.data);
      }
    } catch (err) {
      console.error("Error loading suppliers:", err);
      showNotification("error", err.message || "Failed to load suppliers");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data) => {
    const active = data.filter(s => s.is_active === 1).length;
    const inactive = data.filter(s => s.is_active === 0).length;
    
    // ✅ Use ledger data for financial stats
    const totalCredit = data.reduce((sum, s) => sum + (s.totalCredit || 0), 0);
    const totalDebit = data.reduce((sum, s) => sum + (s.totalDebit || 0), 0);
    const totalPurchases = data.reduce((sum, s) => sum + (s.totalPurchases || 0), 0);
    const totalPurchasesAmount = data.reduce((sum, s) => sum + (s.totalPurchasesAmount || 0), 0);
    const totalEntries = data.reduce((sum, s) => sum + (s.totalEntries || 0), 0);
    const totalBalance = data.reduce((sum, s) => sum + (s.netBalance || 0), 0);
    const avgPurchase = data.length > 0 ? totalPurchasesAmount / data.length : 0;
    
    setStats({
      total: data.length,
      active,
      inactive,
      totalCredit,
      totalDebit,
      totalBalance,
      totalPurchases,
      totalPurchasesAmount,
      avgPurchase,
      totalEntries
    });
  };

  // ==================== FILTERS ====================
  const filterSuppliers = () => {
    let filtered = [...suppliers];

    if (selectedStatus !== "all") {
      filtered = filtered.filter(s => 
        selectedStatus === "active" ? s.is_active === 1 : s.is_active === 0
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(query) ||
        s.phone?.includes(query) ||
        s.email?.toLowerCase().includes(query) ||
        s.cnic?.includes(query)
      );
    }

    setFilteredSuppliers(filtered);
  };

  // ==================== NOTIFICATIONS ====================
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 3000);
  };

  // ==================== FORM VALIDATION ====================
  const validateForm = () => {
    const errors = {};
    if (!form.name || form.name.trim() === "") {
      errors.name = "Supplier name is required";
    } else if (form.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (form.phone && !/^(03\d{2})-?\d{7}$/.test(form.phone)) {
      errors.phone = "Invalid phone format (e.g., 03XX-XXXXXXX)";
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Invalid email format";
    }

    if (form.cnic && !/^\d{5}-?\d{7}-?\d{1}$/.test(form.cnic)) {
      errors.cnic = "Invalid CNIC format (e.g., XXXXX-XXXXXXX-X)";
    }

    if (form.credit && form.credit < 0) {
      errors.credit = "Credit cannot be negative";
    }

    if (form.debit && form.debit < 0) {
      errors.debit = "Debit cannot be negative";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ==================== SUPPLIER CRUD ====================
  const openAddModal = () => {
    setForm({
      name: "",
      phone: "",
      email: "",
      address: "",
      cnic: "",
      notes: "",
      credit: 0,
      debit: 0,
      is_active: 1
    });
    setValidationErrors({});
    setModal({ open: true, mode: "add", data: null });
  };

  const openEditModal = (supplier) => {
    setForm({
      name: supplier.name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      cnic: supplier.cnic || "",
      notes: supplier.notes || "",
      credit: supplier.credit || 0,
      debit: supplier.debit || 0,
      is_active: supplier.is_active || 1
    });
    setValidationErrors({});
    setModal({ open: true, mode: "edit", data: supplier });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const data = {
        name: form.name.trim(),
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        cnic: form.cnic || null,
        notes: form.notes || null,
        credit: form.credit || 0,
        debit: form.debit || 0
      };

      let result;
      if (modal.mode === "add") {
        result = await supplierAPI.createSupplier(data);
        if (result.success) {
          showNotification("success", `Supplier "${form.name}" created successfully`);
        }
      } else {
        result = await supplierAPI.updateSupplier(modal.data.id, data);
        if (result.success) {
          showNotification("success", `Supplier "${form.name}" updated successfully`);
        }
      }

      if (result.success) {
        await loadData();
        setModal({ open: false, mode: "add", data: null });
        setSearchQuery("");
      } else {
        showNotification("error", result.error || "Operation failed");
      }
    } catch (err) {
      console.error("Failed saving supplier:", err);
      showNotification("error", err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Deactivate supplier "${name}"?`)) {
      setIsLoading(true);
      try {
        const result = await supplierAPI.deleteSupplier(id);
        if (result.success) {
          showNotification("success", `Supplier "${name}" deactivated successfully`);
          await loadData();
        } else {
          showNotification("error", result.error || "Failed to deactivate supplier");
        }
      } catch (err) {
        console.error("Failed deleting supplier:", err);
        showNotification("error", err.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // ==================== EXPORT ====================
  const handleExport = async () => {
    try {
      const result = await supplierAPI.exportSuppliers({ is_active: 1 });
      if (result.success && result.data) {
        const headers = ["Name", "Phone", "Email", "Address", "CNIC", "Credit", "Debit", "Balance", "Status"];
        const rows = result.data.map(s => [
          s.name || "",
          s.phone || "",
          s.email || "",
          s.address || "",
          s.cnic || "",
          s.credit || 0,
          s.debit || 0,
          (s.credit || 0) - (s.debit || 0),
          s.is_active ? "Active" : "Inactive"
        ]);

        const csvContent = [
          headers.join(","),
          ...rows.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `suppliers_export_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        showNotification("success", "Suppliers exported successfully!");
      }
    } catch (err) {
      console.error("Export error:", err);
      showNotification("error", "Failed to export suppliers");
    }
  };

  // ==================== HELPERS ====================
  const getStatusBadge = (isActive) => {
    return isActive 
      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
      : "bg-slate-50 text-slate-500 border-slate-200";
  };

  const getStatusIcon = (isActive) => {
    return isActive ? <CheckCircle size={12} /> : <X size={12} />;
  };

  const formatCurrency = (amount) => {
    return `₨${(amount || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const getInitials = (name) => {
    if (!name) return "S";
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (id) => {
    const colors = [
      "from-indigo-500 to-purple-600",
      "from-emerald-500 to-teal-600",
      "from-rose-500 to-red-600",
      "from-amber-500 to-orange-600",
      "from-cyan-500 to-blue-600",
      "from-fuchsia-500 to-pink-600",
      "from-lime-500 to-emerald-600",
      "from-violet-500 to-purple-600"
    ];
    return colors[id % colors.length];
  };

  // ✅ Get balance display with ledger data
  const getBalanceDisplay = (supplier) => {
    const balance = supplier.netBalance || 0;

    if (balance > 0) {
      return {
        text: `We owe supplier`,
        amount: formatCurrency(balance),
        color: "text-rose-600",
        bg: "bg-rose-50",
        border: "border-rose-200",
        icon: <ArrowDownRight size={14} className="text-rose-500" />
      };
    } else if (balance < 0) {
      return {
        text: `Supplier owes us`,
        amount: formatCurrency(Math.abs(balance)),
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: <ArrowUpRight size={14} className="text-emerald-500" />
      };
    } else {
      return {
        text: "Balance Settled",
        amount: formatCurrency(0),
        color: "text-slate-600",
        bg: "bg-slate-50",
        border: "border-slate-200",
        icon: <CheckCircle size={14} className="text-slate-500" />
      };
    }
  };

  // ==================== RENDER ====================
  return (
    <div className="p-3 sm:p-4 bg-gradient-to-br from-indigo-50/50 via-white to-emerald-50/30 min-h-screen">

      {/* ===== NOTIFICATION ===== */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full p-3 rounded-xl shadow-lg animate-slide-down border ${
          notification.type === "success" ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
        }`}>
          <div className="flex items-start gap-2">
            <div className={`mt-0.5 p-1 rounded-full ${notification.type === "success" ? "bg-emerald-100" : "bg-red-100"}`}>
              {notification.type === "success" ? (
                <CheckCircle size={14} className="text-emerald-600" />
              ) : (
                <X size={14} className="text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-xs font-medium ${notification.type === "success" ? "text-emerald-800" : "text-red-800"}`}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification({ show: false, type: "", message: "" })}
              className="text-slate-400 hover:text-slate-600 transition-transform hover:scale-110"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 via-purple-700 to-pink-600 bg-clip-text text-transparent">
            Suppliers Management
          </h1>
          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
            <Building2 size={10} />
            Manage supplier information and view balances from ledger
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
          >
            <Download size={12} />
            Export
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
          >
            <Plus size={12} />
            Add Supplier
          </button>
        </div>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
        {[
          { label: "Total", value: stats.total || 0, icon: Users, color: "from-indigo-500 to-purple-600" },
          { label: "Active", value: stats.active || 0, icon: CheckCircle, color: "from-emerald-500 to-teal-600" },
          { label: "Inactive", value: stats.inactive || 0, icon: X, color: "from-slate-500 to-slate-600" },
          { label: "Total Entries", value: stats.totalEntries || 0, icon: Layers, color: "from-cyan-500 to-blue-600" },
          { label: "Total Credit", value: formatCurrency(stats.totalCredit), icon: CreditIcon, color: "from-amber-500 to-orange-600" },
          { label: "Total Debit", value: formatCurrency(stats.totalDebit), icon: Receipt, color: "from-rose-500 to-red-600" },
          { label: "Net Balance", value: formatCurrency(stats.totalBalance), icon: PiggyBank, color: "from-purple-500 to-pink-600" },
          { label: "Total Purchases", value: stats.totalPurchases || 0, icon: ShoppingBag, color: "from-cyan-500 to-blue-600" },
        ].map((item, index) => (
          <div key={index} className={`bg-white rounded-xl border border-slate-200/60 shadow-sm p-2.5 hover:shadow-md transition-all duration-300 group ${
            index >= 6 ? "hidden sm:block" : ""
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-slate-500 font-medium">{item.label}</span>
              <div className={`p-1 rounded-lg bg-gradient-to-br ${item.color} text-white shadow-lg`}>
                <item.icon size={10} />
              </div>
            </div>
            <p className={`text-sm font-bold ${
              item.label === "Total Credit" ? 'text-amber-600' : 
              item.label === "Total Debit" ? 'text-rose-600' : 
              item.label === "Net Balance" ? 'text-purple-600' :
              item.label === "Active" ? 'text-emerald-600' : 
              'text-slate-800'
            } mt-0.5`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* ===== FILTERS ===== */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm p-3 mb-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7.5 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-32">
            <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white transition-all duration-300 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 size={10} className="animate-spin" />
                Loading...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <CircleDot size={10} className="text-indigo-400" />
                {filteredSuppliers.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ===== SUPPLIER CARDS ===== */}
      {isLoading && !suppliers.length ? (
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-8 text-center">
          <div className="inline-flex items-center gap-2 text-slate-400">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-xs">Loading suppliers...</span>
          </div>
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-3">
            <Building2 size={32} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600">No suppliers found</p>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? "Try adjusting your search" : "Add your first supplier"}
          </p>
          {!searchQuery && (
            <button
              onClick={openAddModal}
              className="mt-3 px-3 py-1.5 text-[10px] font-medium text-white rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <Plus size={12} className="inline mr-1" />
              Add Supplier
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSuppliers.map((supplier, index) => {
            const avatarColor = getAvatarColor(index);
            const initials = getInitials(supplier.name);
            const balanceDisplay = getBalanceDisplay(supplier);
            const isSelected = selectedSupplier?.id === supplier.id;

            return (
              <div
                key={supplier.id}
                onClick={() => setSelectedSupplier(supplier)}
                className={`group bg-white rounded-xl border transition-all duration-300 p-3 hover:-translate-y-1 cursor-pointer ${
                  isSelected 
                    ? 'border-indigo-400 shadow-md bg-indigo-50/30' 
                    : 'border-slate-200/60 shadow-sm hover:shadow-lg hover:border-indigo-300'
                }`}
              >
                <div className="relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-xs shadow-md`}>
                        {initials}
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-700 transition-colors duration-300 max-w-[120px]">
                          {supplier.name}
                        </h3>
                        {supplier.phone && (
                          <p className="text-[9px] text-slate-500 flex items-center gap-1">
                            <Phone size={8} />
                            {supplier.phone}
                          </p>
                        )}
                        {supplier.totalEntries > 0 && (
                          <span className="text-[8px] text-slate-400">
                            {supplier.totalEntries} ledger entries
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-medium rounded-full border ${getStatusBadge(supplier.is_active)}`}>
                      {getStatusIcon(supplier.is_active)}
                      {supplier.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1">
                    {supplier.email && (
                      <p className="text-[9px] text-slate-500 flex items-center gap-1 truncate">
                        <Mail size={8} />
                        {supplier.email}
                      </p>
                    )}
                    {supplier.address && (
                      <p className="text-[9px] text-slate-500 flex items-center gap-1 truncate">
                        <MapPin size={8} />
                        {supplier.address}
                      </p>
                    )}
                    {supplier.cnic && (
                      <p className="text-[9px] text-slate-500 flex items-center gap-1">
                        <Hash size={8} />
                        {supplier.cnic}
                      </p>
                    )}
                  </div>

                  {/* ===== BALANCE DISPLAY ===== */}
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet size={12} className="text-slate-400" />
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-medium border ${balanceDisplay.bg} ${balanceDisplay.color} ${balanceDisplay.border}`}>
                          {balanceDisplay.icon}
                          <span>{balanceDisplay.text}</span>
                          <span className="font-bold">{balanceDisplay.amount}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            showNotification("info", `View ${supplier.name}'s ledger in the Ledger page`);
                          }}
                          className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                          title="View Ledger"
                        >
                          <BookOpen size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(supplier);
                          }}
                          className="p-1 rounded hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={12} />
                        </button>
                        {supplier.is_active === 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(supplier.id, supplier.name);
                            }}
                            className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            title="Deactivate"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* ===== Credit/Debit Breakdown ===== */}
                    <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-slate-50">
                      {(supplier.totalCredit || 0) > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] text-amber-600 font-medium">Credit:</span>
                          <span className="text-[9px] font-semibold text-amber-600">{formatCurrency(supplier.totalCredit)}</span>
                        </div>
                      )}
                      {(supplier.totalDebit || 0) > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] text-rose-600 font-medium">Debit:</span>
                          <span className="text-[9px] font-semibold text-rose-600">{formatCurrency(supplier.totalDebit)}</span>
                        </div>
                      )}
                      {(supplier.totalCredit || 0) === 0 && (supplier.totalDebit || 0) === 0 && (
                        <span className="text-[8px] text-slate-400">No transactions yet</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== SUPPLIER MODAL ===== */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-4 animate-scale-in relative max-h-[90vh] overflow-y-auto">
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${
              modal.mode === "add" ? "from-emerald-400 to-emerald-600" : "from-indigo-400 to-purple-600"
            } rounded-t-xl`} />
            <button
              onClick={() => setModal({ open: false, mode: "add", data: null })}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-transform hover:scale-110"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2.5 mt-1 mb-3">
              <div className={`p-2 rounded-lg ${
                modal.mode === "add" ? "bg-gradient-to-br from-emerald-500 to-emerald-600" : "bg-gradient-to-br from-indigo-500 to-purple-600"
              } text-white shadow-lg`}>
                {modal.mode === "add" ? <Building2 size={16} /> : <Edit3 size={16} />}
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">
                  {modal.mode === "add" ? "Add Supplier" : "Edit Supplier"}
                </h3>
                <p className="text-[10px] text-slate-500">
                  {modal.mode === "add" ? "Create a new supplier" : "Update supplier information"}
                </p>
              </div>
            </div>

            {Object.keys(validationErrors).length > 0 && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-[9px] font-medium text-red-700 mb-0.5 flex items-center gap-1">
                  <AlertCircle size={10} />
                  Please fix the following errors:
                </p>
                <ul className="text-[8px] text-red-600 space-y-0.5">
                  {Object.values(validationErrors).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-2.5 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 bg-white ${
                      validationErrors.name
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100'
                    }`}
                    placeholder="Supplier name"
                  />
                  {validationErrors.name && (
                    <p className="text-[9px] text-red-500 mt-0.5">{validationErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full px-2.5 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 bg-white ${
                      validationErrors.phone
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100'
                    }`}
                    placeholder="03XX-XXXXXXX"
                  />
                  {validationErrors.phone && (
                    <p className="text-[9px] text-red-500 mt-0.5">{validationErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-2.5 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 bg-white ${
                      validationErrors.email
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100'
                    }`}
                    placeholder="supplier@example.com"
                  />
                  {validationErrors.email && (
                    <p className="text-[9px] text-red-500 mt-0.5">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    CNIC
                  </label>
                  <input
                    type="text"
                    value={form.cnic}
                    onChange={(e) => setForm(prev => ({ ...prev, cnic: e.target.value }))}
                    className={`w-full px-2.5 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 bg-white ${
                      validationErrors.cnic
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100'
                    }`}
                    placeholder="XXXXX-XXXXXXX-X"
                  />
                  {validationErrors.cnic && (
                    <p className="text-[9px] text-red-500 mt-0.5">{validationErrors.cnic}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-300 bg-white"
                  placeholder="Enter address"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    Credit (Supplier owes us)
                  </label>
                  <input
                    type="number"
                    value={form.credit}
                    onChange={(e) => setForm(prev => ({ ...prev, credit: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-2.5 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 bg-white ${
                      validationErrors.credit
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100'
                    }`}
                    placeholder="0.00"
                    step="0.01"
                  />
                  {validationErrors.credit && (
                    <p className="text-[9px] text-red-500 mt-0.5">{validationErrors.credit}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    Debit (We owe supplier)
                  </label>
                  <input
                    type="number"
                    value={form.debit}
                    onChange={(e) => setForm(prev => ({ ...prev, debit: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-2.5 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 bg-white ${
                      validationErrors.debit
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100'
                    }`}
                    placeholder="0.00"
                    step="0.01"
                  />
                  {validationErrors.debit && (
                    <p className="text-[9px] text-red-500 mt-0.5">{validationErrors.debit}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-300 bg-white resize-none"
                  placeholder="Additional notes..."
                  rows="2"
                />
              </div>

              {modal.mode === "edit" && (
                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    Status
                  </label>
                  <select
                    value={form.is_active}
                    onChange={(e) => setForm(prev => ({ ...prev, is_active: parseInt(e.target.value) }))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-300 bg-white"
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setModal({ open: false, mode: "add", data: null })}
                  className="px-3 py-1.5 text-[10px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-3 py-1.5 text-[10px] font-medium text-white rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                    modal.mode === "add"
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                  }`}
                >
                  {isLoading ? 'Saving...' : modal.mode === "add" ? 'Add' : 'Update'}
                </button>
              </div>
            </form>
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