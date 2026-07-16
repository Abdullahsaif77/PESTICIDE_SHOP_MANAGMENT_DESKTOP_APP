// src/pages/Purchases/Purchases.jsx

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
  Loader2
} from "lucide-react";

const api = window.api || {};

export default function Purchases() {
  // ==================== STATE ====================
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  // Form Data
  const [form, setForm] = useState({
    purchase_number: "",
    supplier_id: "",
    warehouse_id: "",
    purchase_date: new Date().toISOString().split("T")[0],
    payment_method: "cash",
    notes: "",
    discount: 0,
    tax: 0,
    paid_amount: 0,
    status: "pending",
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
    purchase_price: 0,
    sale_price: 0,
    total: 0,
    expiry_date: "",
    batch_number: "",
    is_new_batch: true
  });

  // Dropdown Data
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  
  // Track the last created purchase for PDF generation
  const [lastCreatedPurchase, setLastCreatedPurchase] = useState(null);

  // ===== QUICK ADD PRODUCT STATE =====
  const [quickProductModal, setQuickProductModal] = useState({ open: false, mode: "add", data: null });
  const [quickProductForm, setQuickProductForm] = useState({
    name: "",
    category_id: "",
    unit_id: "",
    purchase_price: 0,
    sale_price: 0
  });
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const productNameInputRef = useRef(null);

  // ===== QUICK ADD SUPPLIER STATE =====
  const [quickSupplierModal, setQuickSupplierModal] = useState({ open: false, mode: "add", data: null });
  const [quickSupplierForm, setQuickSupplierForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    cnic: "",
    notes: "",
    credit: 0,
    debit: 0
  });
  const [supplierValidationErrors, setSupplierValidationErrors] = useState({});
  const supplierNameInputRef = useRef(null);

  // Refs
  const productSearchRef = useRef(null);

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadInitialData();
  }, []);

  // ✅ FIX: Include form.paid_amount to recalculate due amount when paid amount changes
  useEffect(() => {
    calculateTotals();
  }, [items, form.discount, form.tax, form.paid_amount]);

  useEffect(() => {
    if (productSearch.trim()) {
      const searchTerm = productSearch.toLowerCase().trim();
      const filtered = products.filter(p =>
        p.name?.toLowerCase().includes(searchTerm) ||
        p.code?.toLowerCase().includes(searchTerm) ||
        p.brand?.toLowerCase().includes(searchTerm) ||
        p.barcode?.toLowerCase().includes(searchTerm)
      );
      setFilteredProducts(filtered);
      setShowProductDropdown(filtered.length > 0);
    } else {
      setFilteredProducts([]);
      setShowProductDropdown(false);
    }
  }, [productSearch, products]);

  // Focus input when quick product modal opens
  useEffect(() => {
    if (quickProductModal.open && productNameInputRef.current) {
      setTimeout(() => {
        productNameInputRef.current.focus();
      }, 100);
    }
  }, [quickProductModal.open]);

  // Focus input when quick supplier modal opens
  useEffect(() => {
    if (quickSupplierModal.open && supplierNameInputRef.current) {
      setTimeout(() => {
        supplierNameInputRef.current.focus();
      }, 100);
    }
  }, [quickSupplierModal.open]);

  // Reset quick product form when modal closes
  useEffect(() => {
    if (!quickProductModal.open) {
      const timeoutId = setTimeout(() => {
        setQuickProductForm({
          name: "",
          category_id: "",
          unit_id: "",
          purchase_price: 0,
          sale_price: 0
        });
        setValidationErrors({});
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [quickProductModal.open]);

  // Reset quick supplier form when modal closes
  useEffect(() => {
    if (!quickSupplierModal.open) {
      const timeoutId = setTimeout(() => {
        setQuickSupplierForm({
          name: "",
          phone: "",
          email: "",
          address: "",
          cnic: "",
          notes: "",
          credit: 0,
          debit: 0
        });
        setSupplierValidationErrors({});
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [quickSupplierModal.open]);

  // ==================== DATA LOADING ====================
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [suppliersResult, warehousesResult, productsResult, numberResult, categoriesResult, unitsResult] = await Promise.all([
        api.getAllSuppliers({ is_active: 1 }),
        api.getActiveOnlyWarehouses(),
        api.getProducts(),
        api.generatePurchaseNumber(),
        api.getCategories(),
        api.getUnits()
      ]);

      if (suppliersResult.success) setSuppliers(suppliersResult.data || []);
      if (warehousesResult.success) setWarehouses(warehousesResult.data || []);
      if (Array.isArray(productsResult)) {
        setProducts(productsResult);
      } else if (productsResult.success) {
        setProducts(productsResult.data || []);
      } else {
        setProducts([]);
      }

      // Load categories and units for quick add
      const categoriesData = extractData(categoriesResult);
      const unitsData = extractData(unitsResult);
      setCategories(categoriesData);
      setUnits(unitsData);

      if (numberResult.success) {
        setForm(prev => ({ ...prev, purchase_number: numberResult.data.purchase_number }));
      }

      // Set default warehouse if available
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

  // Helper function to extract data from response
  const extractData = (response) => {
    if (!response) return [];
    if (response.success !== undefined && response.data !== undefined) {
      return Array.isArray(response.data) ? response.data : [];
    }
    if (Array.isArray(response)) {
      return response;
    }
    return [];
  };

  // ==================== REFRESH SUPPLIER DATA ====================
  const refreshSupplierData = async (supplierId) => {
    try {
      const result = await api.getAllSuppliers({ is_active: 1 });
      if (result.success) {
        setSuppliers(result.data || []);
        
        const updatedSupplier = result.data.find(s => s.id === supplierId);
        if (updatedSupplier) {
          const credit = updatedSupplier.credit || 0;
          const debit = updatedSupplier.debit || 0;
          const balance = credit - debit;
          console.log(`💰 Supplier balance updated:`, {
            name: updatedSupplier.name,
            credit: credit,
            debit: debit,
            balance: balance > 0 ? `Credit ${balance}` : `Debit ${Math.abs(balance)}`
          });
        }
      }
    } catch (err) {
      console.error("Error refreshing supplier data:", err);
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
    const price = parseFloat(item.purchase_price) || 0;
    return quantity * price;
  };

  // ==================== ITEM MANAGEMENT ====================
  const addItem = () => {
    if (!currentItem.product_id) {
      showNotification("error", "Please select a product");
      return;
    }

    if (!currentItem.quantity || currentItem.quantity <= 0) {
      showNotification("error", "Quantity must be greater than 0");
      return;
    }

    if (!currentItem.purchase_price || currentItem.purchase_price <= 0) {
      showNotification("error", "Purchase price must be greater than 0");
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
      purchase_price: 0,
      sale_price: 0,
      total: 0,
      expiry_date: "",
      batch_number: "",
      is_new_batch: true
    });
    setProductSearch("");
    setShowProductDropdown(false);
  };

  const selectProduct = (product) => {
    setCurrentItem({
      product_id: product.id,
      product_name: product.name,
      product_code: product.code,
      unit: product.unit,
      quantity: 1,
      purchase_price: product.purchase_price || 0,
      sale_price: product.sale_price || 0,
      total: product.purchase_price || 0,
      expiry_date: "",
      batch_number: "",
      is_new_batch: true
    });
    setProductSearch(product.name);
    setShowProductDropdown(false);
    
    if (productSearchRef.current) {
      productSearchRef.current.blur();
    }
  };

  // ==================== QUICK ADD PRODUCT ====================
  const openQuickAddProduct = () => {
    setQuickProductForm({
      name: "",
      category_id: "",
      unit_id: "",
      purchase_price: 0,
      sale_price: 0
    });
    setValidationErrors({});
    setQuickProductModal({ open: true, mode: "add", data: null });
  };

  const validateQuickProductForm = () => {
    const errors = {};

    if (!quickProductForm.name || quickProductForm.name.trim() === "") {
      errors.name = "Product name is required";
    }

    if (!quickProductForm.category_id) {
      errors.category_id = "Category is required";
    }

    if (!quickProductForm.unit_id) {
      errors.unit_id = "Unit is required";
    }

    if (!quickProductForm.purchase_price || quickProductForm.purchase_price <= 0) {
      errors.purchase_price = "Purchase price must be greater than 0";
    }

    if (!quickProductForm.sale_price || quickProductForm.sale_price <= 0) {
      errors.sale_price = "Sale price must be greater than 0";
    }

    if (quickProductForm.sale_price < quickProductForm.purchase_price) {
      errors.sale_price = "Sale price cannot be less than purchase price";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleQuickProductFieldChange = (field, value) => {
    setQuickProductForm({ ...quickProductForm, [field]: value });
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: "" });
    }
  };

  const handleQuickProductSubmit = async (e) => {
    e.preventDefault();

    if (!validateQuickProductForm()) {
      const firstError = document.querySelector('[data-error="true"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    setIsLoading(true);
    try {
      const productData = {
        name: quickProductForm.name,
        category_id: quickProductForm.category_id,
        unit_id: quickProductForm.unit_id,
        purchase_price: quickProductForm.purchase_price,
        sale_price: quickProductForm.sale_price
      };

      const result = await api.addProduct(productData);

      if (result && result.success) {
        showNotification("success", `Product "${quickProductForm.name}" added successfully!`);
        
        // Refresh products list
        const productsResult = await api.getProducts();
        if (Array.isArray(productsResult)) {
          setProducts(productsResult);
        } else if (productsResult.success) {
          setProducts(productsResult.data || []);
        }

        // Auto-select the newly created product
        const newProduct = result.data;
        if (newProduct) {
          // Close modal
          setQuickProductModal({ open: false, mode: "add", data: null });
          setValidationErrors({});
          
          // Select the product
          setTimeout(() => {
            selectProduct(newProduct);
          }, 100);
        }
      } else {
        console.error('Product creation failed:', result?.error || 'Unknown error');
        showNotification("error", result?.error || 'Failed to add product');
      }
    } catch (err) {
      console.error("Failed saving product:", err);
      showNotification("error", err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== QUICK ADD SUPPLIER ====================
  const openQuickAddSupplier = () => {
    setQuickSupplierForm({
      name: "",
      phone: "",
      email: "",
      address: "",
      cnic: "",
      notes: "",
      credit: 0,
      debit: 0
    });
    setSupplierValidationErrors({});
    setQuickSupplierModal({ open: true, mode: "add", data: null });
  };

  const validateSupplierForm = () => {
    const errors = {};

    if (!quickSupplierForm.name || quickSupplierForm.name.trim() === "") {
      errors.name = "Supplier name is required";
    } else if (quickSupplierForm.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (quickSupplierForm.phone && !/^(03\d{2})-?\d{7}$/.test(quickSupplierForm.phone)) {
      errors.phone = "Invalid phone format (e.g., 03XX-XXXXXXX)";
    }

    if (quickSupplierForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(quickSupplierForm.email)) {
      errors.email = "Invalid email format";
    }

    if (quickSupplierForm.cnic && !/^\d{5}-?\d{7}-?\d{1}$/.test(quickSupplierForm.cnic)) {
      errors.cnic = "Invalid CNIC format (e.g., XXXXX-XXXXXXX-X)";
    }

    if (quickSupplierForm.credit && quickSupplierForm.credit < 0) {
      errors.credit = "Credit cannot be negative";
    }

    if (quickSupplierForm.debit && quickSupplierForm.debit < 0) {
      errors.debit = "Debit cannot be negative";
    }

    setSupplierValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSupplierFieldChange = (field, value) => {
    setQuickSupplierForm({ ...quickSupplierForm, [field]: value });
    if (supplierValidationErrors[field]) {
      setSupplierValidationErrors({ ...supplierValidationErrors, [field]: "" });
    }
  };

  const handleQuickSupplierSubmit = async (e) => {
    e.preventDefault();

    if (!validateSupplierForm()) {
      const firstError = document.querySelector('[data-error="true"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    setIsLoading(true);
    try {
      const supplierData = {
        name: quickSupplierForm.name.trim(),
        phone: quickSupplierForm.phone || null,
        email: quickSupplierForm.email || null,
        address: quickSupplierForm.address || null,
        cnic: quickSupplierForm.cnic || null,
        notes: quickSupplierForm.notes || null,
        credit: quickSupplierForm.credit || 0,
        debit: quickSupplierForm.debit || 0
      };

      const result = await api.createSupplier(supplierData);

      if (result && result.success) {
        showNotification("success", `Supplier "${quickSupplierForm.name}" added successfully!`);
        
        // Refresh suppliers list
        const suppliersResult = await api.getAllSuppliers({ is_active: 1 });
        if (suppliersResult.success) {
          setSuppliers(suppliersResult.data || []);
        }

        // Auto-select the newly created supplier
        const newSupplier = result.data;
        if (newSupplier) {
          // Close modal
          setQuickSupplierModal({ open: false, mode: "add", data: null });
          setSupplierValidationErrors({});
          
          // Select the supplier
          setTimeout(() => {
            setForm(prev => ({ ...prev, supplier_id: String(newSupplier.id) }));
          }, 100);
        }
      } else {
        console.error('Supplier creation failed:', result?.error || 'Unknown error');
        showNotification("error", result?.error || 'Failed to add supplier');
      }
    } catch (err) {
      console.error("Failed saving supplier:", err);
      showNotification("error", err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== PDF GENERATION ====================
  const generatePDF = async (purchaseData, purchaseItems) => {
    try {
      setIsLoading(true);
      showNotification("info", "Preparing PDF...");
      
      const result = await api.generateAndSavePDF('purchase', purchaseData, purchaseItems);
      
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
      console.error("PDF generation error:", error);
      showNotification("error", `PDF generation failed: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== FORM SUBMISSION ====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.supplier_id) {
      showNotification("error", "Please select a supplier");
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
      const purchaseData = {
        supplier_id: parseInt(form.supplier_id),
        warehouse_id: parseInt(form.warehouse_id),
        purchase_date: form.purchase_date,
        payment_method: form.payment_method,
        discount: parseFloat(form.discount) || 0,
        tax: parseFloat(form.tax) || 0,
        paid_amount: parseFloat(form.paid_amount) || 0,
        notes: form.notes,
        status: form.status,
        purchase_number: form.purchase_number,
        subtotal: form.subtotal,
        total_amount: form.total_amount,
        due_amount: form.due_amount
      };

      const result = await api.createPurchase({
        ...purchaseData,
        items: items.map(item => ({
          product_id: parseInt(item.product_id),
          quantity: parseFloat(item.quantity),
          purchase_price: parseFloat(item.purchase_price),
          sale_price: parseFloat(item.sale_price) || 0,
          expiry_date: item.expiry_date || null,
          batch_number: item.batch_number || null
        }))
      });

      if (result.success) {
        const supplier = suppliers.find(s => s.id === parseInt(form.supplier_id));
        const supplierName = supplier?.name || 'Supplier';
        
        showNotification("success", `Purchase ${form.purchase_number} created successfully!`);
        
        await refreshSupplierData(parseInt(form.supplier_id));
        
        const createdPurchaseData = {
          ...purchaseData,
          id: result.data?.id,
          purchase_number: form.purchase_number
        };
        setLastCreatedPurchase(createdPurchaseData);
        
        await resetForm();
      } else {
        showNotification("error", result.error || "Failed to create purchase");
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
      purchase_number: "",
      supplier_id: "",
      warehouse_id: form.warehouse_id || "",
      purchase_date: new Date().toISOString().split("T")[0],
      payment_method: "cash",
      notes: "",
      discount: 0,
      tax: 0,
      paid_amount: 0,
      status: "pending",
      subtotal: 0,
      total_amount: 0,
      due_amount: 0
    });

    const numberResult = await api.generatePurchaseNumber();
    if (numberResult.success) {
      setForm(prev => ({ ...prev, purchase_number: numberResult.data.purchase_number }));
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

  const getSupplierName = (id) => {
    const supplier = suppliers.find(s => s.id === parseInt(id));
    return supplier?.name || "Select Supplier";
  };

  const getWarehouseName = (id) => {
    const warehouse = warehouses.find(w => w.id === parseInt(id));
    return warehouse?.name || "Select Warehouse";
  };

  // ==================== RENDER ====================
  return (
    <div className="p-3 sm:p-4 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 min-h-screen">

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
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25">
            <ShoppingCart size={18} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 via-amber-700 to-orange-600 bg-clip-text text-transparent">
              New Purchase Order
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <FileText size={10} />
              Create a new purchase from supplier
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {lastCreatedPurchase && (
            <button
              onClick={() => generatePDF(lastCreatedPurchase, items)}
              disabled={isLoading}
              className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50"
            >
              <Download size={12} />
              Last PDF
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
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
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
            {/* Purchase Info */}
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <FileText size={14} className="text-amber-500" />
                Purchase Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    Purchase Number
                  </label>
                  <input
                    type="text"
                    value={form.purchase_number}
                    disabled
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={form.purchase_date}
                    onChange={(e) => setForm(prev => ({ ...prev, purchase_date: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    Supplier *
                  </label>
                  <div className="relative">
                    <select
                      value={form.supplier_id}
                      onChange={(e) => setForm(prev => ({ ...prev, supplier_id: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white transition-all duration-300 appearance-none pr-20"
                      required
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name} {supplier.phone ? `- ${supplier.phone}` : ''}
                        </option>
                      ))}
                    </select>
                    {/* Quick Add Supplier Button */}
                    <button
                      type="button"
                      onClick={openQuickAddSupplier}
                      className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 text-[9px] font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-0.5"
                      title="Add new supplier quickly"
                    >
                      <Plus size={12} />
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    Warehouse *
                  </label>
                  <select
                    value={form.warehouse_id}
                    onChange={(e) => setForm(prev => ({ ...prev, warehouse_id: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white transition-all duration-300 appearance-none"
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
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white transition-all duration-300 appearance-none"
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
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white transition-all duration-300 appearance-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
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
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white transition-all duration-300 resize-none"
                  placeholder="Additional notes..."
                  rows="2"
                />
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Package size={14} className="text-amber-500" />
                  Products ({items.length})
                </h2>
                <span className="text-[10px] text-slate-400">
                  {items.length > 0 ? `${items.length} items added` : 'No items added'}
                </span>
              </div>

              {/* Add Item Row */}
              <div className="bg-amber-50/50 rounded-lg p-3 mb-3 border border-amber-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[9px] font-semibold text-slate-600 uppercase tracking-wider">
                    Add Product
                  </label>
                  <button
                    type="button"
                    onClick={openQuickAddProduct}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-amber-600 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                  >
                    <Plus size={12} />
                    Add New Product
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="relative col-span-2">
                    <label className="block text-[8px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Search Product *
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
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white transition-all duration-300"
                        placeholder="Search by name, code, brand..."
                      />
                      {showProductDropdown && filteredProducts.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                          {filteredProducts.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => selectProduct(product)}
                              onMouseDown={(e) => {
                                e.preventDefault();
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-amber-50 transition-colors flex items-center justify-between"
                            >
                              <span>
                                <span className="font-medium">{product.name}</span>
                                <span className="text-slate-400 ml-2">#{product.code}</span>
                              </span>
                              <span className="text-slate-400 text-[10px]">{product.unit}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {currentItem.product_name && (
                      <p className="text-[9px] text-amber-600 mt-0.5">
                        Selected: {currentItem.product_name} (#{currentItem.product_code})
                      </p>
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
                          total: val * (prev.purchase_price || 0)
                        }));
                      }}
                      onFocus={(e) => {
                        if (e.target.value === '0' || e.target.value === '') {
                          e.target.select();
                        }
                      }}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white transition-all duration-300"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Purchase Price *
                    </label>
                    <input
                      type="number"
                      value={currentItem.purchase_price || ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        setCurrentItem(prev => ({
                          ...prev,
                          purchase_price: val,
                          total: (prev.quantity || 0) * val
                        }));
                      }}
                      onFocus={(e) => {
                        if (e.target.value === '0' || e.target.value === '') {
                          e.target.select();
                        }
                      }}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white transition-all duration-300"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                  <div>
                    <label className="block text-[8px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={currentItem.expiry_date}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, expiry_date: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Batch Number
                    </label>
                    <input
                      type="text"
                      value={currentItem.batch_number}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, batch_number: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white transition-all duration-300"
                      placeholder="Optional"
                    />
                  </div>

                  <div className="flex items-end gap-1.5">
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
                    <button
                      type="button"
                      onClick={addItem}
                      className="px-3 py-1.5 text-[10px] font-medium text-white rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
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
                        <tr key={item.id || index} className="hover:bg-amber-50/30 transition-colors">
                          <td className="px-2 py-1.5 text-slate-400">{index + 1}</td>
                          <td className="px-2 py-1.5">
                            <div>
                              <span className="font-medium text-slate-700">{item.product_name}</span>
                              {item.batch_number && (
                                <span className="text-[8px] text-slate-400 ml-1">#{item.batch_number}</span>
                              )}
                              <span className="text-[8px] text-slate-400 block">{item.unit}</span>
                            </div>
                          </td>
                          <td className="px-2 py-1.5 text-right font-medium text-slate-700">
                            {item.quantity}
                          </td>
                          <td className="px-2 py-1.5 text-right text-slate-600">
                            {formatCurrency(item.purchase_price)}
                          </td>
                          <td className="px-2 py-1.5 text-right font-semibold text-amber-600">
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
            {/* Supplier Info */}
            {form.supplier_id && (
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
                <h3 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Users size={12} className="text-amber-500" />
                  Supplier Details
                </h3>
                {(() => {
                  const supplier = suppliers.find(s => s.id === parseInt(form.supplier_id));
                  if (!supplier) return null;
                  return (
                    <div className="space-y-1 text-xs text-slate-600">
                      <p className="font-medium text-slate-700">{supplier.name}</p>
                      {supplier.phone && (
                        <p className="flex items-center gap-1"><Phone size={10} /> {supplier.phone}</p>
                      )}
                      {supplier.address && (
                        <p className="flex items-center gap-1"><MapPin size={10} /> {supplier.address}</p>
                      )}
                      <p className="flex items-center gap-1 font-medium">
                        <Wallet size={10} />
                        Balance: <span className={supplier.credit > 0 ? 'text-amber-600' : (supplier.debit > 0 ? 'text-red-600' : 'text-emerald-600')}>
                          {formatCurrency((supplier.credit || 0) - (supplier.debit || 0))}
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
                  <Building2 size={12} className="text-amber-500" />
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
                <Receipt size={12} className="text-amber-500" />
                Order Summary
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
                      className="w-20 px-2 py-0.5 text-xs border border-slate-200 rounded text-right focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs items-center">
                  <span className="text-slate-500">Tax</span>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-500">+</span>
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
                      className="w-20 px-2 py-0.5 text-xs border border-slate-200 rounded text-right focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-700">Total</span>
                    <span className="text-amber-600">{formatCurrency(form.total_amount || 0)}</span>
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
                    className="w-24 px-2 py-0.5 text-xs border border-slate-200 rounded text-right focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
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
              disabled={isLoading || items.length === 0 || !form.supplier_id || !form.warehouse_id}
              className="w-full py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Create Purchase Order
                </>
              )}
            </button>

            <p className="text-[8px] text-slate-400 text-center">
              {items.length === 0 && 'Add at least one product'}
              {items.length > 0 && !form.supplier_id && 'Select a supplier'}
              {items.length > 0 && !form.warehouse_id && 'Select a warehouse'}
            </p>
          </div>
        </div>
      </form>

      {/* ===== QUICK ADD PRODUCT MODAL ===== */}
      {quickProductModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
          style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setQuickProductModal({ open: false, mode: "add", data: null });
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-5 animate-scale-in relative max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-t-xl" />
            <button
              onClick={() => setQuickProductModal({ open: false, mode: "add", data: null })}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
            
            <h3 className="text-lg font-semibold text-slate-800 mt-2 mb-1 flex items-center gap-2">
              <Package size={18} className="text-amber-500" />
              Quick Add Product
            </h3>
            <p className="text-[10px] text-slate-400 mb-4">Add a new product to the catalogue</p>

            {Object.keys(validationErrors).length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs font-medium text-red-700 mb-1">Please fix the following errors:</p>
                <ul className="text-[10px] text-red-600 space-y-0.5">
                  {Object.values(validationErrors).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleQuickProductSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Product Name *
                </label>
                <input
                  ref={productNameInputRef}
                  type="text"
                  required
                  value={quickProductForm.name}
                  onChange={(e) => handleQuickProductFieldChange('name', e.target.value)}
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-50 focus:bg-white ${
                    validationErrors.name
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-amber-400 focus:ring-amber-100'
                  }`}
                  placeholder="Enter product name"
                  data-error={!!validationErrors.name}
                  disabled={isLoading}
                />
                {validationErrors.name && (
                  <p className="text-[10px] text-red-500 mt-0.5">{validationErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={quickProductForm.category_id}
                    onChange={(e) => handleQuickProductFieldChange('category_id', e.target.value)}
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-50 focus:bg-white ${
                      validationErrors.category_id
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-amber-400 focus:ring-amber-100'
                    }`}
                    data-error={!!validationErrors.category_id}
                    disabled={isLoading}
                  >
                    <option value="">Select Category</option>
                    {Array.isArray(categories) && categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {validationErrors.category_id && (
                    <p className="text-[10px] text-red-500 mt-0.5">{validationErrors.category_id}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Unit *
                  </label>
                  <select
                    required
                    value={quickProductForm.unit_id}
                    onChange={(e) => handleQuickProductFieldChange('unit_id', e.target.value)}
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-50 focus:bg-white ${
                      validationErrors.unit_id
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-amber-400 focus:ring-amber-100'
                    }`}
                    data-error={!!validationErrors.unit_id}
                    disabled={isLoading}
                  >
                    <option value="">Select Unit</option>
                    {Array.isArray(units) && units.map((u) => (
                      <option key={u.id} value={u.id}>{u.short_name || u.name}</option>
                    ))}
                  </select>
                  {validationErrors.unit_id && (
                    <p className="text-[10px] text-red-500 mt-0.5">{validationErrors.unit_id}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Purchase Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={quickProductForm.purchase_price || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      handleQuickProductFieldChange('purchase_price', value);
                    }}
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        e.target.select();
                      }
                    }}
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-50 focus:bg-white ${
                      validationErrors.purchase_price
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-amber-400 focus:ring-amber-100'
                    }`}
                    placeholder="0.00"
                    data-error={!!validationErrors.purchase_price}
                    disabled={isLoading}
                  />
                  {validationErrors.purchase_price && (
                    <p className="text-[10px] text-red-500 mt-0.5">{validationErrors.purchase_price}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Sale Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={quickProductForm.sale_price || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      handleQuickProductFieldChange('sale_price', value);
                    }}
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        e.target.select();
                      }
                    }}
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-50 focus:bg-white ${
                      validationErrors.sale_price
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-amber-400 focus:ring-amber-100'
                    }`}
                    placeholder="0.00"
                    data-error={!!validationErrors.sale_price}
                    disabled={isLoading}
                  />
                  {validationErrors.sale_price && (
                    <p className="text-[10px] text-red-500 mt-0.5">{validationErrors.sale_price}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-3">
                <button
                  type="button"
                  onClick={() => setQuickProductModal({ open: false, mode: "add", data: null })}
                  className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 text-xs font-medium text-white rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                >
                  {isLoading ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== QUICK ADD SUPPLIER MODAL ===== */}
      {quickSupplierModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
          style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setQuickSupplierModal({ open: false, mode: "add", data: null });
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-5 animate-scale-in relative max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-t-xl" />
            <button
              onClick={() => setQuickSupplierModal({ open: false, mode: "add", data: null })}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
            
            <h3 className="text-lg font-semibold text-slate-800 mt-2 mb-1 flex items-center gap-2">
              <Users size={18} className="text-amber-500" />
              Quick Add Supplier
            </h3>
            <p className="text-[10px] text-slate-400 mb-4">Add a new supplier to the system</p>

            {Object.keys(supplierValidationErrors).length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs font-medium text-red-700 mb-1">Please fix the following errors:</p>
                <ul className="text-[10px] text-red-600 space-y-0.5">
                  {Object.values(supplierValidationErrors).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleQuickSupplierSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Supplier Name *
                </label>
                <input
                  ref={supplierNameInputRef}
                  type="text"
                  required
                  value={quickSupplierForm.name}
                  onChange={(e) => handleSupplierFieldChange('name', e.target.value)}
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-50 focus:bg-white ${
                    supplierValidationErrors.name
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-amber-400 focus:ring-amber-100'
                  }`}
                  placeholder="Enter supplier name"
                  data-error={!!supplierValidationErrors.name}
                  disabled={isLoading}
                />
                {supplierValidationErrors.name && (
                  <p className="text-[10px] text-red-500 mt-0.5">{supplierValidationErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={quickSupplierForm.phone}
                    onChange={(e) => handleSupplierFieldChange('phone', e.target.value)}
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-50 focus:bg-white ${
                      supplierValidationErrors.phone
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-amber-400 focus:ring-amber-100'
                    }`}
                    placeholder="03XX-XXXXXXX"
                    data-error={!!supplierValidationErrors.phone}
                    disabled={isLoading}
                  />
                  {supplierValidationErrors.phone && (
                    <p className="text-[10px] text-red-500 mt-0.5">{supplierValidationErrors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={quickSupplierForm.email}
                    onChange={(e) => handleSupplierFieldChange('email', e.target.value)}
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-50 focus:bg-white ${
                      supplierValidationErrors.email
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-amber-400 focus:ring-amber-100'
                    }`}
                    placeholder="supplier@example.com"
                    data-error={!!supplierValidationErrors.email}
                    disabled={isLoading}
                  />
                  {supplierValidationErrors.email && (
                    <p className="text-[10px] text-red-500 mt-0.5">{supplierValidationErrors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={quickSupplierForm.address}
                  onChange={(e) => handleSupplierFieldChange('address', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-slate-50 focus:bg-white"
                  placeholder="Enter address"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  CNIC
                </label>
                <input
                  type="text"
                  value={quickSupplierForm.cnic}
                  onChange={(e) => handleSupplierFieldChange('cnic', e.target.value)}
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-50 focus:bg-white ${
                    supplierValidationErrors.cnic
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-amber-400 focus:ring-amber-100'
                  }`}
                  placeholder="XXXXX-XXXXXXX-X"
                  data-error={!!supplierValidationErrors.cnic}
                  disabled={isLoading}
                />
                {supplierValidationErrors.cnic && (
                  <p className="text-[10px] text-red-500 mt-0.5">{supplierValidationErrors.cnic}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Credit (Supplier owes us)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={quickSupplierForm.credit || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      handleSupplierFieldChange('credit', value);
                    }}
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-50 focus:bg-white ${
                      supplierValidationErrors.credit
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-amber-400 focus:ring-amber-100'
                    }`}
                    placeholder="0.00"
                    data-error={!!supplierValidationErrors.credit}
                    disabled={isLoading}
                  />
                  {supplierValidationErrors.credit && (
                    <p className="text-[10px] text-red-500 mt-0.5">{supplierValidationErrors.credit}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Debit (We owe supplier)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={quickSupplierForm.debit || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      handleSupplierFieldChange('debit', value);
                    }}
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-50 focus:bg-white ${
                      supplierValidationErrors.debit
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-amber-400 focus:ring-amber-100'
                    }`}
                    placeholder="0.00"
                    data-error={!!supplierValidationErrors.debit}
                    disabled={isLoading}
                  />
                  {supplierValidationErrors.debit && (
                    <p className="text-[10px] text-red-500 mt-0.5">{supplierValidationErrors.debit}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Notes
                </label>
                <textarea
                  value={quickSupplierForm.notes}
                  onChange={(e) => handleSupplierFieldChange('notes', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-slate-50 focus:bg-white resize-none"
                  placeholder="Additional notes..."
                  rows="2"
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-3">
                <button
                  type="button"
                  onClick={() => setQuickSupplierModal({ open: false, mode: "add", data: null })}
                  className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 text-xs font-medium text-white rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                >
                  {isLoading ? 'Adding...' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-slide-down {
          animation: slideDown 0.25s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}