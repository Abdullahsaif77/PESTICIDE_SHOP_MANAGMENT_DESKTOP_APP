// src/pages/ProductReturn.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Search, Plus, X, Package, User, CreditCard, Calendar, FileText,
  Eye, CheckCircle, XCircle, Clock, RefreshCw, AlertCircle,
  DollarSign, Loader2, Trash2, ChevronDown, Tag, Box
} from "lucide-react";

const api = window.api || {};

// ============================================
// HELPER FUNCTIONS
// ============================================

const ensureArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.data && Array.isArray(data.data)) return data.data;
  if (data.items && Array.isArray(data.items)) return data.items;
  if (data.results && Array.isArray(data.results)) return data.results;
  if (data.customers && Array.isArray(data.customers)) return data.customers;
  if (data.products && Array.isArray(data.products)) return data.products;
  if (data.sales && Array.isArray(data.sales)) return data.sales;
  if (typeof data === 'object' && data.id) return [data];
  
  const arrayProp = Object.values(data).find(v => Array.isArray(v));
  if (arrayProp) return arrayProp;
  
  return [];
};

const getStatusConfig = (status) => {
  const configs = {
    completed: { color: "text-emerald-600 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500", label: "Completed" },
    pending: { color: "text-amber-600 bg-amber-50 border-amber-200", dot: "bg-amber-500", label: "Pending" },
    cancelled: { color: "text-red-600 bg-red-50 border-red-200", dot: "bg-red-500", label: "Cancelled" }
  };
  return configs[status] || configs.pending;
};

