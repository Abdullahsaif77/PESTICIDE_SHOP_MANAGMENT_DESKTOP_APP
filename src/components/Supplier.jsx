// src/pages/Suppliers/Suppliers.jsx

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
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
  PiggyBank
} from "lucide-react";

// ==================== MOCK DATA ====================
const MOCK_SUPPLIERS = [
  {
    id: 1,
    name: "ABC Chemicals",
    phone: "0300-1234567",
    email: "abc@chemicals.com",
    address: "Industrial Zone, Lahore",
    cnic: "12345-1234567-1",
    credit: 15000,
    debit: 0,
    is_active: 1,
    purchase_count: 5,
    total_purchases: 125000,
    created_at: "2024-01-15"
  },
  {
    id: 2,
    name: "XYZ Pesticides",
    phone: "0300-7654321",
    email: "info@xyzpest.com",
    address: "Main Road, Faisalabad",
    cnic: "54321-7654321-2",
    credit: 0,
    debit: 0,
    is_active: 1,
    purchase_count: 3,
    total_purchases: 45000,
    created_at: "2024-02-20"
  },
  {
    id: 3,
    name: "Green Agro Supplies",
    phone: "0300-9876543",
    email: "green@agro.com",
    address: "Garden Town, Multan",
    cnic: "98765-4321098-3",
    credit: 0,
    debit: 5000,
    is_active: 0,
    purchase_count: 0,
    total_purchases: 0,
    created_at: "2024-03-10"
  },
  {
    id: 4,
    name: "Premium Fertilizers",
    phone: "0300-5555555",
    email: "premium@fertilizers.com",
    address: "Sheikhupura Road",
    cnic: "11111-2222222-4",
    credit: 25000,
    debit: 0,
    is_active: 1,
    purchase_count: 8,
    total_purchases: 280000,
    created_at: "2024-04-05"
  },
  {
    id: 5,
    name: "Safe Pest Control",
    phone: "0300-4444444",
    email: "safe@pest.com",
    address: "Johar Town, Lahore",
    cnic: "22222-3333333-5",
    credit: 1000,
    debit: 0,
    is_active: 1,
    purchase_count: 2,
    total_purchases: 12000,
    created_at: "2024-05-12"
  },
  {
    id: 6,
    name: "Agro Solutions",
    phone: "0300-3333333",
    email: "agro@solutions.com",
    address: "Gulberg, Lahore",
    cnic: "33333-4444444-6",
    credit: 0,
    debit: 2000,
    is_active: 1,
    purchase_count: 4,
    total_purchases: 68000,
    created_at: "2024-06-18"
  }
];

const MOCK_PURCHASES = {
  1: [
    { id: 1, purchase_number: "PO-001", total_amount: 32000, paid_amount: 32000, due_amount: 0, purchase_date: "2024-01-20" },
    { id: 2, purchase_number: "PO-002", total_amount: 45000, paid_amount: 30000, due_amount: 15000, purchase_date: "2024-02-15" },
    { id: 3, purchase_number: "PO-003", total_amount: 28000, paid_amount: 20000, due_amount: 8000, purchase_date: "2024-03-10" },
    { id: 4, purchase_number: "PO-004", total_amount: 12000, paid_amount: 12000, due_amount: 0, purchase_date: "2024-04-05" },
    { id: 5, purchase_number: "PO-005", total_amount: 8000, paid_amount: 8000, due_amount: 0, purchase_date: "2024-05-20" }
  ],
  2: [
    { id: 6, purchase_number: "PO-006", total_amount: 18000, paid_amount: 18000, due_amount: 0, purchase_date: "2024-02-01" },
    { id: 7, purchase_number: "PO-007", total_amount: 15000, paid_amount: 10000, due_amount: 5000, purchase_date: "2024-03-15" },
    { id: 8, purchase_number: "PO-008", total_amount: 12000, paid_amount: 12000, due_amount: 0, purchase_date: "2024-06-10" }
  ],
  4: [
    { id: 9, purchase_number: "PO-009", total_amount: 45000, paid_amount: 45000, due_amount: 0, purchase_date: "2024-04-10" },
    { id: 10, purchase_number: "PO-010", total_amount: 68000, paid_amount: 50000, due_amount: 18000, purchase_date: "2024-05-15" },
    { id: 11, purchase_number: "PO-011", total_amount: 52000, paid_amount: 52000, due_amount: 0, purchase_date: "2024-06-20" },
    { id: 12, purchase_number: "PO-012", total_amount: 35000, paid_amount: 25000, due_amount: 10000, purchase_date: "2024-07-05" },
    { id: 13, purchase_number: "PO-013", total_amount: 80000, paid_amount: 80000, due_amount: 0, purchase_date: "2024-08-01" }
  ],
  5: [
    { id: 14, purchase_number: "PO-014", total_amount: 7000, paid_amount: 7000, due_amount: 0, purchase_date: "2024-05-20" },
    { id: 15, purchase_number: "PO-015", total_amount: 5000, paid_amount: 5000, due_amount: 0, purchase_date: "2024-07-01" }
  ],
  6: [
    { id: 16, purchase_number: "PO-016", total_amount: 22000, paid_amount: 22000, due_amount: 0, purchase_date: "2024-06-20" },
    { id: 17, purchase_number: "PO-017", total_amount: 18000, paid_amount: 10000, due_amount: 8000, purchase_date: "2024-07-15" },
    { id: 18, purchase_number: "PO-018", total_amount: 15000, paid_amount: 15000, due_amount: 0, purchase_date: "2024-08-10" },
    { id: 19, purchase_number: "PO-019", total_amount: 13000, paid_amount: 8000, due_amount: 5000, purchase_date: "2024-09-01" }
  ]
};

