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
  Eye
} from "lucide-react";

// ==================== MOCK DATA ====================
const MOCK_INVENTORY = [
  {
    id: 1,
    product_id: 1,
    name: "Pesticide X",
    code: "PST-001",
    category: "Insecticides",
    unit: "Liter",
    sale_price: 450,
    purchase_price: 320,
    reorder_level: 20,
    total_quantity: 210,
    inventory: [
      { warehouse_id: 1, warehouse_name: "Main Warehouse", quantity: 150, reserved: 10 },
      { warehouse_id: 2, warehouse_name: "Branch Warehouse", quantity: 60, reserved: 0 }
    ],
    batches: [
      { id: 1, batch_number: "BATCH-001", quantity: 100, expiry_date: "2025-12-31" },
      { id: 2, batch_number: "BATCH-002", quantity: 50, expiry_date: "2026-06-15" }
    ]
  },
  {
    id: 2,
    product_id: 2,
    name: "Herbicide Y",
    code: "HRB-002",
    category: "Herbicides",
    unit: "Kilogram",
    sale_price: 320,
    purchase_price: 220,
    reorder_level: 15,
    total_quantity: 195,
    inventory: [
      { warehouse_id: 1, warehouse_name: "Main Warehouse", quantity: 75, reserved: 5 },
      { warehouse_id: 3, warehouse_name: "Storage Facility", quantity: 120, reserved: 0 }
    ],
    batches: [
      { id: 4, batch_number: "BATCH-003", quantity: 75, expiry_date: "2025-09-20" },
      { id: 5, batch_number: "BATCH-009", quantity: 120, expiry_date: "2025-10-10" }
    ]
  },
  {
    id: 3,
    product_id: 3,
    name: "Fungicide Z",
    code: "FNG-003",
    category: "Fungicides",
    unit: "Liter",
    sale_price: 280,
    purchase_price: 190,
    reorder_level: 25,
    total_quantity: 35,
    inventory: [
      { warehouse_id: 1, warehouse_name: "Main Warehouse", quantity: 5, reserved: 0 },
      { warehouse_id: 2, warehouse_name: "Branch Warehouse", quantity: 30, reserved: 0 }
    ],
    batches: [
      { id: 6, batch_number: "BATCH-004", quantity: 5, expiry_date: "2025-07-10" },
      { id: 7, batch_number: "BATCH-007", quantity: 30, expiry_date: "2025-08-15" }
    ]
  },
  {
    id: 4,
    product_id: 4,
    name: "Rodenticide R",
    code: "RDT-004",
    category: "Rodenticides",
    unit: "Kilogram",
    sale_price: 550,
    purchase_price: 400,
    reorder_level: 10,
    total_quantity: 10,
    inventory: [
      { warehouse_id: 2, warehouse_name: "Branch Warehouse", quantity: 10, reserved: 0 }
    ],
    batches: [
      { id: 8, batch_number: "BATCH-008", quantity: 10, expiry_date: "2025-11-30" }
    ]
  },
  {
    id: 5,
    product_id: 5,
    name: "Fertilizer F",
    code: "FRT-005",
    category: "Fertilizers",
    unit: "Kilogram",
    sale_price: 180,
    purchase_price: 120,
    reorder_level: 50,
    total_quantity: 500,
    inventory: [
      { warehouse_id: 1, warehouse_name: "Main Warehouse", quantity: 200, reserved: 0 },
      { warehouse_id: 3, warehouse_name: "Storage Facility", quantity: 300, reserved: 0 }
    ],
    batches: [
      { id: 9, batch_number: "BATCH-005", quantity: 200, expiry_date: "2026-03-01" },
      { id: 10, batch_number: "BATCH-010", quantity: 300, expiry_date: "2026-01-15" }
    ]
  },
  {
    id: 6,
    product_id: 6,
    name: "Spray Bottle S",
    code: "SPR-006",
    category: "Insecticides",
    unit: "Bottle",
    sale_price: 150,
    purchase_price: 90,
    reorder_level: 30,
    total_quantity: 0,
    inventory: [],
    batches: []
  },
  {
    id: 7,
    product_id: 7,
    name: "Weed Killer W",
    code: "WDK-007",
    category: "Herbicides",
    unit: "Liter",
    sale_price: 250,
    purchase_price: 170,
    reorder_level: 20,
    total_quantity: 8,
    inventory: [
      { warehouse_id: 2, warehouse_name: "Branch Warehouse", quantity: 8, reserved: 0 }
    ],
    batches: [
      { id: 11, batch_number: "BATCH-011", quantity: 8, expiry_date: "2025-06-01" }
    ]
  },
  {
    id: 8,
    product_id: 8,
    name: "Growth Booster G",
    code: "GRB-008",
    category: "Fertilizers",
    unit: "Liter",
    sale_price: 150,
    purchase_price: 90,
    reorder_level: 40,
    total_quantity: 45,
    inventory: [
      { warehouse_id: 1, warehouse_name: "Main Warehouse", quantity: 45, reserved: 0 }
    ],
    batches: [
      { id: 12, batch_number: "BATCH-012", quantity: 45, expiry_date: "2026-04-20" }
    ]
  },
  {
    id: 9,
    product_id: 9,
    name: "Pesticide Tablet T",
    code: "PST-009",
    category: "Insecticides",
    unit: "Pack",
    sale_price: 250,
    purchase_price: 180,
    reorder_level: 10,
    total_quantity: 50,
    inventory: [
      { warehouse_id: 1, warehouse_name: "Main Warehouse", quantity: 30, reserved: 0 },
      { warehouse_id: 2, warehouse_name: "Branch Warehouse", quantity: 20, reserved: 0 }
    ],
    batches: [
      { id: 13, batch_number: "BATCH-013", quantity: 30, expiry_date: "2026-08-10" },
      { id: 14, batch_number: "BATCH-014", quantity: 20, expiry_date: "2026-09-15" }
    ]
  },
  {
    id: 10,
    product_id: 10,
    name: "Fertilizer Bag B",
    code: "FRT-010",
    category: "Fertilizers",
    unit: "Bag",
    sale_price: 350,
    purchase_price: 250,
    reorder_level: 5,
    total_quantity: 15,
    inventory: [
      { warehouse_id: 3, warehouse_name: "Storage Facility", quantity: 15, reserved: 0 }
    ],
    batches: [
      { id: 15, batch_number: "BATCH-015", quantity: 15, expiry_date: "2026-12-01" }
    ]
  }
];

