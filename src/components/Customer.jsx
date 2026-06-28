// src/pages/Customers/Customers.jsx

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
  ArrowUpRight,
  ArrowDownRight,
  CircleDot,
  Hash,
  ShoppingBag,
  UserCircle,
  CreditCard,
  Award,
  Clock,
  Star,
  Activity,
  BadgeCheck,
  UserCheck,
  UserX
} from "lucide-react";

// ==================== MOCK DATA ====================
const MOCK_CUSTOMERS = [
  {
    id: 1,
    name: "Ali Ahmad",
    phone: "0300-1111111",
    email: "ali@example.com",
    address: "Johar Town, Lahore",
    cnic: "12345-1111111-1",
    balance: 5000,
    credit_limit: 10000,
    is_active: 1,
    sales_count: 12,
    total_sales: 45000,
    created_at: "2024-01-15"
  },
  {
    id: 2,
    name: "Sana Khan",
    phone: "0300-2222222",
    email: "sana@example.com",
    address: "Gulberg, Lahore",
    cnic: "12345-2222222-2",
    balance: -2000,
    credit_limit: 5000,
    is_active: 1,
    sales_count: 8,
    total_sales: 28000,
    created_at: "2024-02-20"
  },
  {
    id: 3,
    name: "Usman Ali",
    phone: "0300-3333333",
    email: "usman@example.com",
    address: "Model Town, Lahore",
    cnic: "12345-3333333-3",
    balance: 0,
    credit_limit: 15000,
    is_active: 0,
    sales_count: 0,
    total_sales: 0,
    created_at: "2024-03-10"
  },
  {
    id: 4,
    name: "Fatima Noor",
    phone: "0300-4444444",
    email: "fatima@example.com",
    address: "Defence, Lahore",
    cnic: "12345-4444444-4",
    balance: 12000,
    credit_limit: 20000,
    is_active: 1,
    sales_count: 20,
    total_sales: 95000,
    created_at: "2024-04-05"
  },
  {
    id: 5,
    name: "Imran Khan",
    phone: "0300-5555555",
    email: "imran@example.com",
    address: "Bahria Town, Lahore",
    cnic: "12345-5555555-5",
    balance: 3000,
    credit_limit: 8000,
    is_active: 1,
    sales_count: 6,
    total_sales: 18000,
    created_at: "2024-05-12"
  },
  {
    id: 6,
    name: "Ayesha Malik",
    phone: "0300-6666666",
    email: "ayesha@example.com",
    address: "Garden Town, Lahore",
    cnic: "12345-6666666-6",
    balance: -1000,
    credit_limit: 3000,
    is_active: 1,
    sales_count: 4,
    total_sales: 12000,
    created_at: "2024-06-18"
  }
];

const MOCK_SALES = {
  1: [
    { id: 1, invoice_number: "INV-001", total_amount: 5000, paid_amount: 5000, due_amount: 0, sale_date: "2024-01-20" },
    { id: 2, invoice_number: "INV-002", total_amount: 8000, paid_amount: 5000, due_amount: 3000, sale_date: "2024-02-15" },
    { id: 3, invoice_number: "INV-003", total_amount: 12000, paid_amount: 10000, due_amount: 2000, sale_date: "2024-03-10" }
  ],
  2: [
    { id: 4, invoice_number: "INV-004", total_amount: 6000, paid_amount: 6000, due_amount: 0, sale_date: "2024-02-01" },
    { id: 5, invoice_number: "INV-005", total_amount: 9000, paid_amount: 7000, due_amount: 2000, sale_date: "2024-03-15" },
    { id: 6, invoice_number: "INV-006", total_amount: 13000, paid_amount: 13000, due_amount: 0, sale_date: "2024-06-10" }
  ],
  4: [
    { id: 7, invoice_number: "INV-007", total_amount: 15000, paid_amount: 15000, due_amount: 0, sale_date: "2024-04-10" },
    { id: 8, invoice_number: "INV-008", total_amount: 22000, paid_amount: 20000, due_amount: 2000, sale_date: "2024-05-15" },
    { id: 9, invoice_number: "INV-009", total_amount: 18000, paid_amount: 18000, due_amount: 0, sale_date: "2024-06-20" },
    { id: 10, invoice_number: "INV-010", total_amount: 25000, paid_amount: 22000, due_amount: 3000, sale_date: "2024-07-05" },
    { id: 11, invoice_number: "INV-011", total_amount: 15000, paid_amount: 15000, due_amount: 0, sale_date: "2024-08-01" }
  ],
  5: [
    { id: 12, invoice_number: "INV-012", total_amount: 8000, paid_amount: 8000, due_amount: 0, sale_date: "2024-05-20" },
    { id: 13, invoice_number: "INV-013", total_amount: 10000, paid_amount: 8000, due_amount: 2000, sale_date: "2024-07-01" }
  ],
  6: [
    { id: 14, invoice_number: "INV-014", total_amount: 5000, paid_amount: 5000, due_amount: 0, sale_date: "2024-06-20" },
    { id: 15, invoice_number: "INV-015", total_amount: 7000, paid_amount: 5000, due_amount: 2000, sale_date: "2024-07-15" }
  ]
};