const getRefundMethodLabel = (method) => {
  const methods = {
    cash: "Cash",
    bank_transfer: "Bank Transfer",
    credit_note: "Credit Note",
    wallet: "Wallet"
  };
  return methods[method] || method;
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProductReturn() {
  // ==================== STATE ====================
  const [returns, setReturns] = useState([]);
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Form state
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    sale_id: '',
    items: [],
    refund_method: 'cash',
    reason: '',
    notes: '',
    auto_restock: true,
    warehouse_id: 1
  });
  
  // Product selection state
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);
  const [productUnitPrice, setProductUnitPrice] = useState(0);
  const [productReason, setProductReason] = useState('');
  const [productCondition, setProductCondition] = useState('good');
  
  // Filters
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    search: '',
    refund_status: ''
  });

  // Notification
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [successModal, setSuccessModal] = useState({ show: false, message: "", action: "" });

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (filters.start_date || filters.end_date || filters.refund_status) {
      fetchReturns();
    }
  }, [filters.start_date, filters.end_date, filters.refund_status]);

  useEffect(() => {
    filterReturns();
  }, [returns, filters.search]);

  // ==================== DATA FETCHING ====================
  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchReturns(),
        fetchSummary(),
        fetchCustomers(),
        fetchProducts()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification("error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchReturns = async () => {
    try {
      const result = await api.getAllReturns(filters);
      const data = ensureArray(result);
      setReturns(data);
    } catch (error) {
      console.error("Error fetching returns:", error);
      showNotification("error", "Failed to fetch returns");
      setReturns([]);
    }
  };

  const fetchSummary = async () => {
    try {
      const result = await api.getReturnSummary();
      if (result && !result.error) {
        setSummary(result);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const result = await api.getAllCustomers({});
      const data = ensureArray(result);
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const result = await api.getProducts();
      const data = ensureArray(result);
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  const fetchSalesByCustomer = useCallback(async (customerId) => {
    if (!customerId) {
      setSales([]);
      return;
    }
    
    try {
      const result = await api.getSalesByCustomer(customerId);
      const data = ensureArray(result);
      setSales(data);
    } catch (error) {
      console.error("Error fetching sales:", error);
      setSales([]);
    }
  }, []);

  // ==================== FILTERS ====================
  const filterReturns = () => {
    let filtered = [...returns];
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase().trim();
      filtered = filtered.filter(r =>
        r.return_number?.toLowerCase().includes(query) ||
        r.customer_name?.toLowerCase().includes(query) ||
        r.customer_phone?.includes(query)
      );
    }
    setFilteredReturns(filtered);
  };

  // ==================== NOTIFICATIONS ====================
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 3000);
  };

  const showSuccessModal = (action, message) => {
    setSuccessModal({ show: true, message, action });
    setTimeout(() => {
      setSuccessModal({ show: false, message: "", action: "" });
    }, 3000);
  };

  // ==================== FORM HANDLERS ====================
  const handleCustomerChange = async (e) => {
    const customerId = e.target.value;
    setFormData(prev => ({ ...prev, customer_id: customerId, sale_id: '' }));
    await fetchSalesByCustomer(customerId);
  };

  const handleAddItem = () => {
    if (!selectedProduct) {
      showNotification("error", "Please select a product");
      return;
    }
    if (!productQuantity || productQuantity < 1) {
      showNotification("error", "Please enter a valid quantity");
      return;
    }
    if (!productUnitPrice || productUnitPrice < 0) {
      showNotification("error", "Please enter a valid unit price");
      return;
    }

    const product = products.find(p => p.id === parseInt(selectedProduct));
    const existingItemIndex = formData.items.findIndex(
      item => item.product_id === parseInt(selectedProduct)
    );

    const newItem = {
      product_id: parseInt(selectedProduct),
      product_name: product?.name || '',
      quantity: parseInt(productQuantity),
      unit_price: parseFloat(productUnitPrice),
      total_price: parseInt(productQuantity) * parseFloat(productUnitPrice),
      reason: productReason,
      condition: productCondition
    };

    if (existingItemIndex !== -1) {
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
        total_price: (updatedItems[existingItemIndex].quantity + newItem.quantity) * newItem.unit_price
      };
      setFormData(prev => ({ ...prev, items: updatedItems }));
    } else {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }

    setSelectedProduct('');
    setProductQuantity(1);
    setProductUnitPrice(0);
    setProductReason('');
    setProductCondition('good');
    
    showNotification("success", "Product added to return");
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleCreateReturn = async () => {
    if (!formData.customer_id) {
      showNotification("error", "Please select a customer");
      return;
    }

    if (formData.items.length === 0) {
      showNotification("error", "Please add at least one product");
      return;
    }

    setLoading(true);
    try {
      const result = await api.createReturn({
        customer_id: parseInt(formData.customer_id),
        sale_id: formData.sale_id ? parseInt(formData.sale_id) : null,
        items: formData.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          reason: item.reason || '',
          condition: item.condition || 'good'
        })),
        refund_method: formData.refund_method,
        reason: formData.reason,
        notes: formData.notes,
        auto_restock: formData.auto_restock,
        warehouse_id: formData.warehouse_id || 1
      });

      if (result?.success) {
        showSuccessModal("created", "Return created successfully!");
        setShowCreateModal(false);
        resetForm();
        await fetchAllData();
      } else {
        showNotification("error", result?.message || "Failed to create return");
      }
    } catch (error) {
      console.error("Error creating return:", error);
      showNotification("error", error.message || "Failed to create return");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      sale_id: '',
      items: [],
      refund_method: 'cash',
      reason: '',
      notes: '',
      auto_restock: true,
      warehouse_id: 1
    });
    setSelectedProduct('');
    setProductQuantity(1);
    setProductUnitPrice(0);
    setProductReason('');
    setProductCondition('good');
    setSales([]);
  };

  // ==================== RETURN OPERATIONS ====================
  const handleProcessReturn = async (id) => {
    if (!window.confirm('Process this return and update inventory?')) return;
    
    setLoading(true);
    try {
      const result = await api.processReturn(id);
      if (result?.success) {
        showSuccessModal("processed", "Return processed successfully!");
        await fetchAllData();
        setShowDetailModal(false);
      } else {
        showNotification("error", result?.message || "Failed to process return");
      }
    } catch (error) {
      console.error("Error processing return:", error);
      showNotification("error", error.message || "Failed to process return");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReturn = async (id) => {
    if (!window.confirm('Cancel this return?')) return;
    
    setLoading(true);
    try {
      const result = await api.updateReturnStatus(id, 'cancelled');
      if (result?.success) {
        showSuccessModal("cancelled", "Return cancelled successfully!");
        await fetchAllData();
        setShowDetailModal(false);
      } else {
        showNotification("error", result?.message || "Failed to cancel return");
      }
    } catch (error) {
      console.error("Error cancelling return:", error);
      showNotification("error", error.message || "Failed to cancel return");
    } finally {
      setLoading(false);
    }
  };

  const handleViewReturn = async (id) => {
    setLoading(true);
    try {
      const result = await api.getReturnById(id);
      if (result && !result.error) {
        setSelectedReturn(result);
        setShowDetailModal(true);
      } else {
        showNotification("error", result?.message || "Failed to fetch return details");
      }
    } catch (error) {
      console.error("Error fetching return details:", error);
      showNotification("error", "Failed to fetch return details");
    } finally {
      setLoading(false);
    }
  };

  // ==================== CALCULATIONS ====================
  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  // ==================== SUCCESS MODAL ====================
  const SuccessModal = ({ show, message, action }) => {
    if (!show) return null;

    const gradients = {
      created: "from-emerald-400 to-emerald-600",
      processed: "from-blue-400 to-blue-600",
      cancelled: "from-red-400 to-red-600"
    };

    const bgGradients = {
      created: "from-emerald-50 to-emerald-100/50",
      processed: "from-blue-50 to-blue-100/50",
      cancelled: "from-red-50 to-red-100/50"
    };

    const icons = {
      created: <CheckCircle size={32} />,
      processed: <RefreshCw size={32} />,
      cancelled: <XCircle size={32} />
    };

    const colors = {
      created: "text-emerald-500",
      processed: "text-blue-500",
      cancelled: "text-red-500"
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}>
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center animate-scale-in relative overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[action] || gradients.created}`} />
          <button
            onClick={() => setSuccessModal({ show: false, message: "", action: "" })}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
          <div className={`mt-4 w-16 h-16 rounded-2xl bg-gradient-to-br ${bgGradients[action] || bgGradients.created} flex items-center justify-center mx-auto mb-3`}>
            <div className={colors[action] || colors.created}>
              {icons[action] || icons.created}
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Success!</h3>
          <p className="text-xs text-slate-500 mb-4">{message}</p>
          <button
            onClick={() => setSuccessModal({ show: false, message: "", action: "" })}
            className={`px-5 py-1.5 text-white text-xs font-medium rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r ${gradients[action] || gradients.created}`}
          >
            Got it
          </button>
        </div>
      </div>
    );
  };

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
      <SuccessModal
        show={successModal.show}
        message={successModal.message}
        action={successModal.action}
      />

      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-emerald-500 bg-clip-text text-transparent">
            Product Returns
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <RefreshCw size={12} />
            Manage customer product returns and refunds
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
        >
          <Plus size={14} />
          New Return
        </button>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <SummaryCard icon={RefreshCw} iconColor="blue" label="Total Returns" value={summary?.total_returns || 0} />
        <SummaryCard icon={DollarSign} iconColor="emerald" label="Total Amount" value={`₨${summary?.total_amount?.toFixed(2) || '0.00'}`} />
        <SummaryCard icon={Clock} iconColor="amber" label="Pending" value={summary?.pending || 0} />
        <SummaryCard icon={Calendar} iconColor="purple" label="Today's Returns" value={summary?.today_returns || 0} />
      </div>

      {/* ===== FILTERS ===== */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SearchInput
            placeholder="Search by number or customer..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
          <DateInput
            value={filters.start_date}
            onChange={(e) => setFilters({...filters, start_date: e.target.value})}
            placeholder="Start Date"
          />
          <DateInput
            value={filters.end_date}
            onChange={(e) => setFilters({...filters, end_date: e.target.value})}
            placeholder="End Date"
          />
          <StatusSelect
            value={filters.refund_status}
            onChange={(e) => setFilters({...filters, refund_status: e.target.value})}
          />
        </div>
      </div>

      {/* ===== RETURNS TABLE ===== */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingState />
        ) : filteredReturns.length === 0 ? (
          <EmptyState />
        ) : (
          <ReturnsTable
            returns={filteredReturns}
            onView={handleViewReturn}
            onProcess={handleProcessReturn}
            onCancel={handleCancelReturn}
          />
        )}
      </div>

      {/* ===== CREATE RETURN MODAL ===== */}
      {showCreateModal && (
        <CreateReturnModal
          customers={customers}
          products={products}
          sales={sales}
          formData={formData}
          setFormData={setFormData}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          productQuantity={productQuantity}
          setProductQuantity={setProductQuantity}
          productUnitPrice={productUnitPrice}
          setProductUnitPrice={setProductUnitPrice}
          productReason={productReason}
          setProductReason={setProductReason}
          productCondition={productCondition}
          setProductCondition={setProductCondition}
          onCustomerChange={handleCustomerChange}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onSubmit={handleCreateReturn}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          loading={loading}
          total={calculateTotal()}
        />
      )}

      {/* ===== DETAIL MODAL ===== */}
      {showDetailModal && selectedReturn && (
        <DetailModal
          returnData={selectedReturn}
          onClose={() => setShowDetailModal(false)}
          onProcess={handleProcessReturn}
          onCancel={handleCancelReturn}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
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

// ============================================
// SUB-COMPONENTS
// ============================================

const SummaryCard = ({ icon: Icon, iconColor, label, value }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-500",
    emerald: "bg-emerald-50 text-emerald-500",
    amber: "bg-amber-50 text-amber-500",
    purple: "bg-purple-50 text-purple-500"
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${colorMap[iconColor]}`}>
          <Icon size={16} />
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-medium">{label}</p>
          <p className="text-lg font-bold text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  );
};

