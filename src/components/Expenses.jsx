// src/pages/Expenses.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Plus, Filter, Calendar, X, 
  Trash2, Edit2, Download, RefreshCw, 
  Wallet, CheckCircle, AlertCircle, Loader2,
  TrendingUp, TrendingDown, BarChart3, Receipt,
  Tag, Folder, List
} from 'lucide-react';

const api = window.api || {};

export default function Expenses() {
  // ==================== STATE ====================
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash'
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Category Management State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catFormData, setCatFormData] = useState({ name: '', description: '' });
  const [catValidationErrors, setCatValidationErrors] = useState({});

  // Statistics
  const [stats, setStats] = useState({
    totalExpenses: 0,
    thisMonth: 0,
    thisWeek: 0,
    count: 0
  });

  // Notifications
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

  // Refs
  const categoryInputRef = useRef(null);
  const catNameInputRef = useRef(null);

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadData();
    loadCategories();
    loadStats();
  }, []);

  useEffect(() => {
    if (showForm && categoryInputRef.current) {
      setTimeout(() => categoryInputRef.current.focus(), 100);
    }
  }, [showForm]);

  useEffect(() => {
    if (showCategoryModal && catNameInputRef.current) {
      setTimeout(() => catNameInputRef.current.focus(), 100);
    }
  }, [showCategoryModal]);

  // ==================== DATA LOADING ====================
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getExpenses(500, 0);
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
      showNotification("error", "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.getExpenseCategories(false);
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadStats = async () => {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());

      const total = await api.getTotalExpenses('2000-01-01', '2099-12-31');
      const monthTotal = await api.getTotalExpenses(
        monthStart.toISOString().split('T')[0], 
        now.toISOString().split('T')[0]
      );
      const weekTotal = await api.getTotalExpenses(
        weekStart.toISOString().split('T')[0], 
        now.toISOString().split('T')[0]
      );

      setStats({
        totalExpenses: total || 0,
        thisMonth: monthTotal || 0,
        thisWeek: weekTotal || 0,
        count: expenses.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
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
      added: `Expense "${name}" added successfully!`,
      updated: `Expense "${name}" updated successfully!`,
      deleted: `Expense deleted successfully!`
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

  // ==================== EXPENSE CRUD ====================
  const validateForm = () => {
    const errors = {};
    if (!formData.category_id) errors.category_id = "Category is required";
    if (!formData.amount || parseFloat(formData.amount) <= 0) errors.amount = "Valid amount is required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editingExpense) {
        await api.updateExpense({ id: editingExpense.id, ...formData });
        showSuccessModal("updated", formData.description || "Expense");
      } else {
        await api.createExpense(formData);
        showSuccessModal("added", formData.description || "Expense");
      }
      
      closeForm();
      await loadData();
      await loadStats();
    } catch (error) {
      showNotification("error", error.message || "Error saving expense");
    } finally {
      setLoading(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingExpense(null);
    setFormData({
      category_id: '',
      amount: '',
      description: '',
      expense_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash'
    });
    setValidationErrors({});
  };

  const handleDelete = async (id, description) => {
    if (window.confirm(`Delete expense "${description}"?`)) {
      setLoading(true);
      try {
        await api.deleteExpense(id);
        showSuccessModal("deleted", description);
        await loadData();
        await loadStats();
      } catch (error) {
        showNotification("error", error.message || "Error deleting expense");
      } finally {
        setLoading(false);
      }
    }
  };

  // ==================== CATEGORY CRUD ====================
  const validateCategoryForm = () => {
    const errors = {};
    if (!catFormData.name || catFormData.name.trim() === '') errors.name = "Category name is required";
    setCatValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!validateCategoryForm()) return;

    setLoading(true);
    try {
      if (editingCategory) {
        await api.updateExpenseCategory({ 
          id: editingCategory.id, 
          name: catFormData.name, 
          description: catFormData.description, 
          is_active: 1 
        });
        showNotification("success", "Category updated successfully!");
      } else {
        await api.createExpenseCategory({ 
          name: catFormData.name, 
          description: catFormData.description 
        });
        showNotification("success", "Category added successfully!");
      }
      
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCatFormData({ name: '', description: '' });
      setCatValidationErrors({});
      await loadCategories();
    } catch (error) {
      showNotification("error", error.message || "Error saving category");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    // Better-sqlite3 doesn't have a direct delete for categories with foreign keys. 
    // Usually we just deactivate them.
    if (window.confirm(`Deactivate category "${name}"? (Existing expenses will remain uncategorized)`)) {
      setLoading(true);
      try {
        await api.updateExpenseCategory({ id, name, is_active: 0 });
        showNotification("success", "Category deactivated!");
        await loadCategories();
      } catch (error) {
        showNotification("error", error.message || "Error deactivating category");
      } finally {
        setLoading(false);
      }
    }
  };

  // ==================== FILTERS & HELPERS ====================
  const applyFilters = () => {
    let filtered = [...expenses];

    // 1. Search filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(expense => 
        expense.description?.toLowerCase().includes(query) ||
        expense.expense_number?.toLowerCase().includes(query) ||
        expense.category_name?.toLowerCase().includes(query)
      );
    }

    // 2. Payment Method filter
    if (filterMethod !== 'all') {
      filtered = filtered.filter(expense => expense.payment_method === filterMethod);
    }

    // 3. Date Range filter
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59); // Include the full end day
      
      filtered = filtered.filter(expense => {
        const expDate = new Date(expense.expense_date);
        return expDate >= start && expDate <= end;
      });
    }

    return filtered;
  };

  const filteredExpenses = applyFilters();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterMethod('all');
    setDateRange({ start: '', end: '' });
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
                <Receipt size={32} />
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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-purple-700 to-purple-500 bg-clip-text text-transparent">
            Expenses
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <Wallet size={12} />
            Track all business expenses
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg transition-all hover:bg-slate-50 hover:shadow-sm"
          >
            <Tag size={14} />
            Manage Categories
          </button>
          <button
            onClick={() => { 
              setEditingExpense(null); 
              setFormData({ 
                category_id: '', amount: '', description: '', 
                expense_date: new Date().toISOString().split('T')[0], 
                payment_method: 'cash' 
              }); 
              setValidationErrors({});
              setShowForm(true); 
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          >
            <Plus size={14} />
            Add Expense
          </button>
        </div>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Total Expenses</p>
              <p className="text-sm font-bold text-purple-600">{formatCurrency(stats.totalExpenses)}</p>
            </div>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-500">
              <BarChart3 size={14} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-medium">This Month</p>
              <p className="text-sm font-bold text-blue-600">{formatCurrency(stats.thisMonth)}</p>
            </div>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-500">
              <Calendar size={14} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-medium">This Week</p>
              <p className="text-sm font-bold text-emerald-600">{formatCurrency(stats.thisWeek)}</p>
            </div>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-500">
              <TrendingUp size={14} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Total Entries</p>
              <p className="text-sm font-bold text-orange-600">{stats.count}</p>
            </div>
            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-500">
              <Receipt size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* ===== ACTION BAR ===== */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-3 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-wrap gap-2 items-center flex-1">
          
          {/* Search */}
          <div className="relative flex-1 min-w-[150px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search expenses..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 bg-slate-50 focus:bg-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Method Filter */}
          <div className="flex gap-1.5">
            <div className="relative">
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="appearance-none pl-7 pr-6 py-1.5 text-[10px] border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-slate-600 cursor-pointer"
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="credit">Credit</option>
              </select>
              <Filter className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            </div>
          </div>

          {/* Date Range */}
          <div className="flex gap-1.5 items-center">
            <div className="relative">
              <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="pl-7 pr-2 py-1.5 text-[10px] border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-slate-600 w-[130px]"
              />
            </div>
            <span className="text-[10px] text-slate-400">to</span>
            <div className="relative">
              <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="pl-7 pr-2 py-1.5 text-[10px] border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-slate-600 w-[130px]"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || filterMethod !== 'all' || dateRange.start || dateRange.end) && (
            <button 
              onClick={clearFilters}
              className="px-2 py-1.5 border border-slate-200 rounded-lg hover:bg-red-50 text-red-500 flex items-center gap-1 text-[10px] transition-colors"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
          <span className="hidden sm:inline">{filteredExpenses.length} entries</span>
          <button 
            onClick={loadData} 
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-purple-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          <button className="px-2 py-1 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition flex items-center gap-1">
            <Download size={12} /> Export
          </button>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Expense #</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Method</th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="px-3 py-6 text-center text-slate-400">
                  <div className="inline-flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Loading...
                  </div>
                </td></tr>
              ) : filteredExpenses.length === 0 ? (
                <tr><td colSpan="7" className="px-3 py-8 text-center text-slate-400 text-xs">
                  {searchTerm || filterMethod !== 'all' || dateRange.start ? 'No expenses found matching your filters' : 'No expenses recorded yet'}
                </td></tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-2 text-xs text-slate-600">{formatDate(expense.expense_date)}</td>
                    <td className="px-3 py-2">
                      <span className="text-[10px] font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        {expense.expense_number || `EXP-${expense.id}`}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                        {expense.category_name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600 max-w-[150px] truncate">{expense.description || '-'}</td>
                    <td className="px-3 py-2 text-xs text-slate-600 capitalize hidden sm:table-cell">{expense.payment_method || 'Cash'}</td>
                    <td className="px-3 py-2 text-right text-xs font-semibold text-red-600">
                      - {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex justify-center gap-1">
                        <button 
                          onClick={() => {
                            setEditingExpense(expense);
                            setFormData({
                              category_id: expense.category_id || '',
                              amount: expense.amount,
                              description: expense.description || '',
                              expense_date: expense.expense_date.split('T')[0],
                              payment_method: expense.payment_method || 'cash'
                            });
                            setValidationErrors({});
                            setShowForm(true);
                          }} 
                          className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(expense.id, expense.description || 'Expense')} 
                          className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== ADD/EDIT EXPENSE MODAL ===== */}
      {showForm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" 
          style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-5 animate-scale-in relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-t-xl" />
            <button
              onClick={closeForm}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-semibold text-slate-800 mt-2 mb-4">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
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
                  Category *
                </label>
                <select
                  ref={categoryInputRef}
                  required
                  className={`w-full px-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-50 focus:bg-white ${
                    validationErrors.category_id
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-purple-400 focus:ring-purple-100'
                  }`}
                  value={formData.category_id}
                  onChange={(e) => {
                    setFormData({ ...formData, category_id: e.target.value });
                    setValidationErrors({ ...validationErrors, category_id: '' });
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Amount (PKR) *
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  className={`w-full px-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-50 focus:bg-white ${
                    validationErrors.amount
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-purple-400 focus:ring-purple-100'
                  }`}
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData({ ...formData, amount: e.target.value });
                    setValidationErrors({ ...validationErrors, amount: '' });
                  }}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all bg-slate-50 focus:bg-white resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What was this expense for?"
                  rows="2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all bg-slate-50 focus:bg-white"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Method
                  </label>
                  <select
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all bg-slate-50 focus:bg-white"
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  {loading ? 'Saving...' : (editingExpense ? 'Update' : 'Save Expense')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== CATEGORY MANAGEMENT MODAL ===== */}
      {showCategoryModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" 
          style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCategoryModal(false);
              setEditingCategory(null);
              setCatFormData({ name: '', description: '' });
              setCatValidationErrors({});
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-5 animate-scale-in relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-t-xl" />
            <button
              onClick={() => {
                setShowCategoryModal(false);
                setEditingCategory(null);
                setCatFormData({ name: '', description: '' });
                setCatValidationErrors({});
              }}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-semibold text-slate-800 mt-2 mb-4 flex items-center gap-2">
              <Tag size={18} className="text-emerald-500" />
              Manage Categories
            </h3>

            {/* Category Form */}
            <form onSubmit={handleCategorySubmit} className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <input
                    ref={catNameInputRef}
                    type="text"
                    placeholder="Category Name"
                    className={`w-full px-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white ${
                      catValidationErrors.name
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
                    }`}
                    value={catFormData.name}
                    onChange={(e) => {
                      setCatFormData({ ...catFormData, name: e.target.value });
                      setCatValidationErrors({ ...catValidationErrors, name: '' });
                    }}
                  />
                  {catValidationErrors.name && (
                    <p className="text-[9px] text-red-500 mt-0.5">{catValidationErrors.name}</p>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Description (Optional)"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white"
                    value={catFormData.description}
                    onChange={(e) => setCatFormData({ ...catFormData, description: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 text-xs font-medium text-white rounded-lg transition-all hover:shadow-md bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  {editingCategory ? 'Update' : 'Add'}
                </button>
              </div>
            </form>

            {/* Category List */}
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
              {categories.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No categories created yet.</p>
              ) : (
                categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-2 bg-white border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{cat.name}</p>
                      {cat.description && (
                        <p className="text-[9px] text-slate-400 truncate">{cat.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setCatFormData({ name: cat.name, description: cat.description || '' });
                        }}
                        className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== CSS ANIMATIONS ===== */}
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