const MOCK_STATS = {
  total: 6,
  active: 5,
  inactive: 1,
  totalBalance: 17000,
  totalSales: 28,
  totalSalesAmount: 198000,
  avgSalesPerCustomer: 33000
};

// ==================== API WRAPPER ====================
const api = window.api || {};

class CustomerAPI {
  async createCustomer(data) {
    try {
      const result = await api.createCustomer(data);
      return result;
    } catch (error) {
      const newCustomer = {
        id: Date.now(),
        ...data,
        is_active: 1,
        sales_count: 0,
        total_sales: 0,
        created_at: new Date().toISOString()
      };
      MOCK_CUSTOMERS.unshift(newCustomer);
      return { success: true, data: newCustomer };
    }
  }

  async getAllCustomers(filters = {}) {
    try {
      const result = await api.getAllCustomers(filters);
      if (result.success && result.data.length > 0) {
        return result;
      }
      return { success: true, data: MOCK_CUSTOMERS };
    } catch (error) {
      return { success: true, data: MOCK_CUSTOMERS };
    }
  }

  async getCustomerById(id) {
    try {
      const result = await api.getCustomerById(id);
      if (result.success) return result;
      const customer = MOCK_CUSTOMERS.find(c => c.id === id);
      return { success: true, data: customer };
    } catch (error) {
      const customer = MOCK_CUSTOMERS.find(c => c.id === id);
      return { success: true, data: customer };
    }
  }

  async updateCustomer(id, data) {
    try {
      const result = await api.updateCustomer(id, data);
      return result;
    } catch (error) {
      const index = MOCK_CUSTOMERS.findIndex(c => c.id === id);
      if (index !== -1) {
        MOCK_CUSTOMERS[index] = { ...MOCK_CUSTOMERS[index], ...data };
        return { success: true, data: MOCK_CUSTOMERS[index] };
      }
      return { success: false, error: "Customer not found" };
    }
  }

  async deleteCustomer(id) {
    try {
      const result = await api.deleteCustomer(id);
      return result;
    } catch (error) {
      const index = MOCK_CUSTOMERS.findIndex(c => c.id === id);
      if (index !== -1) {
        MOCK_CUSTOMERS[index].is_active = 0;
        return { success: true, message: "Customer deactivated" };
      }
      return { success: false, error: "Customer not found" };
    }
  }

  async getActiveCustomers() {
    try {
      const result = await api.getActiveCustomers();
      if (result.success) return result;
      return { success: true, data: MOCK_CUSTOMERS.filter(c => c.is_active === 1) };
    } catch (error) {
      return { success: true, data: MOCK_CUSTOMERS.filter(c => c.is_active === 1) };
    }
  }

