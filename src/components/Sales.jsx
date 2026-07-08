// src/pages/Sales/Sales.jsx

import React, { useState, useEffect, useRef } from "react";
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
  BarChart3,
  Loader2
} from "lucide-react";

// ==================== API WRAPPER ====================
const api = window.api || {};

class SalesAPI {
  async create(data) {
    try {
      const result = await api.createSale(data);
      if (!result.success) {
        throw new Error(result.error || "Failed to create sale");
      }
      return result;
    } catch (error) {
      console.error("Create sale error:", error);
      throw error;
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
      console.error("Get customers error:", error);
      return { success: true, data: [] };
    }
  }

  async getWarehouses() {
    try {
      const result = await api.getActiveOnlyWarehouses();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch warehouses");
      }
      return result;
    } catch (error) {
      console.error("Get warehouses error:", error);
      return { success: true, data: [] };
    }
  }

  async getProducts() {
    try {
      const result = await api.getProducts();
      let products = [];
      if (Array.isArray(result)) {
        products = result;
      } else if (result && result.success && Array.isArray(result.data)) {
        products = result.data;
      } else {
        console.warn("Products API returned unexpected format:", result);
        return { success: true, data: [] };
      }
      return { success: true, data: products };
    } catch (error) {
      console.error("Get products error:", error);
      return { success: true, data: [] };
    }
  }

  async getProductInventory(productId) {
    try {
      const result = await api.getInventoryByProduct(productId);
      if (!result.success) {
        return { success: true, data: [] };
      }
      return result;
    } catch (error) {
      console.error("Get product inventory error:", error);
      return { success: true, data: [] };
    }
  }

  async getProductBatches(productId) {
    try {
      const result = await api.getBatchesByProduct(productId);
      if (!result.success) {
        return { success: true, data: [] };
      }
      return result;
    } catch (error) {
      console.error("Get product batches error:", error);
      return { success: true, data: [] };
    }
  }

  async generateNumber() {
    try {
      const result = await api.generateInvoiceNumber();
      if (!result.success) {
        throw new Error(result.error || "Failed to generate invoice number");
      }
      return result;
    } catch (error) {
      console.error("Generate number error:", error);
      return { success: true, data: { invoice_number: `INV-${String(Date.now()).slice(-6)}` } };
    }
  }

  // ✅ PDF Generation method - using the specific sale PDF generator
  async generateSalePDF(saleData, items) {
    try {
      console.log('📄 [SalesAPI] Calling generateSalePDF');
      console.log('📄 [SalesAPI] saleData:', saleData);
      console.log('📄 [SalesAPI] items count:', items?.length || 0);
      
      // ✅ Call the specific sale PDF method from preload
      const result = await api.generateSalePDF(saleData, items);
      
      console.log('📄 [SalesAPI] Result:', result);
      return result;
    } catch (error) {
      console.error("❌ PDF generation error:", error);
      return { success: false, error: error.message };
    }
  }
}

const salesAPI = new SalesAPI();

