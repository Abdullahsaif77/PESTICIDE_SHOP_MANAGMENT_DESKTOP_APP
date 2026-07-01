import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Search,
  Package,
  Building2,
  Users,
  Truck,
  Calendar,
  DollarSign,
  FileText,
  Trash2,
  Edit3,
  Eye,
  RefreshCw,
  Download,
  Filter,
  ChevronDown,
  Clock,
  CreditCard,
  Hash,
  Box,
  Layers,
  ShoppingCart,
  Receipt,
  Printer,
  Save,
  Send,
  Archive,
  RotateCcw,
  Zap,
  TrendingUp,
  Wallet,
  User,
  MapPin,
  Phone,
  Mail,
  Tag,
  Link2,
  Award,
  Star,
  BarChart3
} from "lucide-react";

// ==================== MOCK DATA ====================
const MOCK_CUSTOMERS = [
  { id: 1, name: "Muhammad Store", phone: "0300-1234567", address: "Main Bazar, Lahore", balance: 15000 },
  { id: 2, name: "Ali Traders", phone: "0300-7654321", address: "Gulberg, Lahore", balance: 0 },
  { id: 3, name: "Ahmed Enterprises", phone: "0300-9876543", address: "Industrial Area, Lahore", balance: -5000 },
  { id: 4, name: "Usman Store", phone: "0300-5555555", address: "Johar Town, Lahore", balance: 25000 },
  { id: 5, name: "Riaz Agro", phone: "0300-4444444", address: "Farm Area, Lahore", balance: 1000 },
];

const MOCK_WAREHOUSES = [
  { id: 1, name: "Main Warehouse", location: "Ground Floor" },
  { id: 2, name: "Branch Warehouse", location: "First Floor" },
  { id: 3, name: "Storage Facility", location: "Industrial Area" },
];

const MOCK_PRODUCTS = [
  { id: 1, name: "Pesticide X", code: "PST-001", unit: "L", sale_price: 450, purchase_price: 320, stock: 150 },
  { id: 2, name: "Herbicide Y", code: "HRB-002", unit: "kg", sale_price: 320, purchase_price: 220, stock: 75 },
  { id: 3, name: "Fungicide Z", code: "FNG-003", unit: "L", sale_price: 280, purchase_price: 190, stock: 35 },
  { id: 4, name: "Rodenticide R", code: "RDT-004", unit: "kg", sale_price: 550, purchase_price: 400, stock: 10 },
  { id: 5, name: "Fertilizer F", code: "FRT-005", unit: "kg", sale_price: 180, purchase_price: 120, stock: 500 },
  { id: 6, name: "Spray Bottle S", code: "SPR-006", unit: "Bottle", sale_price: 150, purchase_price: 90, stock: 0 },
  { id: 7, name: "Weed Killer W", code: "WDK-007", unit: "L", sale_price: 250, purchase_price: 170, stock: 8 },
  { id: 8, name: "Growth Booster G", code: "GRB-008", unit: "L", sale_price: 150, purchase_price: 90, stock: 45 },
];

const MOCK_BATCHES = {
  1: [
    { id: 1, batch_number: "BATCH-001", quantity: 100, expiry_date: "2025-12-31", purchase_price: 320, sale_price: 450 },
    { id: 2, batch_number: "BATCH-002", quantity: 50, expiry_date: "2026-06-15", purchase_price: 320, sale_price: 450 }
  ],
  2: [
    { id: 3, batch_number: "BATCH-003", quantity: 75, expiry_date: "2025-09-20", purchase_price: 220, sale_price: 320 }
  ],
  3: [
    { id: 4, batch_number: "BATCH-004", quantity: 5, expiry_date: "2025-07-10", purchase_price: 190, sale_price: 280 }
  ],
  4: [
    { id: 5, batch_number: "BATCH-008", quantity: 10, expiry_date: "2025-11-30", purchase_price: 400, sale_price: 550 }
  ],
  5: [
    { id: 6, batch_number: "BATCH-005", quantity: 200, expiry_date: "2026-03-01", purchase_price: 120, sale_price: 180 },
    { id: 7, batch_number: "BATCH-010", quantity: 300, expiry_date: "2026-01-15", purchase_price: 120, sale_price: 180 }
  ],
  7: [
    { id: 8, batch_number: "BATCH-011", quantity: 8, expiry_date: "2025-06-01", purchase_price: 170, sale_price: 250 }
  ],
  8: [
    { id: 9, batch_number: "BATCH-012", quantity: 45, expiry_date: "2026-04-20", purchase_price: 90, sale_price: 150 }
  ]
};