  async searchCustomers(query) {
    try {
      const result = await api.searchCustomers(query);
      if (result.success) return result;
      const filtered = MOCK_CUSTOMERS.filter(c =>
        c.name?.toLowerCase().includes(query.toLowerCase()) ||
        c.phone?.includes(query) ||
        c.email?.toLowerCase().includes(query)
      );
      return { success: true, data: filtered };
    } catch (error) {
      const filtered = MOCK_CUSTOMERS.filter(c =>
        c.name?.toLowerCase().includes(query.toLowerCase()) ||
        c.phone?.includes(query) ||
        c.email?.toLowerCase().includes(query)
      );
      return { success: true, data: filtered };
    }
  }

  async getCustomerBalance(id) {
    try {
      const result = await api.getCustomerBalance(id);
      return result;
    } catch (error) {
      const customer = MOCK_CUSTOMERS.find(c => c.id === id);
      return { success: true, data: { balance: customer?.balance || 0 } };
    }
  }

  async updateCustomerBalance(id, amount) {
    try {
      const result = await api.updateCustomerBalance(id, amount);
      return result;
    } catch (error) {
      const customer = MOCK_CUSTOMERS.find(c => c.id === id);
      if (customer) {
        customer.balance = (customer.balance || 0) + amount;
        return { success: true, data: { newBalance: customer.balance } };
      }
      return { success: false, error: "Customer not found" };
    }
  }

  async getCustomerStats() {
    try {
      const result = await api.getCustomerStats();
      if (result.success) return result;
      return { success: true, data: MOCK_STATS };
    } catch (error) {
      return { success: true, data: MOCK_STATS };
    }
  }

  async getTopCustomers(limit = 5) {
    try {
      const result = await api.getTopCustomers(limit);
      if (result.success) return result;
      const sorted = [...MOCK_CUSTOMERS].sort((a, b) => (b.total_sales || 0) - (a.total_sales || 0));
      return { success: true, data: sorted.slice(0, limit) };
    } catch (error) {
      const sorted = [...MOCK_CUSTOMERS].sort((a, b) => (b.total_sales || 0) - (a.total_sales || 0));
      return { success: true, data: sorted.slice(0, limit) };
    }
  }

  async getCustomerWithSales(id) {
    try {
      const result = await api.getCustomerWithSales(id);
      if (result.success) return result;
      const customer = MOCK_CUSTOMERS.find(c => c.id === id);
      const sales = MOCK_SALES[id] || [];
      return { success: true, data: { customer, sales } };
    } catch (error) {
      const customer = MOCK_CUSTOMERS.find(c => c.id === id);
      const sales = MOCK_SALES[id] || [];
      return { success: true, data: { customer, sales } };
    }
  }

  async exportCustomers(filters = {}) {
    try {
      const result = await api.exportCustomers(filters);
      if (result.success) return result;
      const data = MOCK_CUSTOMERS.filter(c => filters.is_active === undefined || c.is_active === filters.is_active);
      return { success: true, data };
    } catch (error) {
      const data = MOCK_CUSTOMERS.filter(c => filters.is_active === undefined || c.is_active === filters.is_active);
      return { success: true, data };
    }
  }
}

const customerAPI = new CustomerAPI();

export default function Customers() {
  // ==================== STATE ====================
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalBalance: 0,
    totalSales: 0,
    totalSalesAmount: 0,
    avgSalesPerCustomer: 0
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
    balance: 0,
    credit_limit: 0,
    is_active: 1
  });
  const [validationErrors, setValidationErrors] = useState({});
  
  const [balanceModal, setBalanceModal] = useState({
    open: false,
    customer: null
  });
  const [balanceForm, setBalanceForm] = useState({
    amount: 0,
    type: "add"
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
    filterCustomers();
  }, [customers, searchQuery, selectedStatus]);

  // ==================== DATA LOADING ====================
  // ==================== DATA LOADING ====================