export default function Sales() {
  // ==================== STATE ====================
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  // Form Data
  const [form, setForm] = useState({
    invoice_number: "",
    customer_id: "", // Will be set to walking customer ID (999) after loading
    warehouse_id: "",
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
    total_stock: 0,
    batches: [],
    inventory: []
  });

  // Dropdown Data
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // ✅ Track the last created sale for PDF generation
  const [lastCreatedSale, setLastCreatedSale] = useState(null);

  // Refs
  const productSearchRef = useRef(null);

  // ==================== LOAD INITIAL DATA ====================
  const loadInitialData = async () => {
    setIsInitialLoading(true);
    try {
      // Load customers
      const customersResult = await salesAPI.getCustomers();
      if (customersResult.success) {
        setCustomers(customersResult.data || []);
        
        // ✅ Set default customer to Walking Customer (ID: 999) if exists
        const walkingCustomer = customersResult.data?.find(c => c.id === 999);
        if (walkingCustomer) {
          setForm(prev => ({ ...prev, customer_id: "999" }));
        } else if (customersResult.data && customersResult.data.length > 0) {
          // Fallback: set to first active customer
          setForm(prev => ({ ...prev, customer_id: String(customersResult.data[0].id) }));
        }
      }

      // Load warehouses
      const warehousesResult = await salesAPI.getWarehouses();
      if (warehousesResult.success) {
        setWarehouses(warehousesResult.data || []);
        // Set default warehouse if available
        if (warehousesResult.data && warehousesResult.data.length > 0) {
          setForm(prev => ({ ...prev, warehouse_id: String(warehousesResult.data[0].id) }));
        }
      }

      // Load products
      const productsResult = await salesAPI.getProducts();
      if (productsResult.success) {
        setProducts(productsResult.data || []);
      }

      // Generate invoice number
      const numberResult = await salesAPI.generateNumber();
      if (numberResult.success) {
        setForm(prev => ({ 
          ...prev, 
          invoice_number: numberResult.data.invoice_number 
        }));
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      showNotification("error", "Failed to load initial data");
    } finally {
      setIsInitialLoading(false);
    }
  };

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
      setShowProductDropdown(filtered.length > 0);
    } else {
      setFilteredProducts([]);
      setShowProductDropdown(false);
    }
  }, [productSearch, products]);

  // Recalculate available stock when warehouse changes
  useEffect(() => {
    if (!currentItem.product_id) return;

    const newStock = getStockForWarehouse(currentItem.inventory, form.warehouse_id);
    const totalStock = currentItem.inventory.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

    setCurrentItem(prev => ({
      ...prev,
      available_stock: newStock,
      total_stock: totalStock
    }));

    if (newStock === 0 && totalStock > 0) {
      showNotification("info", `⚠️ ${currentItem.product_name} has 0 stock in this warehouse. Try changing warehouse.`);
    } else if (newStock === 0) {
      showNotification("info", `⚠️ ${currentItem.product_name} has 0 stock available.`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.warehouse_id]);

  // ==================== HELPERS (stock) ====================
  const getStockForWarehouse = (inventoryData, warehouseId) => {
    if (!Array.isArray(inventoryData) || inventoryData.length === 0) return 0;

    if (!warehouseId) {
        return inventoryData.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    }

    const targetId = Number(warehouseId);
    
    // ✅ SUM ALL records for this warehouse, not just the first one!
    const total = inventoryData
        .filter(i => Number(i.warehouse_id) === targetId)
        .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    
    console.log(`📊 Total stock in warehouse ${targetId}: ${total}`);
    return total;
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
    try {
      console.log(`🔍 Selecting product: ${product.id} - ${product.name}`);
      console.log(`🔍 Product stock_quantity: ${product.stock_quantity}`);
      
      // Fetch inventory data for this product
      const inventoryResult = await salesAPI.getProductInventory(product.id);
      let inventoryData = [];

      if (inventoryResult.success && inventoryResult.data) {
        inventoryData = inventoryResult.data;
        console.log(`📊 Inventory data for product ${product.id}:`, inventoryData);
      }

      // ✅ Calculate stock for selected warehouse
      const availableStock = getStockForWarehouse(inventoryData, form.warehouse_id);
      
      // ✅ Calculate total stock across all warehouses
      const totalStock = inventoryData.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      console.log(`📊 Available stock in warehouse ${form.warehouse_id}: ${availableStock}`);
      console.log(`📊 Total stock across all warehouses: ${totalStock}`);

      // Fetch batches
      let batches = [];
      try {
        const batchesResult = await salesAPI.getProductBatches(product.id);
        if (batchesResult.success && batchesResult.data) {
          batches = batchesResult.data;
          console.log(`📊 Found ${batches.length} batches`);
        }
      } catch (err) {
        console.log('⚠️ Could not fetch batches:', err.message);
      }

      // ✅ Set current item with correct stock
      setCurrentItem({
        product_id: product.id,
        product_name: product.name,
        product_code: product.code || 'N/A',
        unit: product.unit || 'pcs',
        quantity: 1,
        sale_price: product.sale_price || 0,
        purchase_price: product.purchase_price || 0,
        total: product.sale_price || 0,
        available_stock: availableStock,
        total_stock: totalStock,
        batches: batches,
        inventory: inventoryData
      });

      setProductSearch(product.name);
      setShowProductDropdown(false);

      if (productSearchRef.current) {
        productSearchRef.current.blur();
      }

      // Show appropriate notification
      if (availableStock === 0 && totalStock > 0) {
        showNotification("info", `⚠️ ${product.name} has 0 stock in this warehouse. Try changing warehouse.`);
      } else if (availableStock === 0) {
        showNotification("info", `⚠️ ${product.name} has 0 stock available.`);
      } else {
        showNotification("success", `✅ ${product.name}: ${availableStock} ${product.unit || 'units'} available`);
      }
    } catch (err) {
      console.error("Error loading product inventory:", err);
      setCurrentItem({
        product_id: product.id,
        product_name: product.name,
        product_code: product.code || 'N/A',
        unit: product.unit || 'pcs',
        quantity: 1,
        sale_price: product.sale_price || 0,
        purchase_price: product.purchase_price || 0,
        total: product.sale_price || 0,
        available_stock: 0,
        total_stock: 0,
        batches: [],
        inventory: []
      });
      setProductSearch(product.name);
      setShowProductDropdown(false);
      
      if (productSearchRef.current) {
        productSearchRef.current.blur();
      }
      
      showNotification("info", `⚠️ Could not load stock info for ${product.name}.`);
    }
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
      total_stock: 0,
      batches: [],
      inventory: []
    });
    setProductSearch("");
    setShowProductDropdown(false);
  };

  // ==================== PDF GENERATION ====================
  const generatePDF = async (saleData, saleItems) => {
    try {
      setIsLoading(true);
      showNotification("info", "Preparing PDF...");
      
      console.log('📄 [Sales] Generating PDF for invoice:', saleData.invoice_number);
      console.log('📄 [Sales] Items count:', saleItems?.length || 0);
      
      // ✅ Call the specific sale PDF method
      const result = await salesAPI.generateSalePDF(saleData, saleItems);
      
      console.log('📄 [Sales] PDF result:', result);
      
      if (result.success) {
        showNotification("success", `PDF saved successfully at: ${result.path}`);
        console.log("✅ PDF saved:", result.path);
      } else if (result.canceled) {
        showNotification("info", "PDF save was canceled");
      } else {
        showNotification("error", `Failed to generate PDF: ${result.error || 'Unknown error'}`);
      }
      
      return result;
    } catch (error) {
      console.error("❌ PDF generation error:", error);
      showNotification("error", `PDF generation failed: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
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
        invoice_number: form.invoice_number,
        subtotal: form.subtotal,
        total_amount: form.total_amount,
        due_amount: form.due_amount,
        items: items.map(item => ({
          product_id: parseInt(item.product_id),
          product_name: item.product_name,
          product_code: item.product_code,
          quantity: parseFloat(item.quantity),
          sale_price: parseFloat(item.sale_price),
          total: item.total,
          unit: item.unit
        }))
      };

      const result = await salesAPI.create(saleData);
      if (result.success) {
        showNotification("success", `Sale ${form.invoice_number} created successfully!`);
        
        // ✅ Store the created sale data for PDF generation
        const createdSaleData = {
          ...saleData,
          id: result.data?.id,
          invoice_number: form.invoice_number
        };
        setLastCreatedSale(createdSaleData);
        
        await resetForm();
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
    
    // ✅ Keep the walking customer as default on reset
    const walkingCustomer = customers.find(c => c.id === 999);
    setForm({
      invoice_number: "",
      customer_id: walkingCustomer ? "999" : (customers.length > 0 ? String(customers[0].id) : ""),
      warehouse_id: form.warehouse_id || (warehouses.length > 0 ? String(warehouses[0].id) : ""),
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

    try {
      const numberResult = await salesAPI.generateNumber();
      if (numberResult.success) {
        setForm(prev => ({ ...prev, invoice_number: numberResult.data.invoice_number }));
      }
    } catch (err) {
      console.error("Error generating invoice number:", err);
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

  const getStockStatus = (available) => {
    if (available <= 0) return { label: "Out of Stock", color: "text-red-600", bg: "bg-red-50" };
    if (available <= 10) return { label: "Low Stock", color: "text-amber-600", bg: "bg-amber-50" };
    return { label: "In Stock", color: "text-emerald-600", bg: "bg-emerald-50" };
  };

  const isQuantityExceeding =
    !!currentItem.product_id && currentItem.quantity > currentItem.available_stock;

  // ==================== RENDER ====================
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-emerald-500 animate-spin" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-50/50 via-white to-blue-50/30 min-h-screen">

      {/* ===== NOTIFICATION ===== */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full p-3 rounded-xl shadow-lg animate-slide-down border ${
          notification.type === "success" ? "bg-emerald-50 border-emerald-200" : 
          notification.type === "info" ? "bg-blue-50 border-blue-200" :
          "bg-red-50 border-red-200"
        }`}>
          <div className="flex items-start gap-2">
            <div className={`mt-0.5 p-1 rounded-full ${
              notification.type === "success" ? "bg-emerald-100" : 
              notification.type === "info" ? "bg-blue-100" :
              "bg-red-100"
            }`}>
              {notification.type === "success" ? (
                <CheckCircle size={14} className="text-emerald-600" />
              ) : notification.type === "info" ? (
                <AlertCircle size={14} className="text-blue-600" />
              ) : (
                <X size={14} className="text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-xs font-medium ${
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
          {/* ✅ NEW: Last Invoice PDF button */}
          {lastCreatedSale && (
            <button
              onClick={() => generatePDF(lastCreatedSale, items)}
              disabled={isLoading}
              className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50"
            >
              <Download size={12} />
              Last Invoice
            </button>
          )}
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
                        {customer.id === 999 && ' (Walk-in)'}
                      </option>
                    ))}
                  </select>
                  {/* ✅ Show indicator that walking customer is selected */}
                  {form.customer_id === "999" && (
                    <p className="text-[9px] text-emerald-600 mt-0.5 flex items-center gap-1">
                      Walking customer selected (default for cash sales)
                    </p>
                  )}
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
                  {currentItem.product_id && (
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      Stock updates automatically for the selected product when you change warehouse.
                    </p>
                  )}
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
                        ref={productSearchRef}
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        onFocus={() => {
                          if (filteredProducts.length > 0) {
                            setShowProductDropdown(true);
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setShowProductDropdown(false);
                          }, 200);
                        }}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white transition-all duration-300"
                        placeholder="Search product..."
                      />
                      {showProductDropdown && filteredProducts.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                          {filteredProducts.map((product) => {
                            // ✅ Use product.stock_quantity as fallback display
                            const productStock = product.stock_quantity || 0;
                            const stockStatus = getStockStatus(productStock);
                            return (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => selectProduct(product)}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 transition-colors flex items-center justify-between"
                              >
                                <span>
                                  <span className="font-medium">{product.name}</span>
                                  <span className="text-slate-400 ml-2">#{product.code || 'N/A'}</span>
                                </span>
                                <span className={`text-[10px] ${stockStatus.color}`}>
                                  {productStock} {product.unit}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {products.length === 0 && !isInitialLoading && (
                        <p className="text-[10px] text-amber-600 mt-1">
                          ⚠️ No products available. Please add products first.
                        </p>
                      )}
                    </div>
                    {currentItem.product_name && (
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-[9px] text-emerald-600">
                          Selected: {currentItem.product_name} (#{currentItem.product_code || 'N/A'})
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] ${getStockStatus(currentItem.available_stock).color}`}>
                            Stock: {currentItem.available_stock} {currentItem.unit}
                          </span>
                          {currentItem.total_stock > currentItem.available_stock && (
                            <span className="text-[8px] text-slate-400">
                              (Total: {currentItem.total_stock})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[8px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={currentItem.quantity || ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        setCurrentItem(prev => ({
                          ...prev,
                          quantity: val,
                          total: val * (prev.sale_price || 0)
                        }));
                      }}
                      onFocus={(e) => {
                        if (e.target.value === '0' || e.target.value === '') {
                          e.target.select();
                        }
                      }}
                      className={`w-full px-2.5 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 bg-white transition-all duration-300 ${
                        isQuantityExceeding
                          ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                          : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-100"
                      }`}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                    {isQuantityExceeding && (
                      <p className="text-[9px] text-red-500 mt-0.5 flex items-center gap-1">
                        <AlertCircle size={10} />
                        Only {currentItem.available_stock} {currentItem.unit || "units"} in stock
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[8px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      value={currentItem.sale_price || ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        setCurrentItem(prev => ({
                          ...prev,
                          sale_price: val,
                          total: (prev.quantity || 0) * val
                        }));
                      }}
                      onFocus={(e) => {
                        if (e.target.value === '0' || e.target.value === '') {
                          e.target.select();
                        }
                      }}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white transition-all duration-300"
                      placeholder="0"
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
                    disabled={isQuantityExceeding}
                    title={isQuantityExceeding ? "Quantity exceeds available stock" : "Add item"}
                    className={`px-3 py-1.5 text-[10px] font-medium text-white rounded-lg transition-all duration-300 shadow-sm ${
                      isQuantityExceeding
                        ? "bg-slate-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 hover:shadow-md hover:-translate-y-0.5"
                    }`}
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
                      <p className="font-medium text-slate-700 flex items-center gap-1">
                        {customer.id === 999}
                        {customer.name}
                        {customer.id === 999 && (
                          <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">
                            Walk-in
                          </span>
                        )}
                      </p>
                      {customer.phone && (
                        <p className="flex items-center gap-1"><Phone size={10} /> {customer.phone}</p>
                      )}
                      {customer.address && (
                        <p className="flex items-center gap-1"><MapPin size={10} /> {customer.address}</p>
                      )}
                      <p className="flex items-center gap-1 font-medium">
                        <Wallet size={10} />
                        Balance: <span className={customer.credit > customer.debit ? 'text-amber-600' : 'text-emerald-600'}>
                          {formatCurrency((customer.credit || 0) - (customer.debit || 0))}
                        </span>
                      </p>
                      {customer.id === 999 && (
                        <p className="text-[8px] text-slate-400 italic mt-1">
                          Default customer for over-the-counter sales
                        </p>
                      )}
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
                      value={form.discount || ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        setForm(prev => ({ ...prev, discount: val }));
                      }}
                      onFocus={(e) => {
                        if (e.target.value === '0' || e.target.value === '') {
                          e.target.select();
                        }
                      }}
                      className="w-20 px-2 py-0.5 text-xs border border-slate-200 rounded text-right focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      placeholder="0"
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
                      value={form.tax || ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        setForm(prev => ({ ...prev, tax: val }));
                      }}
                      onFocus={(e) => {
                        if (e.target.value === '0' || e.target.value === '') {
                          e.target.select();
                        }
                      }}
                      className="w-20 px-2 py-0.5 text-xs border border-slate-200 rounded text-right focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      placeholder="0"
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
                    value={form.paid_amount || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      setForm(prev => ({ ...prev, paid_amount: val }));
                    }}
                    onFocus={(e) => {
                      if (e.target.value === '0' || e.target.value === '') {
                        e.target.select();
                      }
                    }}
                    className="w-24 px-2 py-0.5 text-xs border border-slate-200 rounded text-right focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    placeholder="0"
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
                  <Loader2 size={16} className="animate-spin" />
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