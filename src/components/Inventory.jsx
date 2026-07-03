// src/pages/Inventory/Inventory.jsx

import React, { useState, useEffect } from "react";
import {
  Search,
  Package,
  Box,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  X,
  Building2,
  Filter,
  ChevronDown,
  ChevronRight,
  Calendar,
  Layers,
  Settings,
  ArrowUpDown,
  Download,
  RefreshCw,
  Warehouse,
  Info,
  Zap,
  BarChart3,
  Grid,
  List,
  Eye,
  Loader2
} from "lucide-react";

const api = window.api || {};

// ==================== GRADIENT COLOR MAPS ====================
const colorSchemes = [
  { from: "from-blue-500", to: "to-indigo-600", light: "from-blue-50/50 to-indigo-50/30", icon: "text-blue-500", shadow: "shadow-blue-500/20" },
  { from: "from-emerald-500", to: "to-teal-600", light: "from-emerald-50/50 to-teal-50/30", icon: "text-emerald-500", shadow: "shadow-emerald-500/20" },
  { from: "from-amber-500", to: "to-orange-600", light: "from-amber-50/50 to-orange-50/30", icon: "text-amber-500", shadow: "shadow-amber-500/20" },
  { from: "from-rose-500", to: "to-pink-600", light: "from-rose-50/50 to-pink-50/30", icon: "text-rose-500", shadow: "shadow-rose-500/20" },
  { from: "from-purple-500", to: "to-violet-600", light: "from-purple-50/50 to-violet-50/30", icon: "text-purple-500", shadow: "shadow-purple-500/20" },
  { from: "from-cyan-500", to: "to-sky-600", light: "from-cyan-50/50 to-sky-50/30", icon: "text-cyan-500", shadow: "shadow-cyan-500/20" },
];

const STATUS_OPTIONS = ["All", "In Stock", "Low Stock", "Out of Stock"];