const MOCK_STATS = {
  total: 6,
  active: 5,
  inactive: 1,
  totalCredit: 41000,
  totalDebit: 7000,
  totalBalance: 34000,
  totalPurchases: 18,
  avgPurchase: 40277.78
};

// ==================== API WRAPPER ====================
const api = window.api || {};

class SupplierAPI {
  async createSupplier(data) {
    try {
      const result = await api.createSupplier(data);
      return result;
    } catch (error) {
      const newSupplier = {
        id: Date.now(),
        ...data,
        is_active: 1,
        purchase_count: 0,
        total_purchases: 0,
        created_at: new Date().toISOString()
      };
      MOCK_SUPPLIERS.unshift(newSupplier);
      return { success: true, data: newSupplier };
    }
  }

  async getAllSuppliers(filters = {}) {
    try {
      const result = await api.getAllSuppliers(filters);
      if (result.success && result.data.length > 0) {
        return result;
      }
      return { success: true, data: MOCK_SUPPLIERS };
    } catch (error) {
      return { success: true, data: MOCK_SUPPLIERS };
    }
  }

  async getSupplierById(id) {
    try {
      const result = await api.getSupplierById(id);
      if (result.success) return result;
      const supplier = MOCK_SUPPLIERS.find(s => s.id === id);
      return { success: true, data: supplier };
    } catch (error) {
      const supplier = MOCK_SUPPLIERS.find(s => s.id === id);
      return { success: true, data: supplier };
    }
  }

  async updateSupplier(id, data) {
    try {
      const result = await api.updateSupplier(id, data);
      return result;
    } catch (error) {
      const index = MOCK_SUPPLIERS.findIndex(s => s.id === id);
      if (index !== -1) {
        MOCK_SUPPLIERS[index] = { ...MOCK_SUPPLIERS[index], ...data };
        return { success: true, data: MOCK_SUPPLIERS[index] };
      }
      return { success: false, error: "Supplier not found" };
    }
  }

  async deleteSupplier(id) {
    try {
      const result = await api.deleteSupplier(id);
      return result;
    } catch (error) {
      const index = MOCK_SUPPLIERS.findIndex(s => s.id === id);
      if (index !== -1) {
        MOCK_SUPPLIERS[index].is_active = 0;
        return { success: true, message: "Supplier deactivated" };
      }
      return { success: false, error: "Supplier not found" };
    }
  }

  async getActiveSuppliers() {
    try {
      const result = await api.getActiveSuppliers();
      if (result.success) return result;
      return { success: true, data: MOCK_SUPPLIERS.filter(s => s.is_active === 1) };
    } catch (error) {
      return { success: true, data: MOCK_SUPPLIERS.filter(s => s.is_active === 1) };
    }
  }