const loadData = async () => {
  setIsLoading(true);
  try {
    const customersResult = await customerAPI.getAllCustomers();
    if (customersResult.success) {
      setCustomers(customersResult.data || []);
      if (customersResult.data && customersResult.data.length > 0) {
        setIsUsingMock(customersResult.data[0].id > 1000 || customersResult.data[0].id === 1);
      }
      // Select first customer by default
      if (customersResult.data && customersResult.data.length > 0) {
        setSelectedCustomer(customersResult.data[0]);
      }
      
      // Calculate stats from the data
      const data = customersResult.data || [];
      const active = data.filter(c => c.is_active === 1).length;
      const inactive = data.filter(c => c.is_active === 0).length;
      const totalBalance = data.reduce((sum, c) => sum + (c.balance || 0), 0);
      const totalSales = data.reduce((sum, c) => sum + (c.sales_count || 0), 0);
      const totalSalesAmount = data.reduce((sum, c) => sum + (c.total_sales || 0), 0);
      const avgSalesPerCustomer = data.length > 0 ? totalSalesAmount / data.length : 0;
      
      setStats({
        total: data.length,
        active,
        inactive,
        totalBalance,
        totalSales,
        totalSalesAmount,
        avgSalesPerCustomer
      });
    } else {
      // Fallback to mock stats
      setStats({
        total: MOCK_STATS.total || 0,
        active: MOCK_STATS.active || 0,
        inactive: MOCK_STATS.inactive || 0,
        totalBalance: MOCK_STATS.totalBalance || 0,
        totalSales: MOCK_STATS.totalSales || 0,
        totalSalesAmount: MOCK_STATS.totalSalesAmount || 0,
        avgSalesPerCustomer: MOCK_STATS.avgSalesPerCustomer || 0
      });
    }
  } catch (err) {
    console.error("Error loading customers:", err);
    showNotification("error", "Failed to load customers");
    // Fallback to mock stats
    setStats({
      total: MOCK_STATS.total || 0,
      active: MOCK_STATS.active || 0,
      inactive: MOCK_STATS.inactive || 0,
      totalBalance: MOCK_STATS.totalBalance || 0,
      totalSales: MOCK_STATS.totalSales || 0,
      totalSalesAmount: MOCK_STATS.totalSalesAmount || 0,
      avgSalesPerCustomer: MOCK_STATS.avgSalesPerCustomer || 0
    });
  } finally {
    setIsLoading(false);
  }
};

  // ==================== FILTERS ====================
  const filterCustomers = () => {
    let filtered = [...customers];

    if (selectedStatus !== "all") {
      filtered = filtered.filter(c => 
        selectedStatus === "active" ? c.is_active === 1 : c.is_active === 0
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(c =>
        c.name?.toLowerCase().includes(query) ||
        c.phone?.includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.cnic?.includes(query)
      );
    }

    setFilteredCustomers(filtered);
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
      errors.name = "Customer name is required";
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

    if (form.credit_limit && form.credit_limit < 0) {
      errors.credit_limit = "Credit limit cannot be negative";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ==================== CUSTOMER CRUD ====================
  const openAddModal = () => {
    setForm({
      name: "",
      phone: "",
      email: "",
      address: "",
      cnic: "",
      notes: "",
      balance: 0,
      credit_limit: 0,
      is_active: 1
    });
    setValidationErrors({});
    setModal({ open: true, mode: "add", data: null });
  };

  const openEditModal = (customer) => {
    setForm({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      cnic: customer.cnic || "",
      notes: customer.notes || "",
      balance: customer.balance || 0,
      credit_limit: customer.credit_limit || 0,
      is_active: customer.is_active || 1
    });
    setValidationErrors({});
    setModal({ open: true, mode: "edit", data: customer });
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
        balance: form.balance || 0,
        credit_limit: form.credit_limit || 0
      };

      let result;
      if (modal.mode === "add") {
        result = await customerAPI.createCustomer(data);
        if (result.success) {
          showNotification("success", `Customer "${form.name}" created successfully`);
        }
      } else {
        result = await customerAPI.updateCustomer(modal.data.id, data);
        if (result.success) {
          showNotification("success", `Customer "${form.name}" updated successfully`);
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
      console.error("Failed saving customer:", err);
      showNotification("error", err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Deactivate customer "${name}"?`)) {
      setIsLoading(true);
      try {
        const result = await customerAPI.deleteCustomer(id);
        if (result.success) {
          showNotification("success", `Customer "${name}" deactivated successfully`);
          await loadData();
        } else {
          showNotification("error", result.error || "Failed to deactivate customer");
        }
      } catch (err) {
        console.error("Failed deleting customer:", err);
        showNotification("error", err.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // ==================== BALANCE MANAGEMENT ====================
  const openBalanceModal = (customer) => {
    setBalanceForm({ amount: 0, type: "add" });
    setBalanceModal({ open: true, customer });
  };

  const handleBalanceUpdate = async (e) => {
    e.preventDefault();
    if (!balanceForm.amount || balanceForm.amount <= 0) {
      showNotification("error", "Amount must be greater than 0");
      return;
    }

    setIsLoading(true);
    try {
      const amount = balanceForm.type === "add" 
        ? parseFloat(balanceForm.amount) 
        : -parseFloat(balanceForm.amount);

      const result = await customerAPI.updateCustomerBalance(balanceModal.customer.id, amount);
      if (result.success) {
        showNotification("success", `Balance updated successfully`);
        await loadData();
        setBalanceModal({ open: false, customer: null });
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
    if (!name) return "C";
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (id) => {
    const colors = [
      "from-blue-500 to-indigo-600",
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
    <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 min-h-screen">

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
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-600 bg-clip-text text-transparent">
            Customers Managment
          </h1>
          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
            <Users size={10} />
            Manage customer relationships and balances
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
            onClick={() => {
              setIsUsingMock(!isUsingMock);
              loadData();
            }}
            className="text-[8px] px-2 py-1 rounded-lg border bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
          >
            {isUsingMock ? "📊 Mock" : "🔴 Live"}
          </button>
          <button
            onClick={async () => {
              const result = await customerAPI.exportCustomers({ is_active: 1 });
              if (result.success && result.data) {
                const headers = ["Name", "Phone", "Email", "Address", "CNIC", "Balance", "Credit Limit", "Status"];
                const rows = result.data.map(c => [
                  c.name || "",
                  c.phone || "",
                  c.email || "",
                  c.address || "",
                  c.cnic || "",
                  c.balance || 0,
                  c.credit_limit || 0,
                  c.is_active ? "Active" : "Inactive"
                ]);
                const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
                const blob = new Blob([csvContent], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `customers_export_${new Date().toISOString().split("T")[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
                showNotification("success", "Customers exported successfully!");
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-slate-600 to-slate-700"
          >
            <Download size={12} />
            Export
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-blue-500 to-indigo-600"
          >
            <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600"
          >
            <Plus size={12} />
            Add Customer
          </button>
        </div>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
        {[
          { label: "Total", value: stats.total || 0, icon: Users, color: "from-blue-500 to-indigo-600" },
          { label: "Active", value: stats.active || 0, icon: UserCheck, color: "from-emerald-500 to-teal-600" },
          { label: "Inactive", value: stats.inactive || 0, icon: UserX, color: "from-slate-500 to-slate-600" },
          { label: "Total Balance", value: formatCurrency(stats.totalBalance), icon: Wallet, color: "from-amber-500 to-orange-600" },
          { label: "Total Sales", value: stats.totalSales || 0, icon: ShoppingBag, color: "from-purple-500 to-pink-600" },
          { label: "Avg Sales", value: formatCurrency(stats.avgSalesPerCustomer), icon: Activity, color: "from-cyan-500 to-blue-600" }
        ].map((item, index) => (
          <div key={index} className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-2.5 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-slate-500 font-medium">{item.label}</span>
              <div className={`p-1 rounded-lg bg-gradient-to-br ${item.color} text-white shadow-lg`}>
                <item.icon size={10} />
              </div>
            </div>
            <p className={`text-sm font-bold ${item.label === "Total Balance" ? 'text-amber-600' : item.label === "Active" ? 'text-emerald-600' : item.label === "Avg Sales" ? 'text-cyan-600' : 'text-slate-800'} mt-0.5`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* ===== MAIN LAYOUT: Table + Detail Sidebar ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* LEFT: Customer Table */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm p-3 mb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="relative flex-1 w-full">
                
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7.5 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white transition-all duration-300"
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
                  className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white transition-all duration-300 appearance-none"
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
                    <span className="w-2.5 h-2.5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <CircleDot size={10} className="text-blue-400" />
                    {filteredCustomers.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
            {isLoading && !customers.length ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2 text-slate-400">
                  <span className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                  <span className="text-xs">Loading customers...</span>
                </div>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-3">
                  <Users size={32} className="text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">No customers found</p>
                <p className="text-xs text-slate-400 mt-1">
                  {searchQuery ? "Try adjusting your search" : "Add your first customer"}
                </p>
                {!searchQuery && (
                  <button
                    onClick={openAddModal}
                    className="mt-3 px-3 py-1.5 text-[10px] font-medium text-white rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600"
                  >
                    <Plus size={12} className="inline mr-1" />
                    Add Customer
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                      <th className="px-3 py-2 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Contact</th>
                      <th className="px-3 py-2 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Balance</th>
                      <th className="px-3 py-2 text-center text-[9px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                      <th className="px-3 py-2 text-center text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.map((customer) => {
                      const isPositive = customer.balance > 0;
                      const isNegative = customer.balance < 0;
                      const isSelected = selectedCustomer?.id === customer.id;

                      return (
                        <tr
                          key={customer.id}
                          onClick={() => setSelectedCustomer(customer)}
                          className={`cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'bg-blue-50/60 border-l-4 border-blue-500' 
                              : 'hover:bg-slate-50/60'
                          }`}
                        >
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${getAvatarColor(customer.id)} flex items-center justify-center text-white font-bold text-[10px] shadow-md flex-shrink-0`}>
                                {getInitials(customer.name)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-800 truncate">{customer.name}</p>
                                <p className="text-[9px] text-slate-400 truncate">{customer.phone || 'No phone'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 hidden sm:table-cell">
                            <div className="text-[10px] text-slate-600 truncate max-w-[120px]">
                              {customer.email || '-'}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex items-center justify-end gap-0.5">
                              {isPositive && <ArrowUpRight size={10} className="text-amber-500" />}
                              {isNegative && <ArrowDownRight size={10} className="text-emerald-500" />}
                              <span className={`text-xs font-bold ${
                                isPositive ? 'text-amber-600' : 
                                isNegative ? 'text-emerald-600' : 
                                'text-slate-600'
                              }`}>
                                {formatCurrency(customer.balance)}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center hidden md:table-cell">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-medium rounded-full border ${getStatusBadge(customer.is_active)}`}>
                              {getStatusIcon(customer.is_active)}
                              {customer.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openBalanceModal(customer);
                                }}
                                className="p-1 rounded hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"
                                title="Update Balance"
                              >
                                <Wallet size={12} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(customer);
                                }}
                                className="p-1 rounded hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                                title="Edit"
                              >
                                <Edit3 size={12} />
                              </button>
                              {customer.is_active === 1 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(customer.id, customer.name);
                                  }}
                                  className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                  title="Deactivate"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Customer Detail Sidebar */}
        <div className="lg:col-span-1">
          {selectedCustomer ? (
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 sticky top-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarColor(selectedCustomer.id)} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                  {getInitials(selectedCustomer.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-800 truncate">{selectedCustomer.name}</h3>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-medium rounded-full border ${getStatusBadge(selectedCustomer.is_active)}`}>
                    {getStatusIcon(selectedCustomer.is_active)}
                    {selectedCustomer.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-[10px]">
                {selectedCustomer.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone size={12} className="text-blue-400" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                )}
                {selectedCustomer.email && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail size={12} className="text-blue-400" />
                    <span className="truncate">{selectedCustomer.email}</span>
                  </div>
                )}
                {selectedCustomer.address && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin size={12} className="text-blue-400" />
                    <span className="truncate">{selectedCustomer.address}</span>
                  </div>
                )}
                {selectedCustomer.cnic && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Hash size={12} className="text-blue-400" />
                    <span>{selectedCustomer.cnic}</span>
                  </div>
                )}
                {selectedCustomer.credit_limit > 0 && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <CreditCard size={12} className="text-blue-400" />
                    <span>Credit Limit: {formatCurrency(selectedCustomer.credit_limit)}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-[7px] text-slate-400 uppercase font-medium">Balance</p>
                  <p className={`text-sm font-bold ${selectedCustomer.balance > 0 ? 'text-amber-600' : selectedCustomer.balance < 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {formatCurrency(selectedCustomer.balance)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-[7px] text-slate-400 uppercase font-medium">Sales</p>
                  <p className="text-sm font-bold text-slate-800">{selectedCustomer.sales_count || 0}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center col-span-2">
                  <p className="text-[7px] text-slate-400 uppercase font-medium">Total Sales</p>
                  <p className="text-sm font-bold text-slate-800">{formatCurrency(selectedCustomer.total_sales)}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex gap-1">
                <button
                  onClick={() => openBalanceModal(selectedCustomer)}
                  className="flex-1 px-2 py-1.5 text-[9px] font-medium text-white rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-md transition-all"
                >
                  <Wallet size={10} className="inline mr-1" />
                  Update Balance
                </button>
                <button
                  onClick={() => openEditModal(selectedCustomer)}
                  className="flex-1 px-2 py-1.5 text-[9px] font-medium text-white rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-md transition-all"
                >
                  <Edit3 size={10} className="inline mr-1" />
                  Edit
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-8 text-center">
              <UserCircle size={48} className="text-slate-300 mx-auto mb-3" />
              <p className="text-xs text-slate-500">Select a customer to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== CUSTOMER MODAL ===== */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-4 animate-scale-in relative max-h-[90vh] overflow-y-auto">
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${
              modal.mode === "add" ? "from-emerald-400 to-emerald-600" : "from-blue-400 to-indigo-600"
            } rounded-t-xl`} />
            <button
              onClick={() => setModal({ open: false, mode: "add", data: null })}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-transform hover:scale-110"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2.5 mt-1 mb-3">
              <div className={`p-2 rounded-lg ${
                modal.mode === "add" ? "bg-gradient-to-br from-emerald-500 to-emerald-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"
              } text-white shadow-lg`}>
                {modal.mode === "add" ? <Users size={16} /> : <Edit3 size={16} />}
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">
                  {modal.mode === "add" ? "Add Customer" : "Edit Customer"}
                </h3>
                <p className="text-[10px] text-slate-500">
                  {modal.mode === "add" ? "Create a new customer record" : "Update customer information"}
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
                        : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
                    }`}
                    placeholder="Customer name"
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
                        : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
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
                        : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
                    }`}
                    placeholder="customer@example.com"
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
                        : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
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
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300 bg-white"
                  placeholder="Enter address"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    Balance
                  </label>
                  <input
                    type="number"
                    value={form.balance}
                    onChange={(e) => setForm(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300 bg-white"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    Credit Limit
                  </label>
                  <input
                    type="number"
                    value={form.credit_limit}
                    onChange={(e) => setForm(prev => ({ ...prev, credit_limit: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-2.5 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 bg-white ${
                      validationErrors.credit_limit
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
                    }`}
                    placeholder="0.00"
                    step="0.01"
                  />
                  {validationErrors.credit_limit && (
                    <p className="text-[9px] text-red-500 mt-0.5">{validationErrors.credit_limit}</p>
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
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300 bg-white resize-none"
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
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300 bg-white"
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
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
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
              onClick={() => setBalanceModal({ open: false, customer: null })}
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
                  {balanceModal.customer?.name} - Current: {formatCurrency(balanceModal.customer?.balance)}
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
                  <option value="add">Add Balance (Customer owes us)</option>
                  <option value="subtract">Subtract Balance (We owe customer)</option>
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
                  onClick={() => setBalanceModal({ open: false, customer: null })}
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