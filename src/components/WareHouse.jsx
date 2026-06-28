// src/pages/Warehouses/Warehouses.jsx

import React, { useState, useEffect } from "react";
import { 
  Search, Plus, Edit3, Trash2, X, Package, 
  MapPin, Home, AlertCircle, CheckCircle, Eye,
  Building2, TrendingUp, TrendingDown, ArrowRightLeft,
  ChevronDown, ChevronRight, Filter, Calendar,
  Layers, Box, Warehouse as WarehouseIcon, 
  BarChart3, CircleDot, Truck, Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ==================== MOCK DATA ====================
const MOCK_WAREHOUSES = [
  { id: 1, name: "Main Warehouse", location: "Ground Floor, Building A", status: "active", created_at: "2024-01-15" },
  { id: 2, name: "Branch Warehouse", location: "First Floor, Building B", status: "active", created_at: "2024-02-20" },
  { id: 3, name: "Storage Facility", location: "Industrial Area", status: "active", created_at: "2024-03-10" },
  { id: 4, name: "Distribution Center", location: "Highway Road", status: "maintenance", created_at: "2024-04-05" },
];

const MOCK_INVENTORY = {
  1: [
    { 
      product_id: 1, 
      name: "Pesticide X", 
      code: "PST-001", 
      category: "Insecticides", 
      quantity: 150, 
      reserved_quantity: 10,
      unit: "L",
      sale_price: 450,
      reorder_level: 20,
      batches: [
        { id: 1, batch_number: "BATCH-001", quantity: 100, expiry_date: "2025-12-31" },
        { id: 2, batch_number: "BATCH-002", quantity: 50, expiry_date: "2026-06-15" }
      ]
    },
    { 
      product_id: 2, 
      name: "Herbicide Y", 
      code: "HRB-002", 
      category: "Herbicides", 
      quantity: 75, 
      reserved_quantity: 5,
      unit: "kg",
      sale_price: 320,
      reorder_level: 15,
      batches: [
        { id: 3, batch_number: "BATCH-003", quantity: 75, expiry_date: "2025-09-20" }
      ]
    },
    { 
      product_id: 3, 
      name: "Fungicide Z", 
      code: "FNG-003", 
      category: "Fungicides", 
      quantity: 5, 
      reserved_quantity: 0,
      unit: "L",
      sale_price: 280,
      reorder_level: 25,
      batches: [
        { id: 4, batch_number: "BATCH-004", quantity: 5, expiry_date: "2025-07-10" }
      ]
    },
    { 
      product_id: 4, 
      name: "Rodenticide R", 
      code: "RDT-004", 
      category: "Rodenticides", 
      quantity: 0, 
      reserved_quantity: 0,
      unit: "kg",
      sale_price: 550,
      reorder_level: 10,
      batches: []
    },
    { 
      product_id: 5, 
      name: "Fertilizer F", 
      code: "FRT-005", 
      category: "Fertilizers", 
      quantity: 200, 
      reserved_quantity: 0,
      unit: "kg",
      sale_price: 180,
      reorder_level: 50,
      batches: [
        { id: 5, batch_number: "BATCH-005", quantity: 200, expiry_date: "2026-03-01" }
      ]
    },
  ],
  2: [
    { 
      product_id: 1, 
      name: "Pesticide X", 
      code: "PST-001", 
      category: "Insecticides", 
      quantity: 60, 
      reserved_quantity: 0,
      unit: "L",
      sale_price: 450,
      reorder_level: 20,
      batches: [
        { id: 6, batch_number: "BATCH-006", quantity: 60, expiry_date: "2026-02-28" }
      ]
    },
    { 
      product_id: 3, 
      name: "Fungicide Z", 
      code: "FNG-003", 
      category: "Fungicides", 
      quantity: 30, 
      reserved_quantity: 0,
      unit: "L",
      sale_price: 280,
      reorder_level: 25,
      batches: [
        { id: 7, batch_number: "BATCH-007", quantity: 30, expiry_date: "2025-08-15" }
      ]
    },
    { 
      product_id: 4, 
      name: "Rodenticide R", 
      code: "RDT-004", 
      category: "Rodenticides", 
      quantity: 10, 
      reserved_quantity: 0,
      unit: "kg",
      sale_price: 550,
      reorder_level: 10,
      batches: [
        { id: 8, batch_number: "BATCH-008", quantity: 10, expiry_date: "2025-11-30" }
      ]
    },
  ],
  3: [
    { 
      product_id: 2, 
      name: "Herbicide Y", 
      code: "HRB-002", 
      category: "Herbicides", 
      quantity: 120, 
      reserved_quantity: 0,
      unit: "kg",
      sale_price: 320,
      reorder_level: 15,
      batches: [
        { id: 9, batch_number: "BATCH-009", quantity: 120, expiry_date: "2025-10-10" }
      ]
    },
    { 
      product_id: 5, 
      name: "Fertilizer F", 
      code: "FRT-005", 
      category: "Fertilizers", 
      quantity: 300, 
      reserved_quantity: 0,
      unit: "kg",
      sale_price: 180,
      reorder_level: 50,
      batches: [
        { id: 10, batch_number: "BATCH-010", quantity: 300, expiry_date: "2026-01-15" }
      ]
    },
  ],
  4: [],
};

const api = window.api || {
  createWarehouse: async (data) => ({ success: false, error: 'API not available' }),
  getActiveOnlyWarehouses: async () => ({ success: true, data: [] }),
  getWarehouseById: async (id) => ({ success: false, error: 'API not available' }),
  updateWarehouse: async (id, data) => ({ success: false, error: 'API not available' }),
  deleteWarehouse: async (id) => ({ success: false, error: 'API not available' }),
  getDetailedWarehouseInventory: async (id) => ({ success: true, data: [] }),
  createTransfer: async (data) => ({ success: false, error: 'API not available' }),
};

export default function Warehouses() {
  const navigate = useNavigate();
  
  // ==================== STATE ====================
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useMockData, setUseMockData] = useState(true); // Toggle for mock data
  
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [stockSearch, setStockSearch] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [viewMode, setViewMode] = useState("grid");
  
  const [modal, setModal] = useState({ open: false, mode: "add", data: null });
  const [form, setForm] = useState({ name: "", location: "", status: "active" });
  const [validationErrors, setValidationErrors] = useState({});
  
  const [transferModal, setTransferModal] = useState({
    open: false,
    product: null
  });
  const [transferForm, setTransferForm] = useState({
    toWarehouseId: "",
    quantity: "",
    notes: ""
  });
  
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: ""
  });
  
  const [successModal, setSuccessModal] = useState({
    show: false,
    message: "",
    action: ""
  });

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    filterWarehouses();
  }, [warehouses, searchQuery]);

  useEffect(() => {
    if (selectedWarehouse) {
      loadWarehouseInventory(selectedWarehouse.id);
    }
  }, [selectedWarehouse]);

  useEffect(() => {
    filterInventory();
  }, [inventory, stockSearch]);

  // ==================== DATA LOADING ====================
  const loadWarehouses = async () => {
    setIsLoading(true);
    try {
      if (useMockData) {
        // Use mock data
        setWarehouses(MOCK_WAREHOUSES);
        if (MOCK_WAREHOUSES.length > 0) {
          setSelectedWarehouse(MOCK_WAREHOUSES[0]);
        }
        setIsLoading(false);
        return;
      }

      const result = await api.getActiveOnlyWarehouses();
      if (result.success) {
        setWarehouses(result.data || []);
        if (result.data && result.data.length > 0) {
          setSelectedWarehouse(result.data[0]);
        }
      }
    } catch (err) {
      console.error("Error loading warehouses:", err);
      showNotification("error", "Failed to load warehouses");
    } finally {
      setIsLoading(false);
    }
  };

  const loadWarehouseInventory = async (warehouseId) => {
    setIsLoading(true);
    try {
      if (useMockData) {
        // Use mock inventory
        const mockInventory = MOCK_INVENTORY[warehouseId] || [];
        setInventory(mockInventory);
        setIsLoading(false);
        return;
      }

      const result = await api.getDetailedWarehouseInventory(warehouseId);
      if (result.success) {
        setInventory(result.data || []);
      } else {
        showNotification("error", result.error || "Failed to load inventory");
      }
    } catch (err) {
      console.error("Error loading inventory:", err);
      showNotification("error", "Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== FILTERS ====================
  const filterWarehouses = () => {
    let filtered = [...warehouses];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(w =>
        w.name?.toLowerCase().includes(query) ||
        w.location?.toLowerCase().includes(query)
      );
    }
    setFilteredWarehouses(filtered);
  };

  const filterInventory = () => {
    let filtered = [...inventory];
    if (stockSearch.trim()) {
      const query = stockSearch.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(query) ||
        item.code?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      );
    }
    setFilteredInventory(filtered);
  };

  // ==================== NOTIFICATIONS ====================
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 3000);
  };

  const showSuccessModal = (action, name) => {
    const messages = {
      added: `Warehouse "${name}" added successfully!`,
      updated: `Warehouse "${name}" updated successfully!`,
      deleted: `Warehouse "${name}" deactivated successfully!`
    };
    setSuccessModal({
      show: true,
      message: messages[action] || `${action} successfully!`,
      action
    });
    setTimeout(() => {
      setSuccessModal({ show: false, message: "", action: "" });
    }, 3000);
  };

  // ==================== WAREHOUSE CRUD ====================
  const validateForm = () => {
    const errors = {};
    if (!form.name || form.name.trim() === "") {
      errors.name = "Warehouse name is required";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: "" });
    }
  };

  const openAddModal = () => {
    setForm({ name: "", location: "", status: "active" });
    setValidationErrors({});
    setModal({ open: true, mode: "add", data: null });
  };

  const openEditModal = (warehouse) => {
    setForm({
      name: warehouse.name || "",
      location: warehouse.location || "",
      status: warehouse.status || "active"
    });
    setValidationErrors({});
    setModal({ open: true, mode: "edit", data: warehouse });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (modal.mode === "add") {
        // Add to mock data
        const newWarehouse = {
          id: Date.now(),
          name: form.name,
          location: form.location || "",
          status: form.status,
          created_at: new Date().toISOString()
        };
        setWarehouses(prev => [...prev, newWarehouse]);
        setSelectedWarehouse(newWarehouse);
        showSuccessModal("added", form.name);
        setModal({ open: false, mode: "add", data: null });
        setSearchQuery("");
      } else {
        // Update mock data
        setWarehouses(prev => prev.map(w => 
          w.id === modal.data.id ? { ...w, name: form.name, location: form.location, status: form.status } : w
        ));
        setSelectedWarehouse(prev => prev && prev.id === modal.data.id ? { ...prev, name: form.name, location: form.location, status: form.status } : prev);
        showSuccessModal("updated", form.name);
        setModal({ open: false, mode: "add", data: null });
      }
    } catch (err) {
      console.error("Failed saving warehouse:", err);
      showNotification("error", err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Deactivate warehouse "${name}"?`)) {
      setIsLoading(true);
      try {
        setWarehouses(prev => prev.filter(w => w.id !== id));
        if (selectedWarehouse?.id === id) {
          setSelectedWarehouse(warehouses[0] || null);
        }
        showSuccessModal("deleted", name);
      } catch (err) {
        console.error("Failed deleting warehouse:", err);
        showNotification("error", err.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // ==================== STOCK TRANSFER ====================
  const openTransferModal = (product) => {
    setTransferForm({
      toWarehouseId: "",
      quantity: "",
      notes: ""
    });
    setTransferModal({
      open: true,
      product: product
    });
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferForm.toWarehouseId || !transferForm.quantity) {
      showNotification("error", "Please fill all required fields");
      return;
    }

    const quantity = parseFloat(transferForm.quantity);
    if (quantity > transferModal.product.quantity) {
      showNotification("error", "Insufficient stock in this warehouse");
      return;
    }

    if (quantity <= 0) {
      showNotification("error", "Quantity must be greater than 0");
      return;
    }

    if (parseInt(transferForm.toWarehouseId) === selectedWarehouse.id) {
      showNotification("error", "Cannot transfer to the same warehouse");
      return;
    }

    setIsLoading(true);
    try {
      // Update mock inventory
      const fromWarehouseId = selectedWarehouse.id;
      const toWarehouseId = parseInt(transferForm.toWarehouseId);
      const productId = transferModal.product.product_id || transferModal.product.id;
      const quantityNum = parseFloat(transferForm.quantity);

      // Remove from source
      setInventory(prev => prev.map(item => {
        if ((item.product_id || item.id) === productId) {
          return { ...item, quantity: item.quantity - quantityNum };
        }
        return item;
      }));

      // Add to destination (mock)
      const destInventory = MOCK_INVENTORY[toWarehouseId] || [];
      const existingProduct = destInventory.find(item => (item.product_id || item.id) === productId);
      
      if (existingProduct) {
        // Update existing product in destination
        MOCK_INVENTORY[toWarehouseId] = destInventory.map(item => {
          if ((item.product_id || item.id) === productId) {
            return { ...item, quantity: item.quantity + quantityNum };
          }
          return item;
        });
      } else {
        // Add new product to destination
        const productToAdd = { ...transferModal.product, quantity: quantityNum };
        MOCK_INVENTORY[toWarehouseId] = [...destInventory, productToAdd];
      }

      showNotification("success", `Transferred ${quantityNum} units successfully!`);
      setTransferModal({ open: false, product: null });
      await loadWarehouseInventory(selectedWarehouse.id);
    } catch (err) {
      console.error("Transfer error:", err);
      showNotification("error", err.message || "Failed to create transfer");
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== HELPERS ====================
  const toggleRowExpand = (productId) => {
    setExpandedRows(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-emerald-50 text-emerald-600 border-emerald-200",
      inactive: "bg-slate-50 text-slate-500 border-slate-200",
      maintenance: "bg-amber-50 text-amber-600 border-amber-200"
    };
    return styles[status] || styles.inactive;
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: <CheckCircle size={12} />,
      inactive: <X size={12} />,
      maintenance: <AlertCircle size={12} />
    };
    return icons[status] || null;
  };

  const getStockStatus = (quantity, reorderLevel) => {
    if (quantity <= 0) return { label: "Out of Stock", color: "text-red-600 bg-red-50 border-red-200", icon: "🔴" };
    if (quantity <= reorderLevel) return { label: "Low Stock", color: "text-amber-600 bg-amber-50 border-amber-200", icon: "🟡" };
    return { label: "In Stock", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: "🟢" };
  };

  // ==================== CALCULATIONS ====================
  const totalProducts = filteredInventory.length;
  const totalQuantity = filteredInventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalValue = filteredInventory.reduce((sum, item) => sum + ((item.quantity || 0) * (item.sale_price || 0)), 0);
  const lowStockCount = filteredInventory.filter(item => 
    item.quantity > 0 && item.quantity <= (item.reorder_level || 0)
  ).length;
  const outOfStockCount = filteredInventory.filter(item => item.quantity <= 0).length;

  const warehouseColors = [
    "from-emerald-500 to-emerald-600",
    "from-blue-500 to-blue-600",
    "from-purple-500 to-purple-600",
    "from-rose-500 to-rose-600",
    "from-amber-500 to-amber-600",
    "from-cyan-500 to-cyan-600",
    "from-indigo-500 to-indigo-600",
    "from-teal-500 to-teal-600"
  ];

  // ==================== RENDER ====================
  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100/50 min-h-screen">

      {/* ===== NOTIFICATION ===== */}
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
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ===== SUCCESS MODAL ===== */}
      {successModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center animate-scale-in relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
              successModal.action === "added" ? "from-emerald-400 to-emerald-600" :
              successModal.action === "updated" ? "from-blue-400 to-blue-600" :
              "from-red-400 to-red-600"
            }`} />
            <button
              onClick={() => setSuccessModal({ show: false, message: "", action: "" })}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
            <div className="mt-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center mx-auto mb-3">
              <div className="text-emerald-500">
                <Home size={32} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Success!</h3>
            <p className="text-xs text-slate-500 mb-4">{successModal.message}</p>
            <button
              onClick={() => setSuccessModal({ show: false, message: "", action: "" })}
              className="px-5 py-1.5 text-white text-xs font-medium rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-emerald-500 bg-clip-text text-transparent">
            Warehouse Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <WarehouseIcon size={12} />
            Manage warehouses, track inventory, and transfer stock
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseMockData(!useMockData)}
            className={`text-xs px-2 py-1 rounded-lg border ${
              useMockData ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
          >
            <Plus size={14} />
            Add Warehouse
          </button>
        </div>
      </div>

      {/* ===== WAREHOUSE CARDS (Top Row) ===== */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-emerald-500" />
            <h2 className="text-sm font-semibold text-slate-700">Warehouses</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {filteredWarehouses.length}
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search warehouses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white transition-all"
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
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {isLoading && !warehouses.length ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-3 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
            ))
          ) : filteredWarehouses.length === 0 ? (
            <div className="col-span-full py-6 text-center">
              <p className="text-xs text-slate-400">No warehouses found</p>
            </div>
          ) : (
            filteredWarehouses.map((warehouse, index) => {
              const colorIndex = index % warehouseColors.length;
              const isActive = selectedWarehouse?.id === warehouse.id;
              
              return (
                <div
                  key={warehouse.id}
                  onClick={() => setSelectedWarehouse(warehouse)}
                  className={`group relative bg-white rounded-xl border-2 shadow-sm p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                    isActive 
                      ? 'border-emerald-500 shadow-emerald-100/50' 
                      : 'border-slate-200/60 hover:border-emerald-300'
                  }`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r ${warehouseColors[colorIndex]} ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  } transition-opacity`} />
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-800 truncate">
                        {warehouse.name}
                      </h3>
                      {warehouse.location && (
                        <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500">
                          <MapPin size={10} />
                          <span className="truncate">{warehouse.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(warehouse);
                        }}
                        className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit3 size={12} />
                      </button>
                      {warehouse.status === 'active' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(warehouse.id, warehouse.name);
                          }}
                          className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-medium rounded-full border ${getStatusBadge(warehouse.status)}`}>
                      {getStatusIcon(warehouse.status)}
                      <span className="capitalize">{warehouse.status}</span>
                    </span>
                    {isActive && (
                      <span className="text-[8px] text-emerald-500 font-medium">Active</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ===== WAREHOUSE DETAILS ===== */}
      {selectedWarehouse ? (
        <>
          {/* Warehouse Header with Stats */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                    <WarehouseIcon size={16} />
                  </div>
                  {selectedWarehouse.name}
                </h2>
                {selectedWarehouse.location && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={12} />
                    {selectedWarehouse.location}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-full border ${getStatusBadge(selectedWarehouse.status)}`}>
                  {getStatusIcon(selectedWarehouse.status)}
                  <span className="capitalize">{selectedWarehouse.status}</span>
                </span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-500">
                  <Package size={14} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Products</p>
                  <p className="text-sm font-bold text-slate-800">{totalProducts}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-500">
                  <Box size={14} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Total Qty</p>
                  <p className="text-sm font-bold text-slate-800">{totalQuantity.toFixed(1)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-500">
                  <TrendingUp size={14} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Total Value</p>
                  <p className="text-sm font-bold text-slate-800">₨{totalValue.toFixed(0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-50 text-red-500">
                  <AlertCircle size={14} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Low/Out</p>
                  <p className="text-sm font-bold text-red-600">{lowStockCount + outOfStockCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search products in warehouse..."
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white transition-all"
              />
              {stockSearch && (
                <button
                  onClick={() => setStockSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{filteredInventory.length} items</span>
              <span className="w-px h-3 bg-slate-200" />
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> 
                {filteredInventory.filter(i => i.quantity > (i.reorder_level || 0)).length} in stock
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" /> {lowStockCount} low
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" /> {outOfStockCount} out
              </span>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2 text-slate-400">
                  <span className="w-3 h-3 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
                  Loading inventory...
                </div>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="p-12 text-center">
                <Package size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">
                  {stockSearch ? 'No products found matching your search' : 'No products in this warehouse'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-8"></th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                      <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
                      <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Price</th>
                      <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInventory.map((item) => {
                      const stockStatus = getStockStatus(item.quantity, item.reorder_level);
                      const hasBatches = item.batches && item.batches.length > 0;
                      const isExpanded = expandedRows[item.product_id || item.id];

                      return (
                        <React.Fragment key={item.product_id || item.id}>
                          <tr className={`hover:bg-slate-50/70 transition-colors ${
                            item.quantity <= 0 ? 'bg-red-50/30' : 
                            item.quantity <= (item.reorder_level || 0) ? 'bg-amber-50/30' : ''
                          }`}>
                            <td className="px-3 py-2">
                              {hasBatches && (
                                <button
                                  onClick={() => toggleRowExpand(item.product_id || item.id)}
                                  className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <div>
                                <span className="text-xs font-medium text-slate-800">{item.name}</span>
                                {item.code && (
                                  <span className="text-[9px] text-slate-400 block">#{item.code}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 hidden sm:table-cell">
                              <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                {item.category || 'Uncategorized'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right font-medium text-xs">
                              <span className={`${item.quantity <= 0 ? 'text-red-600' : 'text-slate-700'}`}>
                                {item.quantity.toFixed(1)}
                              </span>
                              <span className="text-[9px] text-slate-400 ml-0.5">{item.unit || ''}</span>
                            </td>
                            <td className="px-3 py-2 text-right text-xs text-slate-600 hidden md:table-cell">
                              ₨{item.sale_price?.toFixed(2) || '0.00'}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-medium rounded-full border ${stockStatus.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  stockStatus.label === "In Stock" ? "bg-emerald-500" :
                                  stockStatus.label === "Low Stock" ? "bg-amber-500" : "bg-red-500"
                                }`} />
                                {stockStatus.label}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              {/* Transfer Button - Always visible with tooltip */}
                              <button
                                onClick={() => openTransferModal(item)}
                                disabled={item.quantity <= 0}
                                className={`p-1.5 rounded-lg transition-all group relative ${
                                  item.quantity > 0 
                                    ? 'hover:bg-blue-50 text-slate-400 hover:text-blue-600 hover:shadow-md' 
                                    : 'text-slate-300 cursor-not-allowed opacity-50'
                                }`}
                                title={item.quantity > 0 ? "Transfer Stock" : "No stock to transfer"}
                              >
                                <Truck size={15} className="group-hover:scale-110 transition-transform" />
                                {item.quantity > 0 && (
                                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                )}
                              </button>
                            </td>
                          </tr>
                          {isExpanded && hasBatches && (
                            <tr>
                              <td colSpan="7" className="px-3 py-3 bg-slate-50/80">
                                <div className="ml-4">
                                  <h4 className="text-[10px] font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                                    <Layers size={12} />
                                    Batches
                                  </h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                    {item.batches.map((batch) => (
                                      <div key={batch.id} className="bg-white rounded-lg border border-slate-200 p-2 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <p className="text-[10px] font-semibold text-slate-700">{batch.batch_number}</p>
                                            <p className="text-[9px] text-slate-500">Qty: {batch.quantity}</p>
                                          </div>
                                          {batch.expiry_date && (
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${
                                              new Date(batch.expiry_date) < new Date() 
                                                ? "bg-red-100 text-red-600" 
                                                : new Date(batch.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                                ? "bg-amber-100 text-amber-600"
                                                : "bg-emerald-100 text-emerald-600"
                                            }`}>
                                              <Calendar size={8} className="inline mr-0.5" />
                                              {new Date(batch.expiry_date).toLocaleDateString()}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
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
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-16 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-slate-50">
              <Building2 size={48} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-600">No Warehouse Selected</p>
            <p className="text-xs text-slate-400">Select a warehouse from the cards above to view its inventory</p>
          </div>
        </div>
      )}

      {/* ===== WAREHOUSE CRUD MODAL ===== */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-5 animate-scale-in relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-t-xl" />
            <button
              onClick={() => setModal({ open: false, mode: "add", data: null })}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-semibold text-slate-800 mt-2 mb-4">
              {modal.mode === "add" ? "Add Warehouse" : "Edit Warehouse"}
            </h3>

            {Object.keys(validationErrors).length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-[10px] font-medium text-red-700 mb-1">Please fix the following errors:</p>
                <ul className="text-[9px] text-red-600 space-y-0.5">
                  {Object.values(validationErrors).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Warehouse Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-50 focus:bg-white ${
                    validationErrors.name
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
                  }`}
                  placeholder="Enter warehouse name"
                />
                {validationErrors.name && (
                  <p className="text-[10px] text-red-500 mt-0.5">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-slate-50 focus:bg-white"
                  placeholder="Enter location address"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-slate-50 focus:bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModal({ open: false, mode: "add", data: null })}
                  className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 text-xs font-medium text-white rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  {isLoading ? 'Saving...' : modal.mode === "add" ? 'Add Warehouse' : 'Update Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== TRANSFER MODAL ===== */}
      {transferModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-5 animate-scale-in relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-t-xl" />
            <button
              onClick={() => setTransferModal({ open: false, product: null })}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mt-2 mb-4">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-500">
                <Truck size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Transfer Stock</h3>
                <p className="text-xs text-slate-500">
                  {transferModal.product?.name} from {selectedWarehouse?.name}
                </p>
                <p className="text-xs text-emerald-600 font-medium">
                  Available: {transferModal.product?.quantity} {transferModal.product?.unit}
                </p>
              </div>
            </div>

            <form onSubmit={handleTransfer} className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Destination Warehouse *
                </label>
                <select
                  value={transferForm.toWarehouseId}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, toWarehouseId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50 focus:bg-white"
                  required
                >
                  <option value="">Select warehouse...</option>
                  {warehouses
                    .filter(w => w.id !== selectedWarehouse?.id && w.status === 'active')
                    .map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} {warehouse.location ? `- ${warehouse.location}` : ''}
                      </option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Quantity *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={transferForm.quantity}
                    onChange={(e) => setTransferForm(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50 focus:bg-white"
                    placeholder="Enter quantity"
                    min="0.01"
                    step="0.01"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    Max: {transferModal.product?.quantity || 0}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50 focus:bg-white resize-none"
                  placeholder="Add transfer notes..."
                  rows="2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferModal({ open: false, product: null })}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-medium text-white rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  {isLoading ? 'Processing...' : 'Create Transfer'}
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
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-slide-down {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}