  async searchSuppliers(query) {
    try {
      const result = await api.searchSuppliers(query);
      if (result.success) return result;
      const filtered = MOCK_SUPPLIERS.filter(s =>
        s.name?.toLowerCase().includes(query.toLowerCase()) ||
        s.phone?.includes(query) ||
        s.email?.toLowerCase().includes(query)
      );
      return { success: true, data: filtered };
    } catch (error) {
      const filtered = MOCK_SUPPLIERS.filter(s =>
        s.name?.toLowerCase().includes(query.toLowerCase()) ||
        s.phone?.includes(query) ||
        s.email?.toLowerCase().includes(query)
      );
      return { success: true, data: filtered };
    }
  }

  async getSupplierBalance(id) {
    try {
      const result = await api.getSupplierBalance(id);
      return result;
    } catch (error) {
      const supplier = MOCK_SUPPLIERS.find(s => s.id === id);
      const credit = supplier?.credit || 0;
      const debit = supplier?.debit || 0;
      return { success: true, data: { credit, debit, balance: credit - debit } };
    }
  }

  async updateSupplierBalance(id, amount) {
    try {
      const result = await api.updateSupplierBalance(id, amount);
      return result;
    } catch (error) {
      const supplier = MOCK_SUPPLIERS.find(s => s.id === id);
      if (supplier) {
        if (amount >= 0) {
          supplier.credit = (supplier.credit || 0) + amount;
        } else {
          supplier.debit = (supplier.debit || 0) + Math.abs(amount);
        }
        const credit = supplier.credit || 0;
        const debit = supplier.debit || 0;
        return { success: true, data: { credit, debit, balance: credit - debit } };
      }
      return { success: false, error: "Supplier not found" };
    }
  }

  async getSupplierStats() {
    try {
      const result = await api.getSupplierStats();
      if (result.success) return result;
      return { success: true, data: MOCK_STATS };
    } catch (error) {
      return { success: true, data: MOCK_STATS };
    }
  }

  async getSupplierSummary() {
    try {
      const result = await api.getSupplierSummary();
      if (result.success) return result;
      const active = MOCK_SUPPLIERS.filter(s => s.is_active === 1).length;
      const inactive = MOCK_SUPPLIERS.filter(s => s.is_active === 0).length;
      const totalCredit = MOCK_SUPPLIERS.reduce((sum, s) => sum + (s.credit || 0), 0);
      const totalDebit = MOCK_SUPPLIERS.reduce((sum, s) => sum + (s.debit || 0), 0);
      return {
        success: true,
        data: {
          total: MOCK_SUPPLIERS.length,
          active,
          inactive,
          totalCredit,
          totalDebit,
          totalBalance: totalCredit - totalDebit,
          totalPurchases: MOCK_STATS.totalPurchases,
          avgPurchase: MOCK_STATS.avgPurchase
        }
      };
    } catch (error) {
      const active = MOCK_SUPPLIERS.filter(s => s.is_active === 1).length;
      const inactive = MOCK_SUPPLIERS.filter(s => s.is_active === 0).length;
      const totalCredit = MOCK_SUPPLIERS.reduce((sum, s) => sum + (s.credit || 0), 0);
      const totalDebit = MOCK_SUPPLIERS.reduce((sum, s) => sum + (s.debit || 0), 0);
      return {
        success: true,
        data: {
          total: MOCK_SUPPLIERS.length,
          active,
          inactive,
          totalCredit,
          totalDebit,
          totalBalance: totalCredit - totalDebit,
          totalPurchases: MOCK_STATS.totalPurchases,
          avgPurchase: MOCK_STATS.avgPurchase
        }
      };
    }
  }

  async getSupplierPurchases(id) {
    try {
      const result = await api.getSupplierPurchases(id);
      if (result.success && result.data.length > 0) {
        return result;
      }
      const purchases = MOCK_PURCHASES[id] || [];
      return { success: true, data: purchases };
    } catch (error) {
      const purchases = MOCK_PURCHASES[id] || [];
      return { success: true, data: purchases };
    }
  }