const SearchInput = ({ placeholder, value, onChange }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-slate-50 focus:bg-white transition-all"
    />
  </div>
);

const DateInput = ({ value, onChange, placeholder }) => (
  <input
    type="date"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-slate-50 focus:bg-white transition-all"
  />
);

const StatusSelect = ({ value, onChange }) => (
  <select
    value={value}
    onChange={onChange}
    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-slate-50 focus:bg-white transition-all"
  >
    <option value="">All Status</option>
    <option value="pending">Pending</option>
    <option value="completed">Completed</option>
    <option value="cancelled">Cancelled</option>
  </select>
);

const LoadingState = () => (
  <div className="flex justify-center items-center py-12">
    <div className="inline-flex items-center gap-2 text-slate-400">
      <Loader2 size={20} className="animate-spin" />
      Loading returns...
    </div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12">
    <RefreshCw size={48} className="text-slate-300 mx-auto mb-3" />
    <p className="text-sm text-slate-500">No returns found</p>
    <p className="text-xs text-slate-400 mt-1">Create a new return to get started</p>
  </div>
);

const ReturnsTable = ({ returns, onView, onProcess, onCancel }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
        <tr>
          <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Return #</th>
          <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
          <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
          <th className="px-4 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
          <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Method</th>
          <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
          <th className="px-4 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {returns.map((returnItem) => {
          const statusConfig = getStatusConfig(returnItem.refund_status);
          return (
            <tr key={returnItem.id} className="hover:bg-slate-50/70 transition-colors">
              <td className="px-4 py-3">
                <span className="text-xs font-mono font-semibold text-slate-800">
                  {returnItem.return_number}
                </span>
              </td>
              <td className="px-4 py-3">
                <div>
                  <p className="text-xs font-medium text-slate-800">{returnItem.customer_name || 'Unknown'}</p>
                  <p className="text-[10px] text-slate-400">{returnItem.customer_phone}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-slate-500 hidden sm:table-cell">
                {formatDate(returnItem.created_at)}
              </td>
              <td className="px-4 py-3 text-right text-xs font-semibold text-slate-800">
                ₨{returnItem.total_return_amount?.toFixed(2) || '0.00'}
              </td>
              <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">
                {getRefundMethodLabel(returnItem.refund_method)}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${statusConfig.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                  {statusConfig.label}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => onView(returnItem.id)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                    title="View Details"
                  >
                    <Eye size={15} />
                  </button>
                  {returnItem.refund_status === 'pending' && (
                    <>
                      <button
                        onClick={() => onProcess(returnItem.id)}
                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                        title="Process Return"
                      >
                        <CheckCircle size={15} />
                      </button>
                      <button
                        onClick={() => onCancel(returnItem.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                        title="Cancel Return"
                      >
                        <XCircle size={15} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

// ============================================
// CREATE RETURN MODAL - REDESIGNED
// ============================================

const CreateReturnModal = ({
  customers,
  products,
  sales,
  formData,
  setFormData,
  selectedProduct,
  setSelectedProduct,
  productQuantity,
  setProductQuantity,
  productUnitPrice,
  setProductUnitPrice,
  productReason,
  setProductReason,
  productCondition,
  setProductCondition,
  onCustomerChange,
  onAddItem,
  onRemoveItem,
  onSubmit,
  onClose,
  loading,
  total
}) => {
  const customersList = Array.isArray(customers) ? customers : [];
  const productsList = Array.isArray(products) ? products : [];
  const salesList = Array.isArray(sales) ? sales : [];
  const itemsList = Array.isArray(formData.items) ? formData.items : [];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" 
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in relative">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-500">
              <RefreshCw size={18} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Create Return</h3>
              <p className="text-xs text-slate-400">Process customer return & refund</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Customer & Sale */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Customer *</label>
              <select
                value={formData.customer_id}
                onChange={onCustomerChange}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-slate-50 focus:bg-white transition-all"
              >
                <option value="">Select Customer</option>
                {customersList.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Sale Invoice</label>
              <select
                value={formData.sale_id}
                onChange={(e) => setFormData({...formData, sale_id: e.target.value})}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-slate-50 focus:bg-white transition-all"
              >
                <option value="">No Reference</option>
                {salesList.map((sale) => (
                  <option key={sale.id} value={sale.id}>
                    {sale.invoice_number} - ₨{sale.total_amount?.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Products */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Add Products</label>
            <div className="grid grid-cols-5 gap-2">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="col-span-2 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-slate-50 focus:bg-white transition-all"
              >
                <option value="">Select Product</option>
                {productsList.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Qty"
                value={productQuantity}
                onChange={(e) => setProductQuantity(e.target.value)}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-slate-50 focus:bg-white transition-all"
                min="1"
              />
              <input
                type="number"
                placeholder="Price"
                value={productUnitPrice}
                onChange={(e) => setProductUnitPrice(e.target.value)}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-slate-50 focus:bg-white transition-all"
                min="0"
                step="0.01"
              />
              <button
                onClick={onAddItem}
                className="px-3 py-1.5 text-xs font-medium text-white rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all"
              >
                Add
              </button>
            </div>
          </div>

          {/* Items List */}
          {itemsList.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {itemsList.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-800">{item.product_name}</p>
                      <p className="text-[10px] text-slate-500">
                        Qty: {item.quantity} × ₨{item.unit_price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(index)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="text-right mt-2 pt-2 border-t border-slate-200">
                <p className="text-sm font-bold text-slate-800">Total: ₨{total.toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Return Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Refund Method</label>
              <select
                value={formData.refund_method}
                onChange={(e) => setFormData({...formData, refund_method: e.target.value})}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-slate-50 focus:bg-white transition-all"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit_note">Credit Note</option>
                <option value="wallet">Wallet</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Auto Restock</label>
              <div className="flex items-center gap-4 mt-1">
                <label className="flex items-center gap-1.5 text-xs text-slate-700">
                  <input
                    type="radio"
                    checked={formData.auto_restock === true}
                    onChange={() => setFormData({...formData, auto_restock: true})}
                    className="text-emerald-500 focus:ring-emerald-400"
                  />
                  Yes
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700">
                  <input
                    type="radio"
                    checked={formData.auto_restock === false}
                    onChange={() => setFormData({...formData, auto_restock: false})}
                    className="text-emerald-500 focus:ring-emerald-400"
                  />
                  No
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Reason</label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              placeholder="Reason for return"
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-slate-50 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes"
              rows="2"
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-slate-50 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={loading}
              className="px-4 py-1.5 text-xs font-medium text-white rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            >
              {loading ? 'Creating...' : 'Create Return'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// DETAIL MODAL
// ============================================

const DetailModal = ({ returnData, onClose, onProcess, onCancel }) => {
  const statusConfig = getStatusConfig(returnData.refund_status);
  const itemsList = Array.isArray(returnData.items) ? returnData.items : [];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" 
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in relative">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-500">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Return Details</h3>
              <p className="text-xs text-slate-400">{returnData.return_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <InfoItem label="Return Number" value={returnData.return_number} />
            <InfoItem label="Date" value={formatDate(returnData.created_at)} />
            <InfoItem label="Status" value={
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${statusConfig.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                {statusConfig.label}
              </span>
            } />
            <InfoItem label="Customer" value={returnData.customer_name || 'Unknown'} />
            <InfoItem label="Refund Method" value={getRefundMethodLabel(returnData.refund_method)} />
            <InfoItem label="Total Amount" value={
              <span className="text-lg font-bold text-emerald-600">₨{returnData.total_return_amount?.toFixed(2) || '0.00'}</span>
            } />
          </div>

          {returnData.sale_invoice && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-[10px] text-slate-400 font-medium">Original Sale</p>
              <p className="text-sm text-slate-700">{returnData.sale_invoice}</p>
            </div>
          )}

          {/* Items */}
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Returned Items</p>
            <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-100/50">
                  <tr>
                    <th className="px-3 py-1.5 text-left text-[10px] font-semibold text-slate-500">Product</th>
                    <th className="px-3 py-1.5 text-right text-[10px] font-semibold text-slate-500">Qty</th>
                    <th className="px-3 py-1.5 text-right text-[10px] font-semibold text-slate-500">Price</th>
                    <th className="px-3 py-1.5 text-right text-[10px] font-semibold text-slate-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {itemsList.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 py-1.5 text-xs text-slate-700">{item.product_name}</td>
                      <td className="px-3 py-1.5 text-xs text-right text-slate-700">{item.quantity}</td>
                      <td className="px-3 py-1.5 text-xs text-right text-slate-700">₨{item.unit_price?.toFixed(2)}</td>
                      <td className="px-3 py-1.5 text-xs text-right font-medium text-slate-800">₨{item.total_price?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {returnData.reason && (
            <InfoItem label="Reason" value={returnData.reason} />
          )}

          {returnData.notes && (
            <InfoItem label="Notes" value={returnData.notes} />
          )}

          {/* Actions */}
          {returnData.refund_status === 'pending' && (
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => onCancel(returnData.id)}
                className="px-4 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Cancel Return
              </button>
              <button
                onClick={() => onProcess(returnData.id)}
                className="px-4 py-1.5 text-xs font-medium text-white rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
              >
                Process Return
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] text-slate-400 font-medium">{label}</p>
    <p className="text-sm text-slate-700">{value}</p>
  </div>
);