const api = window.api || {};

class SalesAPI {
  async create(data) {
    try {
      const result = await api.createSale(data);
      return result;
    } catch (error) {
      console.error("Create sale error:", error);
      return { success: false, error: error.message };
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

  async getWarehouses() {
    try {
      const result = await api.getActiveOnlyWarehouses();
      if (result.success && result.data.length > 0) {
        return result;
      }
      return { success: true, data: MOCK_WAREHOUSES };
    } catch (error) {
      return { success: true, data: MOCK_WAREHOUSES };
    }
  }

  async getProducts() {
    try {
      const result = await api.getProducts();
      if (result.success && result.data.length > 0) {
        return result;
      }
      return { success: true, data: MOCK_PRODUCTS };
    } catch (error) {
      return { success: true, data: MOCK_PRODUCTS };
    }
  }

  async getProductBatches(productId) {
    try {
      const result = await api.getBatchesByProduct(productId);
      if (result.success && result.data.length > 0) {
        return result;
      }
      return { success: true, data: MOCK_BATCHES[productId] || [] };
    } catch (error) {
      return { success: true, data: MOCK_BATCHES[productId] || [] };
    }
  }

  async generateNumber() {
    try {
      const result = await api.generateInvoiceNumber();
      if (result.success) return result;
      return { success: true, data: { invoice_number: `INV-${String(Date.now()).slice(-6)}` } };
    } catch (error) {
      return { success: true, data: { invoice_number: `INV-${String(Date.now()).slice(-6)}` } };
    }
  }
}

const salesAPI = new SalesAPI();

export default function Sales() {
  // ==================== STATE ====================
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  // Form Data
  const [form, setForm] = useState({
    invoice_number: "",
    customer_id: "",
    warehouse_id: "",
    sale_date: new Date().toISOString().split("T")[0],
    payment_method: "cash",
    notes: "",
    discount: 0,
    tax: 0,
    paid_amount: 0,
    status: "completed"
  });

  // Items
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    product_id: "",
    product_name: "",
    product_code: "",
    unit: "",
    quantity: 1,
    sale_price: 0,
    purchase_price: 0,
    total: 0,
    available_stock: 0,
    batches: []
  });