  async exportSuppliers(filters = {}) {
    try {
      const result = await api.exportSuppliers(filters);
      if (result.success) return result;
      const data = MOCK_SUPPLIERS.filter(s => filters.is_active === undefined || s.is_active === filters.is_active);
      return { success: true, data };
    } catch (error) {
      const data = MOCK_SUPPLIERS.filter(s => filters.is_active === undefined || s.is_active === filters.is_active);
      return { success: true, data };
    }
  }
}

const supplierAPI = new SupplierAPI();

export default function Suppliers() {
  // ==================== STATE ====================
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalCredit: 0,
    totalDebit: 0,
    totalBalance: 0,
    totalPurchases: 0,
    avgPurchase: 0
  });
  const [isUsingMock, setIsUsingMock] = useState(true);

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
  
  const [balanceModal, setBalanceModal] = useState({
    open: false,
    supplier: null
  });
  const [balanceForm, setBalanceForm] = useState({
    amount: 0,
    type: "credit"
  });

  const [detailModal, setDetailModal] = useState({
    open: false,
    supplier: null,
    purchases: []
  });

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
      const suppliersResult = await supplierAPI.getAllSuppliers();
      if (suppliersResult.success) {
        setSuppliers(suppliersResult.data || []);
        if (suppliersResult.data && suppliersResult.data.length > 0) {
          setIsUsingMock(suppliersResult.data[0].id > 1000 || suppliersResult.data[0].id === 1);
        }
      }

      const summaryResult = await supplierAPI.getSupplierSummary();
      if (summaryResult.success) {
        setStats(summaryResult.data);
      }
    } catch (err) {
      console.error("Error loading suppliers:", err);
      showNotification("error", "Failed to load suppliers");
    } finally {
      setIsLoading(false);
    }
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

  // ==================== BALANCE MANAGEMENT ====================
  const openBalanceModal = (supplier) => {
    setBalanceForm({ amount: 0, type: "credit" });
    setBalanceModal({ open: true, supplier });
  };

  const handleBalanceUpdate = async (e) => {
    e.preventDefault();
    if (!balanceForm.amount || balanceForm.amount <= 0) {
      showNotification("error", "Amount must be greater than 0");
      return;
    }

    setIsLoading(true);
    try {
      let result;
      if (balanceForm.type === "credit") {
        result = await supplierAPI.updateSupplierBalance(balanceModal.supplier.id, parseFloat(balanceForm.amount));
      } else {
        result = await supplierAPI.updateSupplierBalance(balanceModal.supplier.id, -parseFloat(balanceForm.amount));
      }

      if (result.success) {
        showNotification("success", `${balanceForm.type.charAt(0).toUpperCase() + balanceForm.type.slice(1)} updated successfully`);
        await loadData();
        setBalanceModal({ open: false, supplier: null });
      } else {
        showNotification("error", result.error || "Failed to update balance");
      }
    } catch (err) {
      console.error("Failed updating balance:", err);
      showNotification("error", err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== DETAIL VIEW ====================
  const openDetailModal = async (supplier) => {
    setIsLoading(true);
    try {
      const [detailResult, purchasesResult] = await Promise.all([
        supplierAPI.getSupplierById(supplier.id),
        supplierAPI.getSupplierPurchases(supplier.id)
      ]);

      const supplierData = detailResult.success ? detailResult.data : supplier;
      const purchases = purchasesResult.success ? purchasesResult.data : [];

      setDetailModal({
        open: true,
        supplier: supplierData,
        purchases: purchases
      });
    } catch (err) {
      console.error("Failed loading supplier details:", err);
      showNotification("error", "Failed to load supplier details");
    } finally {
      setIsLoading(false);
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
            Manage supplier relationships, credit, and debit
            {isUsingMock && (
              <span className="ml-2 text-[7px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <Database size={8} />
                Mock Data
              </span>
            )}
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
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
        {[
          { label: "Total", value: stats.total || 0, icon: Users, color: "from-indigo-500 to-purple-600" },
          { label: "Active", value: stats.active || 0, icon: CheckCircle, color: "from-emerald-500 to-teal-600" },
          { label: "Inactive", value: stats.inactive || 0, icon: X, color: "from-slate-500 to-slate-600" },
          { label: "Total Credit", value: formatCurrency(stats.totalCredit), icon: CreditIcon, color: "from-amber-500 to-orange-600" },
          { label: "Total Debit", value: formatCurrency(stats.totalDebit), icon: Receipt, color: "from-rose-500 to-red-600" },
          { label: "Net Balance", value: formatCurrency(stats.totalBalance), icon: PiggyBank, color: "from-purple-500 to-pink-600" },
          { label: "Purchases", value: stats.totalPurchases || 0, icon: TrendingUp, color: "from-blue-500 to-cyan-600" },
          { label: "Avg Purchase", value: formatCurrency(stats.avgPurchase), icon: BarChart3, color: "from-cyan-500 to-blue-600" }
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
              item.label === "Avg Purchase" ? 'text-cyan-600' : 
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
                <span className="w-2.5 h-2.5 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
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

      {/* ===== SUPPLIER LIST ===== */}
      {isLoading && !suppliers.length ? (
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-8 text-center">
          <div className="inline-flex items-center gap-2 text-slate-400">
            <span className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-xs">Loading suppliers...</span>
          </div>
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-3">
            <Users size={32} className="text-slate-400" />
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
            const balance = (supplier.credit || 0) - (supplier.debit || 0);
            const isPositive = balance > 0;
            const isNegative = balance < 0;

            return (
              <div
                key={supplier.id}
                className="group bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 p-3 hover:-translate-y-1 hover:border-indigo-300"
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

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-[7px] text-slate-400 uppercase font-medium">Balance</p>
                        <div className="flex items-center gap-0.5">
                          {isPositive && <ArrowUpRight size={10} className="text-amber-500" />}
                          {isNegative && <ArrowDownRight size={10} className="text-emerald-500" />}
                          <p className={`text-xs font-bold ${
                            isPositive ? 'text-amber-600' : 
                            isNegative ? 'text-emerald-600' : 
                            'text-slate-600'
                          }`}>
                            {formatCurrency(balance)}
                          </p>
                        </div>
                      </div>
                      {supplier.purchase_count > 0 && (
                        <div>
                          <p className="text-[7px] text-slate-400 uppercase font-medium">Purchases</p>
                          <p className="text-xs font-bold text-slate-700">{supplier.purchase_count}</p>
                        </div>
                      )}
                      {supplier.total_purchases > 0 && (
                        <div>
                          <p className="text-[7px] text-slate-400 uppercase font-medium">Total</p>
                          <p className="text-xs font-bold text-slate-700">{formatCurrency(supplier.total_purchases)}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => openDetailModal(supplier)}
                        className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => openBalanceModal(supplier)}
                        className="p-1 rounded hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"
                        title="Update Balance"
                      >
                        <Wallet size={12} />
                      </button>
                      <button
                        onClick={() => openEditModal(supplier)}
                        className="p-1 rounded hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Edit"
                      >
                        <Edit3 size={12} />
                      </button>
                      {supplier.is_active === 1 && (
                        <button
                          onClick={() => handleDelete(supplier.id, supplier.name)}
                          className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                          title="Deactivate"
                        >
                          <Trash2 size={12} />
                        </button>
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
                {modal.mode === "add" ? <Users size={16} /> : <Edit3 size={16} />}
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
                    Credit
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
                    Debit
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

      {/* ===== BALANCE MODAL ===== */}
      {balanceModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-4 animate-scale-in relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-600 rounded-t-xl" />
            <button
              onClick={() => setBalanceModal({ open: false, supplier: null })}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-transform hover:scale-110"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2.5 mt-1 mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
                <Wallet size={16} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">Update Balance</h3>
                <p className="text-[10px] text-slate-500">
                  {balanceModal.supplier?.name} - Credit: {formatCurrency(balanceModal.supplier?.credit || 0)} | Debit: {formatCurrency(balanceModal.supplier?.debit || 0)}
                </p>
              </div>
            </div>

            <form onSubmit={handleBalanceUpdate} className="space-y-2.5">
              <div>
                <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  Transaction Type
                </label>
                <select
                  value={balanceForm.type}
                  onChange={(e) => setBalanceForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all duration-300 bg-white"
                >
                  <option value="credit">Credit (Supplier owes us)</option>
                  <option value="debit">Debit (We owe supplier)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  Amount *
                </label>
                <input
                  type="number"
                  value={balanceForm.amount}
                  onChange={(e) => setBalanceForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all duration-300 bg-white"
                  placeholder="Enter amount"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setBalanceModal({ open: false, supplier: null })}
                  className="px-3 py-1.5 text-[10px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-3 py-1.5 text-[10px] font-medium text-white rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  {isLoading ? 'Processing...' : 'Update Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== DETAIL MODAL ===== */}
      {detailModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-4 animate-scale-in relative max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-t-xl" />
            <button
              onClick={() => setDetailModal({ open: false, supplier: null, purchases: [] })}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-transform hover:scale-110"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2.5 mt-1 mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                <Users size={16} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">{detailModal.supplier?.name}</h3>
                <p className="text-[10px] text-slate-500">Supplier Details & Purchase History</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mb-3">
              <div className="bg-amber-50 rounded-lg p-2.5">
                <p className="text-[7px] text-amber-600 uppercase font-medium">Credit</p>
                <p className="text-sm font-bold text-amber-600">{formatCurrency(detailModal.supplier?.credit)}</p>
              </div>
              <div className="bg-rose-50 rounded-lg p-2.5">
                <p className="text-[7px] text-rose-600 uppercase font-medium">Debit</p>
                <p className="text-sm font-bold text-rose-600">{formatCurrency(detailModal.supplier?.debit)}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-2.5">
                <p className="text-[7px] text-purple-600 uppercase font-medium">Balance</p>
                <p className={`text-sm font-bold ${(detailModal.supplier?.credit || 0) > (detailModal.supplier?.debit || 0) ? 'text-amber-600' : (detailModal.supplier?.debit || 0) > (detailModal.supplier?.credit || 0) ? 'text-rose-600' : 'text-slate-600'}`}>
                  {formatCurrency((detailModal.supplier?.credit || 0) - (detailModal.supplier?.debit || 0))}
                </p>
              </div>
            </div>

            {(detailModal.supplier?.phone || detailModal.supplier?.email || detailModal.supplier?.address) && (
              <div className="bg-indigo-50/50 rounded-lg p-2.5 mb-3 space-y-0.5 border border-indigo-100">
                {detailModal.supplier?.phone && (
                  <p className="text-[10px] text-slate-600 flex items-center gap-2">
                    <Phone size={10} className="text-indigo-400" />
                    {detailModal.supplier.phone}
                  </p>
                )}
                {detailModal.supplier?.email && (
                  <p className="text-[10px] text-slate-600 flex items-center gap-2">
                    <Mail size={10} className="text-indigo-400" />
                    {detailModal.supplier.email}
                  </p>
                )}
                {detailModal.supplier?.address && (
                  <p className="text-[10px] text-slate-600 flex items-center gap-2">
                    <MapPin size={10} className="text-indigo-400" />
                    {detailModal.supplier.address}
                  </p>
                )}
              </div>
            )}

            <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <FileText size={12} className="text-indigo-500" />
              Purchase History
            </h4>

            {detailModal.purchases.length === 0 ? (
              <div className="text-center py-4 bg-slate-50 rounded-lg">
                <p className="text-[10px] text-slate-400">No purchase history available</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-slate-500">PO#</th>
                      <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-slate-500">Date</th>
                      <th className="px-2 py-1.5 text-right text-[9px] font-semibold text-slate-500">Amount</th>
                      <th className="px-2 py-1.5 text-right text-[9px] font-semibold text-slate-500">Paid</th>
                      <th className="px-2 py-1.5 text-right text-[9px] font-semibold text-slate-500">Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detailModal.purchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-indigo-50/30 transition-colors duration-200">
                        <td className="px-2 py-1.5 text-[10px] font-medium text-slate-700">{purchase.purchase_number}</td>
                        <td className="px-2 py-1.5 text-[10px] text-slate-500">{formatDate(purchase.purchase_date)}</td>
                        <td className="px-2 py-1.5 text-[10px] text-right font-medium text-slate-700">
                          {formatCurrency(purchase.total_amount)}
                        </td>
                        <td className="px-2 py-1.5 text-[10px] text-right text-emerald-600">
                          {formatCurrency(purchase.paid_amount || 0)}
                        </td>
                        <td className="px-2 py-1.5 text-[10px] text-right text-amber-600">
                          {formatCurrency(purchase.due_amount || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
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
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}