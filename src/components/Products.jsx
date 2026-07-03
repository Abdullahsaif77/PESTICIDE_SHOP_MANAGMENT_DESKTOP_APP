import React, { useState, useEffect, useRef } from "react";
import { Search, Plus, Edit3, Trash2, ChevronDown, X, CheckCircle, Package, Tag, Box, AlertCircle, Loader2 } from "lucide-react";

const api = window.api || {
  getProducts: async () => [],
  addProduct: async (data) => {},
  deleteProduct: async (id) => {},
  updateProduct: async (id, data) => {},
  getProductsByCategory: async (category_id) => [],
  getProductsByUnit: async (unit_id) => [],
  getCategories: async () => [],
  getCategoryById: async (id) => ({}),
  addCategory: async (data) => {},
  updateCategory: async (id, data) => {},
  deleteCategory: async (id) => {},
  getUnits: async () => [],
  getUnitById: async (id) => ({}),
  addUnit: async (data) => {},
  updateUnit: async (id, data) => {},
  deleteUnit: async (id) => {},
  getProductById: async (id) => ({}),
  getProductByCode: async (code) => ({}),
  getCategoryProductCount: async (id) => ({}),
};

// Helper function to ensure we always have an array
const ensureArray = (data) => Array.isArray(data) ? data : [];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [productModal, setProductModal] = useState({ open: false, mode: "add", data: null });
  const [categoryModal, setCategoryModal] = useState({ open: false, mode: "add", data: null });
  const [unitModal, setUnitModal] = useState({ open: false, mode: "add", data: null });

  const [successModal, setSuccessModal] = useState({ 
    show: false, 
    message: "", 
    type: "product",
    action: ""
  });

  const [validationErrors, setValidationErrors] = useState({});

  const [productForm, setProductForm] = useState({ 
    name: "",
    code: "",
    brand: "",
    category_id: "",
    unit_id: "",
    purchase_price: 0,
    sale_price: 0,
    barcode: "",
    description: ""
  });
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [unitForm, setUnitForm] = useState({ name: "", short_name: "" });

  const nameInputRef = useRef(null);

  useEffect(() => {
    refreshData();
  }, []);

  // Auto-focus when modal opens
  useEffect(() => {
    if (productModal.open && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current.focus();
      }, 100);
    }
  }, [productModal.open]);

  // Reset form when modal closes - but only when it actually closes
  useEffect(() => {
    if (!productModal.open) {
      const timeoutId = setTimeout(() => {
        setProductForm({
          name: "",
          code: "",
          brand: "",
          category_id: "",
          unit_id: "",
          purchase_price: 0,
          sale_price: 0,
          barcode: "",
          description: ""
        });
        setValidationErrors({});
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [productModal.open]);

  // Frontend search filter - runs whenever products, searchQuery, or selectedCategoryId changes
  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategoryId]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [cats, unitsData, prods] = await Promise.all([
        api.getCategories(),
        api.getUnits(),
        api.getProducts()
      ]);
      
      // Ensure we always have arrays
      setCategories(ensureArray(cats));
      setUnits(ensureArray(unitsData));
      setProducts(ensureArray(prods));
      
      // Reset search after refresh
      setSearchQuery("");
      setSelectedCategory("All Categories");
      setSelectedCategoryId(null);
    } catch (err) {
      console.error("Data fetch error:", err);
      // Set empty arrays on error
      setCategories([]);
      setUnits([]);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCategories = async () => {
    try {
      const cats = await api.getCategories();
      setCategories(ensureArray(cats));
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  };

  const refreshUnits = async () => {
    try {
      const unitsData = await api.getUnits();
      setUnits(ensureArray(unitsData));
    } catch (err) {
      console.error("Error fetching units:", err);
      setUnits([]);
    }
  };

  const filterProducts = () => {
    let filtered = ensureArray(products);

    // Filter by category
    if (selectedCategoryId) {
      filtered = filtered.filter(p => p && p.category_id === selectedCategoryId);
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p && (
          (p.name && p.name.toLowerCase().includes(query)) ||
          (p.code && p.code.toLowerCase().includes(query)) ||
          (p.brand && p.brand.toLowerCase().includes(query)) ||
          (p.barcode && p.barcode.toLowerCase().includes(query))
        )
      );
    }

    setFilteredProducts(filtered);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    // The filter will run automatically via useEffect
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleCategorySelect = (category) => {
    setIsCategoryDropdownOpen(false);
    if (category === "All Categories") {
      setSelectedCategory("All Categories");
      setSelectedCategoryId(null);
    } else {
      setSelectedCategory(category.name);
      setSelectedCategoryId(category.id);
    }
  };

  const showSuccessModal = (type, action, name = "") => {
    const messages = {
      product: {
        added: `Product "${name}" added successfully!`,
        updated: `Product "${name}" updated successfully!`,
        deleted: `Product "${name}" deleted successfully!`
      },
      category: {
        added: `Category "${name}" created successfully!`,
        updated: `Category "${name}" updated successfully!`,
        deleted: `Category "${name}" deleted successfully!`
      },
      unit: {
        added: `Unit "${name}" created successfully!`,
        updated: `Unit "${name}" updated successfully!`,
        deleted: `Unit "${name}" deleted successfully!`
      }
    };

    setSuccessModal({
      show: true,
      message: messages[type]?.[action] || `${type} ${action} successfully!`,
      type,
      action
    });

    setTimeout(() => {
      setSuccessModal({ show: false, message: "", type: "product", action: "" });
    }, 3000);
  };

  const validateProductForm = () => {
    const errors = {};
    
    if (!productForm.name || productForm.name.trim() === "") {
      errors.name = "Product name is required";
    }
    
    if (!productForm.category_id) {
      errors.category_id = "Category is required";
    }
    
    if (!productForm.unit_id) {
      errors.unit_id = "Unit is required";
    }
    
    if (!productForm.purchase_price || productForm.purchase_price <= 0) {
      errors.purchase_price = "Purchase price must be greater than 0";
    }
    
    if (!productForm.sale_price || productForm.sale_price <= 0) {
      errors.sale_price = "Sale price must be greater than 0";
    }
    
    if (productForm.sale_price < productForm.purchase_price) {
      errors.sale_price = "Sale price cannot be less than purchase price";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (field, value) => {
    setProductForm({ ...productForm, [field]: value });
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: "" });
    }
  };

  const openAddProduct = () => {
    setProductForm({ 
      name: "",
      code: "",
      brand: "",
      category_id: "",
      unit_id: "",
      purchase_price: 0,
      sale_price: 0,
      barcode: "",
      description: ""
    });
    setValidationErrors({});
    setProductModal({ open: true, mode: "add", data: null });
  };

  const openEditProduct = (product) => {
    if (!product) {
      console.error('Product is undefined');
      return;
    }
    
    setProductForm({ 
      name: product.name || "",
      code: product.code || "",
      brand: product.brand || "",
      category_id: product.category_id || "",
      unit_id: product.unit_id || "",
      purchase_price: product.purchase_price || 0,
      sale_price: product.sale_price || 0,
      barcode: product.barcode || "",
      description: product.description || ""
    });
    setValidationErrors({});
    
    if (!product.id) {
      console.error('Product has no ID!', product);
      alert('Error: Product ID not found');
      return;
    }
    
    setProductModal({ open: true, mode: "edit", data: product });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProductForm()) {
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
        name: productForm.name,
        code: productForm.code || null,
        brand: productForm.brand || null,
        category_id: productForm.category_id,
        unit_id: productForm.unit_id,
        purchase_price: productForm.purchase_price,
        sale_price: productForm.sale_price,
        barcode: productForm.barcode || null,
        description: productForm.description || null
      };
      
      let result;
      if (productModal.mode === "add") {
        result = await api.addProduct(productData);
        
        if (result && result.success) {
          showSuccessModal("product", "added", productForm.name);
          setProductModal({ open: false, mode: "add", data: null });
          setValidationErrors({});
          await refreshData();
          setSearchQuery("");
        } else {
          console.error('Product creation failed:', result?.error || 'Unknown error');
          alert(result?.error || 'Failed to add product');
        }
      } else {
        result = await api.updateProduct(productModal.data.id, productData);
        
        if (result && result.success) {
          showSuccessModal("product", "updated", productForm.name);
          setProductModal({ open: false, mode: "add", data: null });
          setValidationErrors({});
          await refreshData();
          setSearchQuery("");
        } else {
          console.error('Product update failed:', result?.error || 'Unknown error');
          alert(result?.error || 'Failed to update product');
        }
      }
    } catch (err) {
      console.error("Failed saving product:", err);
      alert(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!id) {
      console.error('Cannot delete: No ID provided');
      return;
    }
    
    if (window.confirm(`Delete product "${name}" permanently?`)) {
      setIsLoading(true);
      try {
        await api.deleteProduct(id);
        showSuccessModal("product", "deleted", name);
        
        setProductModal({ open: false, mode: "add", data: null });
        setValidationErrors({});
        await refreshData();
        setSearchQuery("");
      } catch (err) {
        console.error("Failed deleting product:", err);
        alert('Failed to delete product. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openCategoryManager = () => {
    setCategoryForm({ name: "", description: "" });
    setCategoryModal({ open: true, mode: "add", data: null });
  };

  const handleEditCategory = async (cat) => {
    if (!cat || !cat.id) {
      console.error('Invalid category for editing');
      return;
    }
    
    try {
      const target = await api.getCategoryById(cat.id);
      setCategoryForm({ 
        name: target?.name || "", 
        description: target?.description || "" 
      });
      setCategoryModal({ open: true, mode: "edit", data: cat });
    } catch (err) {
      console.error("Failed fetching category info:", err);
      alert('Failed to load category data');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryForm.name || categoryForm.name.trim() === "") {
      alert('Category name is required');
      return;
    }
    
    setIsLoading(true);
    try {
      if (categoryModal.mode === "add") {
        await api.addCategory(categoryForm);
        showSuccessModal("category", "added", categoryForm.name);
      } else {
        await api.updateCategory(categoryModal.data.id, categoryForm);
        showSuccessModal("category", "updated", categoryForm.name);
      }
      setCategoryForm({ name: "", description: "" });
      setCategoryModal({ open: false, mode: "add", data: null });
      await refreshCategories();
      await refreshData();
      setSearchQuery("");
    } catch (err) {
      console.error("Failed saving category:", err);
      alert('Failed to save category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!id) {
      console.error('Cannot delete: No ID provided');
      return;
    }
    
    if (window.confirm(`Delete category "${name}"?`)) {
      setIsLoading(true);
      try {
        await api.deleteCategory(id);
        if (selectedCategoryId === id) {
          setSelectedCategory("All Categories");
          setSelectedCategoryId(null);
        }
        showSuccessModal("category", "deleted", name);
        await refreshCategories();
        await refreshData();
        setSearchQuery("");
      } catch (err) {
        console.error("Failed deleting category:", err);
        alert(err.message || 'Failed to delete category');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openUnitManager = () => {
    setUnitForm({ name: "", short_name: "" });
    setUnitModal({ open: true, mode: "add", data: null });
  };

  const handleEditUnit = async (unit) => {
    if (!unit || !unit.id) {
      console.error('Invalid unit for editing');
      return;
    }
    
    try {
      const target = await api.getUnitById(unit.id);
      setUnitForm({ 
        name: target?.name || "", 
        short_name: target?.short_name || "" 
      });
      setUnitModal({ open: true, mode: "edit", data: unit });
    } catch (err) {
      console.error("Failed fetching unit info:", err);
      alert('Failed to load unit data');
    }
  };

  const handleUnitSubmit = async (e) => {
    e.preventDefault();
    
    if (!unitForm.name || unitForm.name.trim() === "") {
      alert('Unit name is required');
      return;
    }
    
    setIsLoading(true);
    try {
      if (unitModal.mode === "add") {
        await api.addUnit(unitForm);
        showSuccessModal("unit", "added", unitForm.name);
      } else {
        await api.updateUnit(unitModal.data.id, unitForm);
        showSuccessModal("unit", "updated", unitForm.name);
      }
      setUnitForm({ name: "", short_name: "" });
      setUnitModal({ open: false, mode: "add", data: null });
      await refreshUnits();
      await refreshData();
      setSearchQuery("");
    } catch (err) {
      console.error("Failed saving unit:", err);
      alert('Failed to save unit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUnit = async (id, name) => {
    if (!id) {
      console.error('Cannot delete: No ID provided');
      return;
    }
    
    if (window.confirm(`Delete unit "${name}"?`)) {
      setIsLoading(true);
      try {
        await api.deleteUnit(id);
        showSuccessModal("unit", "deleted", name);
        await refreshUnits();
        await refreshData();
        setSearchQuery("");
      } catch (err) {
        console.error("Failed deleting unit:", err);
        alert(err.message || 'Failed to delete unit');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getCategoryName = (categoryId) => {
    // Ensure categories is an array before using find
    if (!Array.isArray(categories) || categories.length === 0) {
      return "Uncategorized";
    }
    const cat = categories.find(c => c && c.id === categoryId);
    return cat ? cat.name : "Uncategorized";
  };

  const getUnitName = (unitId) => {
    // Ensure units is an array before using find
    if (!Array.isArray(units) || units.length === 0) {
      return "N/A";
    }
    const unit = units.find(u => u && u.id === unitId);
    return unit ? (unit.short_name || unit.name) : "N/A";
  };

  const SuccessModal = ({ show, message, type, action }) => {
    if (!show) return null;

    const icons = {
      product: <Package size={32} />,
      category: <Tag size={32} />,
      unit: <Box size={32} />
    };

    const gradients = {
      added: "from-emerald-400 to-emerald-600",
      updated: "from-blue-400 to-blue-600",
      deleted: "from-red-400 to-red-600"
    };

    const bgGradients = {
      added: "from-emerald-50 to-emerald-100/50",
      updated: "from-blue-50 to-blue-100/50",
      deleted: "from-red-50 to-red-100/50"
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}>
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center animate-scale-in relative overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[action]}`} />
          <button 
            onClick={() => setSuccessModal({ show: false, message: "", type: "product", action: "" })}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
          <div className={`mt-4 w-16 h-16 rounded-2xl bg-gradient-to-br ${bgGradients[action]} flex items-center justify-center mx-auto mb-3`}>
            <div className={`text-${action === 'deleted' ? 'red' : action === 'updated' ? 'blue' : 'emerald'}-500`}>
              {icons[type] || <Package size={32} />}
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Success!</h3>
          <p className="text-xs text-slate-500 mb-4">{message}</p>
          <button
            onClick={() => setSuccessModal({ show: false, message: "", type: "product", action: "" })}
            className={`px-5 py-1.5 text-white text-xs font-medium rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r ${gradients[action]}`}
          >
            Got it
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100/50 min-h-screen">
      
      <SuccessModal 
        show={successModal.show} 
        message={successModal.message} 
        type={successModal.type}
        action={successModal.action}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-500 bg-clip-text text-transparent">
            Products Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage your product catalogue efficiently</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={openUnitManager}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <Box size={14} />
            Units
          </button>
          <button
            onClick={openCategoryManager}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <Tag size={14} />
            Categories
          </button>
          <button
            onClick={openAddProduct}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
          >
            <Plus size={14} />
            Add Product
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search by name, code, brand..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="flex items-center justify-between gap-2 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white min-w-[140px] hover:bg-slate-50 transition-all shadow-sm"
            >
              <span className="truncate">{selectedCategory}</span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto animate-slide-down">
                <div
                  onClick={() => handleCategorySelect("All Categories")}
                  className="px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer text-slate-700 font-medium border-b border-slate-50"
                >
                  All Categories
                </div>
                {Array.isArray(categories) && categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat)}
                    className="px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer text-slate-600"
                  >
                    {cat.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium whitespace-nowrap">
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Loading...
            </span>
          ) : (
            `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60">
                <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Brand</th>
                <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Unit</th>
                <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-right">Purchase</th>
                <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-right">Sale</th>
                <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-xs">Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Package size={32} className="text-slate-300" />
                      <span className="text-xs">
                        {searchQuery ? 'No products found matching your search' : 'No products found. Add your first product!'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-2 px-3">
                      <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {product.code || 'N/A'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sm font-medium text-slate-800">{product.name}</td>
                    <td className="py-2 px-3 text-xs text-slate-500">{product.brand || '-'}</td>
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-indigo-50 text-indigo-600 rounded-full">
                        <Tag size={10} />
                        {getCategoryName(product.category_id)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-xs text-slate-500">{getUnitName(product.unit_id)}</td>
                    <td className="py-2 px-3 text-xs font-medium text-right text-slate-600">
                      ${Number(product.purchase_price).toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-xs font-medium text-right text-emerald-600">
                      ${Number(product.sale_price).toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditProduct(product)} 
                          className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id, product.name)} 
                          className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete"
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

      {/* PRODUCT MODAL */}
      {productModal.open && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" 
          style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setProductModal({ open: false, mode: "add", data: null });
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-5 animate-scale-in relative max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-t-xl" />
            <button 
              onClick={() => setProductModal({ open: false, mode: "add", data: null })} 
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-semibold text-slate-800 mt-2 mb-4">
              {productModal.mode === "add" ? "Add Product" : "Edit Product"}
            </h3>
            
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

            <form onSubmit={handleProductSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Product Name *</label>
                  <input 
                    ref={nameInputRef}
                    type="text" 
                    required 
                    value={productForm.name} 
                    onChange={(e) => handleFieldChange('name', e.target.value)} 
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-50 focus:bg-white ${
                      validationErrors.name 
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100' 
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
                    }`}
                    placeholder="Enter product name"
                    data-error={!!validationErrors.name}
                    disabled={isLoading}
                  />
                  {validationErrors.name && (
                    <p className="text-[10px] text-red-500 mt-0.5">{validationErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Product Code</label>
                  <input 
                    type="text" 
                    value={productForm.code} 
                    onChange={(e) => handleFieldChange('code', e.target.value)} 
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-slate-50 focus:bg-white"
                    placeholder="e.g. PRD-001"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Brand</label>
                <input 
                  type="text" 
                  value={productForm.brand} 
                  onChange={(e) => handleFieldChange('brand', e.target.value)} 
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-slate-50 focus:bg-white"
                  placeholder="e.g. Apple"
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Category *</label>
                  <select 
                    required
                    value={productForm.category_id} 
                    onChange={(e) => handleFieldChange('category_id', e.target.value)} 
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-50 focus:bg-white ${
                      validationErrors.category_id 
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100' 
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
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
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Unit *</label>
                  <select 
                    required
                    value={productForm.unit_id} 
                    onChange={(e) => handleFieldChange('unit_id', e.target.value)} 
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-50 focus:bg-white ${
                      validationErrors.unit_id 
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100' 
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
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
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Purchase Price *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={productForm.purchase_price} 
                    onChange={(e) => handleFieldChange('purchase_price', parseFloat(e.target.value) || 0)} 
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-50 focus:bg-white ${
                      validationErrors.purchase_price 
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100' 
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
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
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Sale Price *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={productForm.sale_price} 
                    onChange={(e) => handleFieldChange('sale_price', parseFloat(e.target.value) || 0)} 
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all bg-slate-50 focus:bg-white ${
                      validationErrors.sale_price 
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100' 
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Barcode</label>
                  <input 
                    type="text" 
                    value={productForm.barcode} 
                    onChange={(e) => handleFieldChange('barcode', e.target.value)} 
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-slate-50 focus:bg-white"
                    placeholder="Enter barcode"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                  <textarea 
                    rows="2" 
                    value={productForm.description} 
                    onChange={(e) => handleFieldChange('description', e.target.value)} 
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-slate-50 focus:bg-white resize-none"
                    placeholder="Product description..."
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setProductModal({ open: false, mode: "add", data: null })} 
                  className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="px-4 py-1.5 text-xs font-medium text-white rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  {isLoading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {categoryModal.open && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" 
          style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setCategoryModal({ open: false, mode: "add", data: null });
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-5 animate-scale-in relative flex gap-5">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-t-xl" />
            <button onClick={() => setCategoryModal({ open: false, mode: "add", data: null })} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={18} />
            </button>
            
            <div className="w-1/2 border-r pr-5 border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mt-2 mb-4">
                {categoryModal.mode === "add" ? "Create Category" : "Update Category"}
              </h3>
              <form onSubmit={handleCategorySubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Category Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={categoryForm.name} 
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} 
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50 focus:bg-white"
                    placeholder="e.g. Electronics"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                  <textarea 
                    rows="2" 
                    value={categoryForm.description || ""} 
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} 
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50 focus:bg-white resize-none"
                    placeholder="Optional description..."
                    disabled={isLoading}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  {categoryModal.mode === "edit" && (
                    <button type="button" onClick={() => { setCategoryForm({ name: "", description: "" }); setCategoryModal({ open: true, mode: "add", data: null }); }} className="px-3 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                  )}
                  <button type="submit" disabled={isLoading} className="px-3 py-1 text-xs font-medium text-white rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700">
                    {isLoading ? 'Saving...' : categoryModal.mode === "add" ? 'Create' : 'Update'}
                  </button>
                </div>
              </form>
            </div>

            <div className="w-1/2 flex flex-col">
              <h3 className="text-sm font-semibold text-slate-800 mt-2 mb-3">Categories</h3>
              <div className="flex-1 max-h-[200px] overflow-y-auto space-y-1.5 pr-1">
                {Array.isArray(categories) && categories.map((c) => (
                  <div key={c.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100 text-sm group hover:border-slate-200 transition-colors">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-slate-700 text-xs block truncate">{c.name}</span>
                      {c.description && <span className="text-[10px] text-slate-400 truncate block">{c.description}</span>}
                    </div>
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditCategory(c)} className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit3 size={12} />
                      </button>
                      <button onClick={() => handleDeleteCategory(c.id, c.name)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UNIT MODAL */}
      {unitModal.open && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" 
          style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setUnitModal({ open: false, mode: "add", data: null });
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-5 animate-scale-in relative flex gap-5">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-t-xl" />
            <button onClick={() => setUnitModal({ open: false, mode: "add", data: null })} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={18} />
            </button>
            
            <div className="w-1/2 border-r pr-5 border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mt-2 mb-4">
                {unitModal.mode === "add" ? "Create Unit" : "Update Unit"}
              </h3>
              <form onSubmit={handleUnitSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Unit Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={unitForm.name} 
                    onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })} 
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-slate-50 focus:bg-white"
                    placeholder="e.g. Kilogram"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Short Name</label>
                  <input 
                    type="text" 
                    value={unitForm.short_name} 
                    onChange={(e) => setUnitForm({ ...unitForm, short_name: e.target.value })} 
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-slate-50 focus:bg-white"
                    placeholder="e.g. kg"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  {unitModal.mode === "edit" && (
                    <button type="button" onClick={() => { setUnitForm({ name: "", short_name: "" }); setUnitModal({ open: true, mode: "add", data: null }); }} className="px-3 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                  )}
                  <button type="submit" disabled={isLoading} className="px-3 py-1 text-xs font-medium text-white rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
                    {isLoading ? 'Saving...' : unitModal.mode === "add" ? 'Create' : 'Update'}
                  </button>
                </div>
              </form>
            </div>

            <div className="w-1/2 flex flex-col">
              <h3 className="text-sm font-semibold text-slate-800 mt-2 mb-3">Units</h3>
              <div className="flex-1 max-h-[200px] overflow-y-auto space-y-1.5 pr-1">
                {Array.isArray(units) && units.map((u) => (
                  <div key={u.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100 text-sm group hover:border-slate-200 transition-colors">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-slate-700 text-xs block truncate">{u.name}</span>
                      {u.short_name && <span className="text-[10px] text-slate-400 truncate block">{u.short_name}</span>}
                    </div>
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditUnit(u)} className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit3 size={12} />
                      </button>
                      <button onClick={() => handleDeleteUnit(u.id, u.name)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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