  // Dropdown Data
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Edit/View Modal
  const [detailModal, setDetailModal] = useState({ open: false, sale: null });

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [items, form.discount, form.tax]);

  useEffect(() => {
    if (productSearch.trim()) {
      const filtered = products.filter(p =>
        p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.code?.toLowerCase().includes(productSearch.toLowerCase())
      );
      setFilteredProducts(filtered);
      setShowProductDropdown(true);
    } else {
      setFilteredProducts([]);
      setShowProductDropdown(false);
    }
  }, [productSearch, products]);

  // ==================== DATA LOADING ====================
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [customersResult, warehousesResult, productsResult, numberResult] = await Promise.all([
        salesAPI.getCustomers(),
        salesAPI.getWarehouses(),
        salesAPI.getProducts(),
        salesAPI.generateNumber()
      ]);

      if (customersResult.success) setCustomers(customersResult.data || []);
      if (warehousesResult.success) setWarehouses(warehousesResult.data || []);
      if (productsResult.success) setProducts(productsResult.data || []);

      if (numberResult.success) {
        setForm(prev => ({ ...prev, invoice_number: numberResult.data.invoice_number }));
      }

      if (warehousesResult.data && warehousesResult.data.length > 0) {
        setForm(prev => ({ ...prev, warehouse_id: warehousesResult.data[0].id }));
      }
    } catch (err) {
      console.error("Error loading data:", err);
      showNotification("error", "Failed to load initial data");
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== CALCULATIONS ====================
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const discount = parseFloat(form.discount) || 0;
    const tax = parseFloat(form.tax) || 0;
    const total = subtotal - discount + tax;
    const paid = parseFloat(form.paid_amount) || 0;
    const due = total - paid;

    setForm(prev => ({
      ...prev,
      subtotal,
      total_amount: total,
      due_amount: due
    }));
  };

  const calculateItemTotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.sale_price) || 0;
    return quantity * price;
  };

  // ==================== ITEM MANAGEMENT ====================
  const selectProduct = async (product) => {
    // Get product batches
    const batchesResult = await salesAPI.getProductBatches(product.id);
    const batches = batchesResult.success ? batchesResult.data : [];

    // Calculate available stock
    const availableStock = batches.reduce((sum, b) => sum + (b.quantity || 0), 0);

    setCurrentItem({
      product_id: product.id,
      product_name: product.name,
      product_code: product.code,
      unit: product.unit,
      quantity: 1,
      sale_price: product.sale_price || 0,
      purchase_price: product.purchase_price || 0,
      total: product.sale_price || 0,
      available_stock: availableStock,
      batches: batches
    });
    setProductSearch(product.name);
    setShowProductDropdown(false);
  };

  const addItem = () => {
    if (!currentItem.product_id) {
      showNotification("error", "Please select a product");
      return;
    }

    if (!currentItem.quantity || currentItem.quantity <= 0) {
      showNotification("error", "Quantity must be greater than 0");
      return;
    }

    if (currentItem.quantity > currentItem.available_stock) {
      showNotification("error", `Only ${currentItem.available_stock} ${currentItem.unit} available in stock`);
      return;
    }

    if (!currentItem.sale_price || currentItem.sale_price <= 0) {
      showNotification("error", "Sale price must be greater than 0");
      return;
    }

    const total = calculateItemTotal(currentItem);
    const newItem = {
      ...currentItem,
      total: total,
      id: Date.now()
    };

    setItems([...items, newItem]);
    resetCurrentItem();
    showNotification("success", "Item added successfully");
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const resetCurrentItem = () => {
    setCurrentItem({
      product_id: "",
      product_name: "",
      product_code: "",
      unit: "",
      quantity: 1,
      sale_price: 0,
      purchase_price: 0,
      total: 0,
      available_stock: 0,
      batches: []
    });
    setProductSearch("");
    setShowProductDropdown(false);
  };

  // ==================== FORM SUBMISSION ====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.customer_id) {
      showNotification("error", "Please select a customer");
      return;
    }

    if (!form.warehouse_id) {
      showNotification("error", "Please select a warehouse");
      return;
    }

    if (items.length === 0) {
      showNotification("error", "Please add at least one product");
      return;
    }

    setIsLoading(true);
    try {
      const saleData = {
        customer_id: parseInt(form.customer_id),
        warehouse_id: parseInt(form.warehouse_id),
        sale_date: form.sale_date,
        payment_method: form.payment_method,
        discount: parseFloat(form.discount) || 0,
        tax: parseFloat(form.tax) || 0,
        paid_amount: parseFloat(form.paid_amount) || 0,
        notes: form.notes,
        status: form.status,
        items: items.map(item => ({
          product_id: parseInt(item.product_id),
          quantity: parseFloat(item.quantity),
          sale_price: parseFloat(item.sale_price),
          discount: 0
        }))
      };

      const result = await salesAPI.create(saleData);
      if (result.success) {
        showNotification("success", `Sale ${form.invoice_number} created successfully!`);
        resetForm();
      } else {
        showNotification("error", result.error || "Failed to create sale");
      }
    } catch (err) {
      console.error("Submit error:", err);
      showNotification("error", err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = async () => {
    setItems([]);
    resetCurrentItem();
    setForm({
      invoice_number: "",
      customer_id: "",
      warehouse_id: form.warehouse_id || "",
      sale_date: new Date().toISOString().split("T")[0],
      payment_method: "cash",
      notes: "",
      discount: 0,
      tax: 0,
      paid_amount: 0,
      status: "completed",
      subtotal: 0,
      total_amount: 0,
      due_amount: 0
    });

    const numberResult = await salesAPI.generateNumber();
    if (numberResult.success) {
      setForm(prev => ({ ...prev, invoice_number: numberResult.data.invoice_number }));
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

  const getCustomerName = (id) => {
    const customer = customers.find(c => c.id === parseInt(id));
    return customer?.name || "Select Customer";
  };

  const getWarehouseName = (id) => {
    const warehouse = warehouses.find(w => w.id === parseInt(id));
    return warehouse?.name || "Select Warehouse";
  };

  const getStockStatus = (available) => {
    if (available <= 0) return { label: "Out of Stock", color: "text-red-600", bg: "bg-red-50" };
    if (available <= 10) return { label: "Low Stock", color: "text-amber-600", bg: "bg-amber-50" };
    return { label: "In Stock", color: "text-emerald-600", bg: "bg-emerald-50" };
  };

  // ==================== RENDER ====================
  return (
    <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-50/50 via-white to-blue-50/30 min-h-screen">

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
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 text-white shadow-lg shadow-emerald-500/25">
            <ShoppingCart size={18} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-blue-600 bg-clip-text text-transparent">
              New Sale Invoice
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Receipt size={10} />
              Create a new sale invoice for customer
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={resetForm}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium border rounded-lg transition-all duration-300 shadow-sm hover:shadow-md bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
          >
            <RotateCcw size={12} />
            Reset
          </button>
          <button
            onClick={loadInitialData}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
          >
            <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ===== FORM ===== */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ===== LEFT COLUMN - Form Fields ===== */}
          <div className="lg:col-span-2 space-y-4">
            {/* Sale Info */}
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <FileText size={14} className="text-emerald-500" />
                Invoice Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={form.invoice_number}
                    disabled
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    Sale Date
                  </label>
                  <input
                    type="date"
                    value={form.sale_date}
                    onChange={(e) => setForm(prev => ({ ...prev, sale_date: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    Customer *
                  </label>
                  <select
                    value={form.customer_id}
                    onChange={(e) => setForm(prev => ({ ...prev, customer_id: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white transition-all duration-300 appearance-none"
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} {customer.phone ? `- ${customer.phone}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    Warehouse *
                  </label>
                  <select
                    value={form.warehouse_id}
                    onChange={(e) => setForm(prev => ({ ...prev, warehouse_id: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white transition-all duration-300 appearance-none"
                    required
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} {warehouse.location ? `- ${warehouse.location}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    Payment Method
                  </label>
                  <select
                    value={form.payment_method}
                    onChange={(e) => setForm(prev => ({ ...prev, payment_method: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white transition-all duration-300 appearance-none"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white transition-all duration-300 appearance-none"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white transition-all duration-300 resize-none"
                  placeholder="Additional notes..."
                  rows="2"
                />
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Package size={14} className="text-emerald-500" />
                  Products ({items.length})
                </h2>
                <span className="text-[10px] text-slate-400">
                  {items.length > 0 ? `${items.length} items added` : 'No items added'}
                </span>
              </div>

              {/* Add Item Row */}
              <div className="bg-emerald-50/50 rounded-lg p-3 mb-3 border border-emerald-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="relative col-span-2">
                    <label className="block text-[8px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Product *
                    </label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        onFocus={() => setShowProductDropdown(true)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white transition-all duration-300"
                        placeholder="Search product..."
                      />
                      {showProductDropdown && filteredProducts.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                          {filteredProducts.map((product) => {
                            const stockStatus = getStockStatus(product.stock || 0);
                            return (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => selectProduct(product)}
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 transition-colors flex items-center justify-between"
                              >
                                <span>
                                  <span className="font-medium">{product.name}</span>
                                  <span className="text-slate-400 ml-2">#{product.code}</span>
                                </span>
                                <span className={`text-[10px] ${stockStatus.color}`}>
                                  {product.stock || 0} {product.unit}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {currentItem.product_name && (
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-[9px] text-emerald-600">
                          Selected: {currentItem.product_name} (#{currentItem.product_code})
                        </p>
                        {currentItem.available_stock > 0 && (
                          <span className={`text-[9px] ${getStockStatus(currentItem.available_stock).color}`}>
                            Stock: {currentItem.available_stock} {currentItem.unit}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[8px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={currentItem.quantity}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setCurrentItem(prev => ({
                          ...prev,
                          quantity: val,
                          total: val * (prev.sale_price || 0)
                        }));
                      }}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white transition-all duration-300"
                      placeholder="Qty"
                      min="0.01"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      value={currentItem.sale_price}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setCurrentItem(prev => ({
                          ...prev,
                          sale_price: val,
                          total: (prev.quantity || 0) * val
                        }));
                      }}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white transition-all duration-300"
                      placeholder="Price"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="flex items-end gap-1.5 mt-2">
                  <div className="flex-1">
                    <label className="block text-[8px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Total
                    </label>
                    <input
                      type="text"
                      value={formatCurrency(currentItem.total)}
                      disabled
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-600"
                    />
                  </div>
                  {currentItem.batches.length > 0 && (
                    <div className="flex-1">
                      <label className="block text-[8px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                        FIFO Batches
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {currentItem.batches.slice(0, 3).map((batch) => (
                          <span key={batch.id} className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded">
                            {batch.batch_number}: {batch.quantity}
                          </span>
                        ))}
                        {currentItem.batches.length > 3 && (
                          <span className="text-[8px] text-slate-400">+{currentItem.batches.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-3 py-1.5 text-[10px] font-medium text-white rounded-lg bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Items List */}
              {items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-2 py-1.5 text-left text-[8px] font-semibold text-slate-500 uppercase">#</th>
                        <th className="px-2 py-1.5 text-left text-[8px] font-semibold text-slate-500 uppercase">Product</th>
                        <th className="px-2 py-1.5 text-right text-[8px] font-semibold text-slate-500 uppercase">Qty</th>
                        <th className="px-2 py-1.5 text-right text-[8px] font-semibold text-slate-500 uppercase">Price</th>
                        <th className="px-2 py-1.5 text-right text-[8px] font-semibold text-slate-500 uppercase">Total</th>
                        <th className="px-2 py-1.5 text-center text-[8px] font-semibold text-slate-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-emerald-50/30 transition-colors">
                          <td className="px-2 py-1.5 text-slate-400">{index + 1}</td>
                          <td className="px-2 py-1.5">
                            <div>
                              <span className="font-medium text-slate-700">{item.product_name}</span>
                              <span className="text-[8px] text-slate-400 block">{item.unit}</span>
                            </div>
                          </td>
                          <td className="px-2 py-1.5 text-right font-medium text-slate-700">
                            {item.quantity}
                          </td>
                          <td className="px-2 py-1.5 text-right text-slate-600">
                            {formatCurrency(item.sale_price)}
                          </td>
                          <td className="px-2 py-1.5 text-right font-semibold text-emerald-600">
                            {formatCurrency(item.total)}
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <Package size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No items added yet</p>
                  <p className="text-[10px]">Search and add products above</p>
                </div>
              )}
            </div>
          </div>

          {/* ===== RIGHT COLUMN - Summary ===== */}
          <div className="lg:col-span-1 space-y-4">
            {/* Customer Info */}
            {form.customer_id && (
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
                <h3 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Users size={12} className="text-emerald-500" />
                  Customer Details
                </h3>
                {(() => {
                  const customer = customers.find(c => c.id === parseInt(form.customer_id));
                  if (!customer) return null;
                  return (
                    <div className="space-y-1 text-xs text-slate-600">
                      <p className="font-medium text-slate-700">{customer.name}</p>
                      {customer.phone && (
                        <p className="flex items-center gap-1"><Phone size={10} /> {customer.phone}</p>
                      )}
                      {customer.address && (
                        <p className="flex items-center gap-1"><MapPin size={10} /> {customer.address}</p>
                      )}
                      <p className="flex items-center gap-1 font-medium">
                        <Wallet size={10} />
                        Balance: <span className={customer.balance > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                          {formatCurrency(customer.balance)}
                        </span>
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Warehouse Info */}
            {form.warehouse_id && (
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
                <h3 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Building2 size={12} className="text-emerald-500" />
                  Warehouse
                </h3>
                {(() => {
                  const warehouse = warehouses.find(w => w.id === parseInt(form.warehouse_id));
                  if (!warehouse) return null;
                  return (
                    <div className="text-xs text-slate-600">
                      <p className="font-medium text-slate-700">{warehouse.name}</p>
                      {warehouse.location && <p>{warehouse.location}</p>}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Summary */}
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
              <h3 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                <Receipt size={12} className="text-emerald-500" />
                Invoice Summary
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium text-slate-700">{formatCurrency(form.subtotal || 0)}</span>
                </div>

                <div className="flex justify-between text-xs items-center">
                  <span className="text-slate-500">Discount</span>
                  <div className="flex items-center gap-1">
                    <span className="text-red-500">-</span>
                    <input
                      type="number"
                      value={form.discount}
                      onChange={(e) => setForm(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                      className="w-20 px-2 py-0.5 text-xs border border-slate-200 rounded text-right focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs items-center">
                  <span className="text-slate-500">Tax</span>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-500">+</span>
                    <input
                      type="number"
                      value={form.tax}
                      onChange={(e) => setForm(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                      className="w-20 px-2 py-0.5 text-xs border border-slate-200 rounded text-right focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-700">Total</span>
                    <span className="text-emerald-600">{formatCurrency(form.total_amount || 0)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-xs items-center pt-1">
                  <span className="text-slate-500">Amount Paid</span>
                  <input
                    type="number"
                    value={form.paid_amount}
                    onChange={(e) => setForm(prev => ({ ...prev, paid_amount: parseFloat(e.target.value) || 0 }))}
                    className="w-24 px-2 py-0.5 text-xs border border-slate-200 rounded text-right focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-500">Due Amount</span>
                  <span className={form.due_amount > 0 ? 'text-red-600' : 'text-emerald-600'}>
                    {formatCurrency(form.due_amount || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || items.length === 0 || !form.customer_id || !form.warehouse_id}
              className="w-full py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Create Invoice
                </>
              )}
            </button>

            <p className="text-[8px] text-slate-400 text-center">
              {items.length === 0 && 'Add at least one product'}
              {items.length > 0 && !form.customer_id && 'Select a customer'}
              {items.length > 0 && !form.warehouse_id && 'Select a warehouse'}
            </p>
          </div>
        </div>
      </form>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slideDown 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}