export default function Inventory() {
  // ==================== STATE ====================
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalQuantity: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedWarehouse, setSelectedWarehouse] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Expanded rows
  const [expandedRows, setExpandedRows] = useState({});

  // Reorder Modal
  const [reorderModal, setReorderModal] = useState({
    open: false,
    product: null
  });
  const [reorderForm, setReorderForm] = useState({
    reorder_level: 0
  });

  // Notification
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: ""
  });

  // View mode
  const [viewMode, setViewMode] = useState("table");

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, selectedCategory, selectedWarehouse, selectedStatus, sortBy, sortOrder]);

  // ==================== DATA LOADING ====================
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load warehouses first
      const warehousesResult = await api.getActiveOnlyWarehouses();
      if (warehousesResult.success) {
        setWarehouses(warehousesResult.data || []);
      }

      // Load products
      const productsResult = await api.getProducts();
      
      let productsData = [];
      if (Array.isArray(productsResult)) {
        productsData = productsResult;
      } else if (productsResult.success && productsResult.data) {
        productsData = productsResult.data;
      } else if (productsResult.success && Array.isArray(productsResult)) {
        productsData = productsResult;
      } else {
        productsData = [];
        console.warn('Products data not available:', productsResult);
      }

      console.log('📦 Products loaded:', productsData.length);

      // Process each product to get inventory and batches
      const productsWithInventory = await Promise.all(
        productsData.map(async (product) => {
          try {
            const inventoryResult = await api.getInventoryByProduct(product.id);
            const inventoryData = inventoryResult.success ? inventoryResult.data : [];
            
            // Get batches for this product
            const batchesResult = await api.getBatchesByProduct(product.id);
            const batchesData = batchesResult.success ? batchesResult.data : [];

            // Calculate total quantity from inventory
            const totalQuantity = inventoryData.reduce((sum, item) => sum + (item.quantity || 0), 0);

            let categoryName = '';
            if (product.category_id) {
              try {
                const catResult = await api.getCategoryById(product.category_id);
                if (catResult && typeof catResult === 'object') {
                  if (catResult.name) {
                    categoryName = catResult.name;
                  } else if (catResult.success && catResult.data && catResult.data.name) {
                    categoryName = catResult.data.name;
                  } else if (catResult.data && catResult.data.name) {
                    categoryName = catResult.data.name;
                  }
                }
              } catch (err) {
                console.error('Error fetching category:', err);
              }
            }

            return {
              ...product,
              inventory: inventoryData,
              batches: batchesData,
              total_quantity: totalQuantity,
              category: categoryName || 'Uncategorized'
            };
          } catch (err) {
            console.error(`Error processing product ${product.id}:`, err);
            return {
              ...product,
              inventory: [],
              batches: [],
              total_quantity: 0,
              category: 'Uncategorized'
            };
          }
        })
      );

      console.log('📊 Products with inventory:', productsWithInventory.length);
      console.log('📊 Products with stock:', productsWithInventory.filter(p => p.total_quantity > 0).length);

      setProducts(productsWithInventory);
      calculateSummary(productsWithInventory);

      // Extract unique categories
      const uniqueCategories = ["All", ...new Set(productsWithInventory.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);

      // Get inventory summary
      try {
        const summaryResult = await api.getInventorySummary();
        if (summaryResult.success) {
          setSummary(prev => ({
            ...prev,
            ...summaryResult.data
          }));
        }
      } catch (err) {
        console.error('Error fetching summary:', err);
      }

    } catch (err) {
      console.error("Error loading data:", err);
      showNotification("error", "Failed to load inventory data");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSummary = (data) => {
    const products = data || [];
    const totalProducts = products.length;
    const totalQuantity = products.reduce((sum, p) => sum + (p.total_quantity || 0), 0);
    const totalValue = products.reduce((sum, p) => sum + ((p.total_quantity || 0) * (p.sale_price || 0)), 0);
    const lowStockCount = products.filter(p => {
      const total = p.total_quantity || 0;
      return total > 0 && total <= (p.reorder_level || 0);
    }).length;
    const outOfStockCount = products.filter(p => (p.total_quantity || 0) <= 0).length;

    setSummary({ totalProducts, totalQuantity, totalValue, lowStockCount, outOfStockCount });
  };

  // ==================== GET WAREHOUSE QUANTITY ====================
  const getWarehouseQuantity = (product, warehouseId) => {
    if (!warehouseId || warehouseId === "All") {
      return product.total_quantity || 0;
    }
    const inv = product.inventory?.find(i => i.warehouse_id === parseInt(warehouseId));
    return inv?.quantity || 0;
  };

  const getWarehouseReserved = (product, warehouseId) => {
    if (!warehouseId || warehouseId === "All") {
      return product.inventory?.reduce((sum, i) => sum + (i.reserved_quantity || 0), 0) || 0;
    }
    const inv = product.inventory?.find(i => i.warehouse_id === parseInt(warehouseId));
    return inv?.reserved_quantity || 0;
  };

  const getWarehouseBatches = (product, warehouseId) => {
    if (!warehouseId || warehouseId === "All") {
      return product.batches || [];
    }
    // Filter batches that have inventory in this warehouse
    const inv = product.inventory?.filter(i => i.warehouse_id === parseInt(warehouseId));
    if (!inv || inv.length === 0) return [];
    const batchIds = inv.map(i => i.batch_id).filter(id => id !== null);
    return product.batches?.filter(b => batchIds.includes(b.id)) || [];
  };

  // ==================== FILTERS & SORTING ====================
  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.code?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Warehouse filter - only show products that have stock in selected warehouse
    if (selectedWarehouse !== "All") {
      const warehouseId = parseInt(selectedWarehouse);
      filtered = filtered.filter(p => {
        return p.inventory?.some(i => i.warehouse_id === warehouseId && i.quantity > 0);
      });
    }

    // Status filter - use warehouse-specific quantity
    if (selectedStatus !== "All") {
      filtered = filtered.filter(p => {
        const qty = getWarehouseQuantity(p, selectedWarehouse);
        const reorderLevel = p.reorder_level || 0;
        
        let status;
        if (qty <= 0) status = "Out of Stock";
        else if (qty <= reorderLevel) status = "Low Stock";
        else status = "In Stock";
        
        return status === selectedStatus;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case "name":
          valA = a.name || "";
          valB = b.name || "";
          break;
        case "code":
          valA = a.code || "";
          valB = b.code || "";
          break;
        case "quantity":
          valA = getWarehouseQuantity(a, selectedWarehouse);
          valB = getWarehouseQuantity(b, selectedWarehouse);
          break;
        case "price":
          valA = a.sale_price || 0;
          valB = b.sale_price || 0;
          break;
        case "value":
          valA = getWarehouseQuantity(a, selectedWarehouse) * (a.sale_price || 0);
          valB = getWarehouseQuantity(b, selectedWarehouse) * (b.sale_price || 0);
          break;
        case "category":
          valA = a.category || "";
          valB = b.category || "";
          break;
        default:
          valA = a.name || "";
          valB = b.name || "";
      }

      if (typeof valA === "string") {
        return sortOrder === "asc" 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    setFilteredProducts(filtered);
  };

  // ==================== HELPERS ====================
  const getStockStatus = (product) => {
    const qty = getWarehouseQuantity(product, selectedWarehouse);
    const reorderLevel = product.reorder_level || 0;

    if (qty <= 0) return { label: "Out of Stock", color: "text-red-600 bg-red-50 border-red-200" };
    if (qty <= reorderLevel) return { label: "Low Stock", color: "text-amber-600 bg-amber-50 border-amber-200" };
    return { label: "In Stock", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  };

  const toggleRowExpand = (productId) => {
    setExpandedRows(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 3000);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getWarehouseName = (id) => {
    const warehouse = warehouses.find(w => w.id === id);
    return warehouse?.name || "Unknown";
  };

  const getUnitDisplay = (unit, quantity) => {
    if (!unit) return '';
    const pluralMap = {
      'Liter': 'Liters',
      'Kilogram': 'Kilograms',
      'Gram': 'Grams',
      'Milliliter': 'Milliliters',
      'Bottle': 'Bottles',
      'Bag': 'Bags',
      'Pack': 'Packs',
      'Piece': 'Pieces'
    };
    
    if (quantity === 1 || quantity === 1.0) {
      return unit;
    }
    return pluralMap[unit] || unit + 's';
  };

  // ==================== REORDER LEVEL ====================
  const openReorderModal = (product) => {
    setReorderForm({
      reorder_level: product.reorder_level || 0
    });
    setReorderModal({
      open: true,
      product: product
    });
  };

  const handleReorderUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const product = reorderModal.product;
      const newLevel = parseFloat(reorderForm.reorder_level);

      const result = await api.updateMinMaxStock(
        product.id,
        null,
        newLevel,
        null
      );
      
      if (result.success) {
        const updatedProducts = products.map(p => {
          if (p.id === product.id) {
            return { ...p, reorder_level: newLevel };
          }
          return p;
        });
        setProducts(updatedProducts);
        calculateSummary(updatedProducts);
        showNotification("success", `Reorder level updated to ${newLevel} ${product.unit || ''}`);
        setReorderModal({ open: false, product: null });
      } else {
        showNotification("error", result.error || "Failed to update reorder level");
      }
    } catch (err) {
      console.error("Update reorder error:", err);
      showNotification("error", err.message || "Failed to update reorder level");
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== EXPORT ====================
  const handleExport = () => {
    const headers = ["Product Code", "Product Name", "Category", "Total Quantity", "Unit", "Sale Price", "Purchase Price", "Reorder Level", "Status"];
    const rows = filteredProducts.map(p => {
      const status = getStockStatus(p);
      const qty = getWarehouseQuantity(p, selectedWarehouse);
      return [
        p.code || "",
        p.name || "",
        p.category || "",
        qty,
        p.unit || "",
        p.sale_price || 0,
        p.purchase_price || 0,
        p.reorder_level || 0,
        status.label
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification("success", "Inventory exported successfully!");
  };

  // ==================== RENDER ====================
  return (
    <div className="p-3 sm:p-4 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 min-h-screen">

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
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
            <BarChart3 size={18} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 via-indigo-700 to-blue-600 bg-clip-text text-transparent">
              Inventory Management
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Package size={10} />
              Track stock across {warehouses.length} warehouse{warehouses.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleExport}
            disabled={filteredProducts.length === 0}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
          >
            <Download size={12} />
            Export
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => setViewMode(viewMode === "table" ? "card" : "table")}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium border rounded-lg transition-all duration-300 shadow-sm hover:shadow-md bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
          >
            {viewMode === "table" ? (
              <><Grid size={12} /> Card</>
            ) : (
              <><List size={12} /> Table</>
            )}
          </button>
        </div>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
        <div className="relative overflow-hidden bg-white rounded-lg border border-slate-200/60 shadow-sm p-2.5 hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-indigo-600/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center justify-between relative">
            <span className="text-[8px] text-slate-500 font-medium">Total Products</span>
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/20">
              <Package size={12} />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-800 mt-0.5 relative">{summary.totalProducts}</p>
          <div className="w-full h-0.5 bg-gradient-to-r from-blue-500/20 to-transparent mt-1 rounded-full" />
        </div>

        <div className="relative overflow-hidden bg-white rounded-lg border border-slate-200/60 shadow-sm p-2.5 hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/10 to-teal-600/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center justify-between relative">
            <span className="text-[8px] text-slate-500 font-medium">Total Quantity</span>
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/20">
              <Box size={12} />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-800 mt-0.5 relative">{summary.totalQuantity.toFixed(1)}</p>
          <div className="w-full h-0.5 bg-gradient-to-r from-emerald-500/20 to-transparent mt-1 rounded-full" />
        </div>

        <div className="relative overflow-hidden bg-white rounded-lg border border-slate-200/60 shadow-sm p-2.5 hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-500/10 to-orange-600/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center justify-between relative">
            <span className="text-[8px] text-slate-500 font-medium">Total Value</span>
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-amber-500/20">
              <TrendingUp size={12} />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-800 mt-0.5 relative">₨{summary.totalValue.toFixed(0)}</p>
          <div className="w-full h-0.5 bg-gradient-to-r from-amber-500/20 to-transparent mt-1 rounded-full" />
        </div>

        <div className="relative overflow-hidden bg-white rounded-lg border border-slate-200/60 shadow-sm p-2.5 hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-rose-500/10 to-pink-600/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center justify-between relative">
            <span className="text-[8px] text-slate-500 font-medium">Low Stock</span>
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-500/20">
              <AlertCircle size={12} />
            </div>
          </div>
          <p className="text-lg font-bold text-rose-600 mt-0.5 relative">{summary.lowStockCount}</p>
          <div className="w-full h-0.5 bg-gradient-to-r from-rose-500/20 to-transparent mt-1 rounded-full" />
        </div>

        <div className="relative overflow-hidden bg-white rounded-lg border border-slate-200/60 shadow-sm p-2.5 hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center justify-between relative">
            <span className="text-[8px] text-slate-500 font-medium">Out of Stock</span>
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white shadow-sm shadow-red-500/20">
              <X size={12} />
            </div>
          </div>
          <p className="text-lg font-bold text-red-600 mt-0.5 relative">{summary.outOfStockCount}</p>
          <div className="w-full h-0.5 bg-gradient-to-r from-red-500/20 to-transparent mt-1 rounded-full" />
        </div>
      </div>

      {/* ===== FILTERS ===== */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/60 shadow-sm p-2.5 mb-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white transition-all"
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

          <div className="relative w-full lg:w-32">
            <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white transition-all appearance-none"
            >
              {categories.length > 0 ? categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              )) : (
                <option value="All">All</option>
              )}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative w-full lg:w-32">
            <Building2 size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white transition-all appearance-none"
            >
              <option value="All">All WH</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative w-full lg:w-28">
            <AlertCircle size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white transition-all appearance-none"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 size={10} className="animate-spin" />
                Loading...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Zap size={10} className="text-indigo-400" />
                {filteredProducts.length} items
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ===== PRODUCT LIST ===== */}
      {isLoading && filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm p-8 text-center">
          <div className="inline-flex items-center gap-2 text-slate-400 text-xs">
            <Loader2 size={16} className="animate-spin" />
            Loading inventory...
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-3">
            <Package size={28} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600">No products found</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {searchQuery || selectedCategory !== "All" || selectedStatus !== "All"
              ? "Try adjusting your filters"
              : "Add products to start tracking inventory"}
          </p>
        </div>
      ) : viewMode === "table" ? (
        // ===== TABLE VIEW =====
        <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider w-6"></th>
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-0.5">Product <ArrowUpDown size={10} className="opacity-50" /></div>
                  </th>
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort("category")}>
                    <div className="flex items-center gap-0.5">Category <ArrowUpDown size={10} className="opacity-50" /></div>
                  </th>
                  <th className="px-2 py-1.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort("quantity")}>
                    <div className="flex items-center justify-end gap-0.5">Qty <ArrowUpDown size={10} className="opacity-50" /></div>
                  </th>
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Distribution</th>
                  <th className="px-2 py-1.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort("price")}>
                    <div className="flex items-center justify-end gap-0.5">Price <ArrowUpDown size={10} className="opacity-50" /></div>
                  </th>
                  <th className="px-2 py-1.5 text-center text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-2 py-1.5 text-center text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product, index) => {
                  const stockStatus = getStockStatus(product);
                  const hasInventory = product.inventory && product.inventory.length > 0;
                  const hasBatches = product.batches && product.batches.length > 0;
                  const isExpanded = expandedRows[product.id];
                  const displayQty = getWarehouseQuantity(product, selectedWarehouse);
                  const displayBatches = getWarehouseBatches(product, selectedWarehouse);
                  const rowColor = displayQty <= 0 ? 'bg-red-50/30' : 
                                   displayQty <= (product.reorder_level || 0) ? 'bg-amber-50/20' : 
                                   index % 2 === 0 ? 'bg-white' : 'bg-slate-50/20';

                  return (
                    <React.Fragment key={product.id}>
                      <tr className={`${rowColor} hover:bg-indigo-50/20 transition-all duration-200 group`}>
                        <td className="px-2 py-1.5">
                          {(hasInventory || hasBatches) && (
                            <button
                              onClick={() => toggleRowExpand(product.id)}
                              className="p-0.5 rounded hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            </button>
                          )}
                        </td>
                        <td className="px-2 py-1.5">
                          <div>
                            <span className="text-xs font-medium text-slate-800 group-hover:text-indigo-700 transition-colors">{product.name}</span>
                            {product.code && <span className="text-[8px] text-slate-400 block">#{product.code}</span>}
                          </div>
                        </td>
                        <td className="px-2 py-1.5 hidden sm:table-cell">
                          <span className="text-[8px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-full">
                            {product.category || '-'}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-right font-medium">
                          <span className={`${displayQty <= 0 ? 'text-red-600' : 'text-slate-700'}`}>
                            {displayQty.toFixed(1)}
                          </span>
                          <span className="text-[8px] text-slate-400 ml-0.5">{getUnitDisplay(product.unit, displayQty)}</span>
                        </td>
                        <td className="px-2 py-1.5 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-0.5">
                            {product.inventory?.filter(i => i.quantity > 0).length > 0 ? (
                              product.inventory.filter(i => i.quantity > 0).map((inv) => (
                                <span 
                                  key={inv.warehouse_id} 
                                  className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[8px] ${
                                    selectedWarehouse !== "All" && inv.warehouse_id === parseInt(selectedWarehouse)
                                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                      : 'bg-indigo-50 text-indigo-600'
                                  }`}
                                >
                                  <Warehouse size={6} />
                                  {getWarehouseName(inv.warehouse_id)}: {inv.quantity}
                                </span>
                              ))
                            ) : (
                              <span className="text-[8px] text-slate-400">No stock</span>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-right text-xs text-slate-600 hidden md:table-cell">
                          ₨{product.sale_price?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-medium rounded-full border ${stockStatus.color}`}>
                            <span className={`w-1 h-1 rounded-full ${
                              stockStatus.label === "In Stock" ? "bg-emerald-500" :
                              stockStatus.label === "Low Stock" ? "bg-amber-500" : "bg-red-500"
                            }`} />
                            {stockStatus.label}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <button
                            onClick={() => openReorderModal(product)}
                            className="p-0.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-all duration-200 group-hover:scale-110"
                            title="Set Reorder Level"
                          >
                            <Settings size={12} />
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan="8" className="px-2 py-2 bg-gradient-to-r from-indigo-50/50 via-blue-50/30 to-slate-50/50">
                            <div className="ml-4 space-y-2">
                              {product.inventory && product.inventory.length > 0 && (
                                <div>
                                  <h4 className="text-[9px] font-semibold text-indigo-600 mb-1 flex items-center gap-1">
                                    <Building2 size={10} />
                                    Stock by Warehouse
                                  </h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                                    {product.inventory.map((inv) => (
                                      <div 
                                        key={inv.warehouse_id} 
                                        className={`bg-white rounded border p-1.5 shadow-sm ${
                                          selectedWarehouse !== "All" && inv.warehouse_id === parseInt(selectedWarehouse)
                                            ? 'border-emerald-400 bg-emerald-50/30'
                                            : 'border-indigo-100'
                                        }`}
                                      >
                                        <p className="text-[9px] font-medium text-slate-700">{getWarehouseName(inv.warehouse_id)}</p>
                                        <p className="text-[8px] text-slate-500">Qty: <span className="font-semibold text-indigo-600">{inv.quantity} {getUnitDisplay(product.unit, inv.quantity)}</span></p>
                                        {inv.reserved_quantity > 0 && <p className="text-[7px] text-amber-600">Reserved: {inv.reserved_quantity}</p>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {displayBatches.length > 0 && (
                                <div>
                                  <h4 className="text-[9px] font-semibold text-indigo-600 mb-1 flex items-center gap-1">
                                    <Layers size={10} />
                                    Batches
                                  </h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                                    {displayBatches.map((batch) => (
                                      <div key={batch.id} className="bg-white rounded border border-indigo-100 p-1.5 shadow-sm">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <p className="text-[9px] font-semibold text-slate-700">{batch.batch_number}</p>
                                            <p className="text-[8px] text-slate-500">Qty: {batch.quantity} {getUnitDisplay(product.unit, batch.quantity)}</p>
                                          </div>
                                          {batch.expiry_date && (
                                            <span className={`text-[7px] px-1 py-0.5 rounded-full font-medium ${
                                              new Date(batch.expiry_date) < new Date() 
                                                ? "bg-red-100 text-red-600" 
                                                : new Date(batch.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                                ? "bg-amber-100 text-amber-600"
                                                : "bg-emerald-100 text-emerald-600"
                                            }`}>
                                              <Calendar size={6} className="inline mr-0.5" />
                                              {new Date(batch.expiry_date).toLocaleDateString()}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // ===== CARD VIEW =====
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {filteredProducts.map((product, index) => {
            const stockStatus = getStockStatus(product);
            const color = colorSchemes[index % colorSchemes.length];
            const displayQty = getWarehouseQuantity(product, selectedWarehouse);

            return (
              <div key={product.id} className="group bg-white rounded-lg border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 p-3 hover:-translate-y-0.5 hover:border-indigo-300">
                <div className="relative overflow-hidden">
                  <div className={`absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br ${color.light} rounded-full group-hover:scale-150 transition-transform duration-500`} />
                  
                  <div className="flex items-start justify-between relative">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{product.name}</h3>
                      {product.code && <p className="text-[8px] text-slate-400">#{product.code}</p>}
                    </div>
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[7px] font-medium rounded-full border ${stockStatus.color} shadow-sm`}>
                      <span className={`w-1 h-1 rounded-full ${
                        stockStatus.label === "In Stock" ? "bg-emerald-500" :
                        stockStatus.label === "Low Stock" ? "bg-amber-500" : "bg-red-500"
                      }`} />
                      {stockStatus.label}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center gap-1.5 relative">
                    <span className="text-[8px] text-slate-500 bg-gradient-to-r from-slate-100 to-slate-50 px-1.5 py-0.5 rounded-full">
                      {product.category || '-'}
                    </span>
                    <span className="text-[8px] text-slate-500">{product.unit || ''}</span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-1.5 relative">
                    <div className={`bg-gradient-to-br ${color.light} rounded-lg p-1.5`}>
                      <p className="text-[7px] text-slate-400 uppercase font-medium">
                        {selectedWarehouse !== "All" ? 'Warehouse Qty' : 'Total Qty'}
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        {displayQty.toFixed(1)}
                      </p>
                    </div>
                    <div className={`bg-gradient-to-br ${color.light} rounded-lg p-1.5`}>
                      <p className="text-[7px] text-slate-400 uppercase font-medium">Price</p>
                      <p className="text-sm font-bold text-emerald-600">₨{product.sale_price?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>

                  {selectedWarehouse !== "All" && (
                    <div className="mt-1.5 text-[8px] text-slate-400">
                      Total across all: {product.total_quantity?.toFixed(1) || 0} {getUnitDisplay(product.unit, product.total_quantity)}
                    </div>
                  )}

                  {product.inventory && product.inventory.filter(i => i.quantity > 0).length > 0 && (
                    <div className="mt-2 relative">
                      <p className="text-[7px] text-slate-400 uppercase font-medium mb-0.5">Warehouses</p>
                      <div className="flex flex-wrap gap-0.5">
                        {product.inventory.filter(i => i.quantity > 0).map((inv) => (
                          <span 
                            key={inv.warehouse_id} 
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r ${color.light} rounded-full text-[7px] ${
                              selectedWarehouse !== "All" && inv.warehouse_id === parseInt(selectedWarehouse)
                                ? 'border border-emerald-400 font-semibold'
                                : ''
                            }`}
                          >
                            <Warehouse size={6} />
                            {getWarehouseName(inv.warehouse_id)}: {inv.quantity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between relative">
                    <button
                      onClick={() => openReorderModal(product)}
                      className="text-[8px] text-amber-500 hover:text-amber-600 font-medium transition-colors"
                    >
                      Reorder: {product.reorder_level || 0}
                    </button>
                    <button
                      onClick={() => toggleRowExpand(product.id)}
                      className="p-0.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Info size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== REORDER MODAL ===== */}
      {reorderModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-4 animate-scale-in relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-600 rounded-t-xl" />
            <button
              onClick={() => setReorderModal({ open: false, product: null })}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 mt-2 mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20">
                <Settings size={16} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">Set Reorder Level</h3>
                <p className="text-[10px] text-slate-500">
                  {reorderModal.product?.name} - Current: {reorderModal.product?.reorder_level || 0} {getUnitDisplay(reorderModal.product?.unit, reorderModal.product?.reorder_level || 0)}
                </p>
              </div>
            </div>

            <form onSubmit={handleReorderUpdate} className="space-y-2.5">
              <div>
                <label className="block text-[8px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  Reorder Level ({reorderModal.product?.unit || ''}) *
                </label>
                <input
                  type="number"
                  value={reorderForm.reorder_level}
                  onChange={(e) => setReorderForm(prev => ({ ...prev, reorder_level: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white"
                  placeholder="Enter reorder level"
                  min="0"
                  step="1"
                  required
                />
                <p className="text-[8px] text-slate-400 mt-0.5">
                  When stock falls below this level, product shows as "Low Stock"
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setReorderModal({ open: false, product: null })}
                  className="px-3 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-3 py-1 text-[10px] font-medium text-white rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  {isLoading ? 'Saving...' : 'Update Level'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
          animation: fadeIn 0.15s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-slide-down {
          animation: slideDown 0.15s ease-out;
        }
      `}</style>
    </div>
  );
}