const MOCK_WAREHOUSES = [
  { id: 1, name: "Main Warehouse", location: "Ground Floor" },
  { id: 2, name: "Branch Warehouse", location: "First Floor" },
  { id: 3, name: "Storage Facility", location: "Industrial Area" }
];

const MOCK_CATEGORIES = ["All", "Insecticides", "Herbicides", "Fungicides", "Rodenticides", "Fertilizers"];
const STATUS_OPTIONS = ["All", "In Stock", "Low Stock", "Out of Stock"];

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

export default function Inventory() {
  // ==================== STATE ====================
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [warehouses, setWarehouses] = useState(MOCK_WAREHOUSES);
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [useMockData, setUseMockData] = useState(true);
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
      if (useMockData) {
        setProducts(MOCK_INVENTORY);
        setWarehouses(MOCK_WAREHOUSES);
        setCategories(MOCK_CATEGORIES);
        calculateSummary(MOCK_INVENTORY);
        setIsLoading(false);
        return;
      }

      const productsResult = await api.getProducts();
      if (!productsResult.success) {
        showNotification("error", productsResult.error || "Failed to load products");
        setIsLoading(false);
        return;
      }

      const warehousesResult = await api.getActiveOnlyWarehouses();
      if (warehousesResult.success) {
        setWarehouses(warehousesResult.data || []);
      }

      const productsWithInventory = await Promise.all(
        (productsResult.data || []).map(async (product) => {
          const inventoryResult = await api.getInventoryByProduct(product.id);
          const batchesResult = await api.getBatchesByProduct(product.id);
          
          return {
            ...product,
            inventory: inventoryResult.success ? inventoryResult.data : [],
            batches: batchesResult.success ? batchesResult.data : [],
            total_quantity: inventoryResult.success 
              ? inventoryResult.data.reduce((sum, i) => sum + (i.quantity || 0), 0)
              : 0
          };
        })
      );

      setProducts(productsWithInventory);

      const uniqueCategories = ["All", ...new Set(productsWithInventory.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);

      const summaryResult = await api.getInventorySummary();
      if (summaryResult.success) {
        setSummary(summaryResult.data);
      }

      calculateSummary(productsWithInventory);

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

  // ==================== FILTERS & SORTING ====================
  const filterAndSortProducts = () => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.code?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedWarehouse !== "All") {
      filtered = filtered.filter(p => {
        return p.inventory?.some(i => i.warehouse_id === parseInt(selectedWarehouse) && i.quantity > 0);
      });
    }

    if (selectedStatus !== "All") {
      filtered = filtered.filter(p => {
        const status = getStockStatus(p);
        return status.label === selectedStatus;
      });
    }

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
          valA = a.total_quantity || 0;
          valB = b.total_quantity || 0;
          break;
        case "price":
          valA = a.sale_price || 0;
          valB = b.sale_price || 0;
          break;
        case "value":
          valA = (a.total_quantity || 0) * (a.sale_price || 0);
          valB = (b.total_quantity || 0) * (b.sale_price || 0);
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
    const total = product.total_quantity || 0;
    const reorderLevel = product.reorder_level || 0;

    if (total <= 0) return { label: "Out of Stock", color: "text-red-600 bg-red-50 border-red-200" };
    if (total <= reorderLevel) return { label: "Low Stock", color: "text-amber-600 bg-amber-50 border-amber-200" };
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

      if (useMockData) {
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
        return;
      }

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
      return [
        p.code || "",
        p.name || "",
        p.category || "",
        p.total_quantity || 0,
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
          
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 via-indigo-700 to-blue-600 bg-clip-text text-transparent">
              Inventory Management
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <BarChart3 size={10} />
              Track stock across all warehouses
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              setUseMockData(!useMockData);
              loadData();
            }}
            className={`text-[10px] px-2 py-1 rounded-lg border transition-all duration-300 ${
              useMockData 
                ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 text-amber-600' 
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            {useMockData ? '📦 Mock' : '🔌 Live'}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
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

      {/* ===== SUMMARY CARDS - Smaller & Colorful ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
        {/* Total Products - Blue */}
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

        {/* Total Quantity - Emerald */}
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

        {/* Total Value - Amber */}
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

        {/* Low Stock - Rose */}
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

        {/* Out of Stock - Red */}
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

      {/* ===== FILTERS - Compact ===== */}
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
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
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
                <span className="w-2.5 h-2.5 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
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
      {isLoading ? (
        <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm p-8 text-center">
          <div className="inline-flex items-center gap-2 text-slate-400 text-xs">
            <span className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
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
        // ===== TABLE VIEW - Compact =====
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
                  const rowColor = product.total_quantity <= 0 ? 'bg-red-50/30' : 
                                   product.total_quantity <= (product.reorder_level || 0) ? 'bg-amber-50/20' : 
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
                          <span className={`${product.total_quantity <= 0 ? 'text-red-600' : 'text-slate-700'}`}>
                            {product.total_quantity?.toFixed(1) || '0'}
                          </span>
                          <span className="text-[8px] text-slate-400 ml-0.5">{getUnitDisplay(product.unit, product.total_quantity)}</span>
                        </td>
                        <td className="px-2 py-1.5 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-0.5">
                            {product.inventory?.filter(i => i.quantity > 0).length > 0 ? (
                              product.inventory.filter(i => i.quantity > 0).map((inv) => (
                                <span key={inv.warehouse_id} className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-indigo-50 rounded-full text-[8px] text-indigo-600">
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
                                      <div key={inv.warehouse_id} className="bg-white rounded border border-indigo-100 p-1.5 shadow-sm">
                                        <p className="text-[9px] font-medium text-slate-700">{getWarehouseName(inv.warehouse_id)}</p>
                                        <p className="text-[8px] text-slate-500">Qty: <span className="font-semibold text-indigo-600">{inv.quantity} {getUnitDisplay(product.unit, inv.quantity)}</span></p>
                                        {inv.reserved > 0 && <p className="text-[7px] text-amber-600">Reserved: {inv.reserved}</p>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {product.batches && product.batches.length > 0 && (
                                <div>
                                  <h4 className="text-[9px] font-semibold text-indigo-600 mb-1 flex items-center gap-1">
                                    <Layers size={10} />
                                    Batches
                                  </h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                                    {product.batches.map((batch) => (
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
        // ===== CARD VIEW - Compact & Colorful =====
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {filteredProducts.map((product, index) => {
            const stockStatus = getStockStatus(product);
            const color = colorSchemes[index % colorSchemes.length];

            return (
              <div key={product.id} className={`group bg-white rounded-lg border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 p-3 hover:-translate-y-0.5 hover:border-${color.from.replace('from-', '')}/50`}>
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
                      <p className="text-[7px] text-slate-400 uppercase font-medium">Total Qty</p>
                      <p className="text-sm font-bold text-slate-800">
                        {product.total_quantity?.toFixed(1) || '0'}
                      </p>
                    </div>
                    <div className={`bg-gradient-to-br ${color.light} rounded-lg p-1.5`}>
                      <p className="text-[7px] text-slate-400 uppercase font-medium">Price</p>
                      <p className="text-sm font-bold text-emerald-600">₨{product.sale_price?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>

                  {product.inventory && product.inventory.filter(i => i.quantity > 0).length > 0 && (
                    <div className="mt-2 relative">
                      <p className="text-[7px] text-slate-400 uppercase font-medium mb-0.5">Warehouses</p>
                      <div className="flex flex-wrap gap-0.5">
                        {product.inventory.filter(i => i.quantity > 0).map((inv) => (
                          <span key={inv.warehouse_id} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r ${color.light} rounded-full text-[7px] ${color.icon}`}>
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