// electron/preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // --- Product Management ---
  getProducts: () => ipcRenderer.invoke("product:get"),
  getProductById: (id) => ipcRenderer.invoke("product:getById", id),
  getProductByCode: (code) => ipcRenderer.invoke("product:getByCode", code),
  searchProducts: (query) => ipcRenderer.invoke("product:search", query),
  addProduct: (data) => ipcRenderer.invoke("product:add", data),
  updateProduct: (id, data) => ipcRenderer.invoke("product:update", id, data),
  deleteProduct: (id) => ipcRenderer.invoke("product:delete", id),
  getProductsByCategory: (category_id) => ipcRenderer.invoke("product:getByCategory", category_id),
  getProductsByUnit: (unit_id) => ipcRenderer.invoke("product:getByUnit", unit_id),

  // --- Category Management ---
  getCategories: () => ipcRenderer.invoke("category:get"),
  getCategoryById: (id) => ipcRenderer.invoke("category:getById", id),
  addCategory: (data) => ipcRenderer.invoke("category:add", data),
  updateCategory: (id, data) => ipcRenderer.invoke("category:update", id, data),
  deleteCategory: (id) => ipcRenderer.invoke("category:delete", id),
  getCategoryProductCount: (id) => ipcRenderer.invoke("category:getProductCount", id),

  // --- Unit Management ---
  getUnits: () => ipcRenderer.invoke("unit:get"),
  getUnitById: (id) => ipcRenderer.invoke("unit:getById", id),
  addUnit: (data) => ipcRenderer.invoke("unit:add", data),
  updateUnit: (id, data) => ipcRenderer.invoke("unit:update", id, data),
  deleteUnit: (id) => ipcRenderer.invoke("unit:delete", id),

  // --- Warehouse Management ---
  createWarehouse: (data) => ipcRenderer.invoke("warehouse:create", data),
  getActiveOnlyWarehouses: () => ipcRenderer.invoke("warehouse:ActiveOnly"),
  getWarehouseById: (id) => ipcRenderer.invoke("warehouse:getById", id),
  updateWarehouse: (id, data) => ipcRenderer.invoke("warehouse:update", id, data),
  deleteWarehouse: (id) => ipcRenderer.invoke("warehouse:delete", id),

  // --- Batch Management ---
  createBatch: (data) => ipcRenderer.invoke("batch:create", data),
  getAllBatches: (filters) => ipcRenderer.invoke("batch:getAll", filters),
  getBatchById: (id) => ipcRenderer.invoke("batch:getById", id),
  getBatchesByProduct: (productId) => ipcRenderer.invoke("batch:getByProduct", productId),
  updateBatch: (id, data) => ipcRenderer.invoke("batch:update", id, data),
  deleteBatch: (id) => ipcRenderer.invoke("batch:delete", id),
  getExpiringBatches: (days) => ipcRenderer.invoke("batch:getExpiring", days),
  getExpiredBatches: () => ipcRenderer.invoke("batch:getExpired"),

  // --- Inventory Management ---
  getInventoryByProduct: (productId) => ipcRenderer.invoke("inventory:getByProduct", productId),
  getInventoryByWarehouse: (warehouseId) => ipcRenderer.invoke("inventory:getByWarehouse", warehouseId),
  getProductStock: (productId, warehouseId) => ipcRenderer.invoke("inventory:getProductStock", productId, warehouseId),
  addStock: (productId, warehouseId, batchId, quantity) => ipcRenderer.invoke("inventory:addStock", productId, warehouseId, batchId, quantity),
  removeStock: (productId, warehouseId, batchId, quantity) => ipcRenderer.invoke("inventory:removeStock", productId, warehouseId, batchId, quantity),
  reserveStock: (productId, warehouseId, batchId, quantity) => ipcRenderer.invoke("inventory:reserve", productId, warehouseId, batchId, quantity),
  releaseReservedStock: (productId, warehouseId, batchId, quantity) => ipcRenderer.invoke("inventory:release", productId, warehouseId, batchId, quantity),
  getLowStock: () => ipcRenderer.invoke("inventory:getLowStock"),
  getInventorySummary: () => ipcRenderer.invoke("inventory:getSummary"),
  updateMinMaxStock: (productId, warehouseId, minStock, maxStock) => ipcRenderer.invoke("inventory:updateMinMax", productId, warehouseId, minStock, maxStock),
  getStockValue: () => ipcRenderer.invoke("inventory:getStockValue"),
  getDetailedWarehouseInventory: (warehouseId) => ipcRenderer.invoke("inventory:getDetailedWarehouse", warehouseId),
  getAvailableQuantity: (productId, warehouseId) => ipcRenderer.invoke("inventory:getAvailableQuantity", productId, warehouseId),

  // --- Stock Transfer Management ---
  createTransfer: (data) => ipcRenderer.invoke("transfer:create", data),
  getAllTransfers: (filters) => ipcRenderer.invoke("transfer:getAll", filters),
  getTransferById: (id) => ipcRenderer.invoke("transfer:getById", id),
  completeTransfer: (id) => ipcRenderer.invoke("transfer:complete", id),
  cancelTransfer: (id) => ipcRenderer.invoke("transfer:cancel", id),
  deleteTransfer: (id) => ipcRenderer.invoke("transfer:delete", id),
  getPendingTransfers: () => ipcRenderer.invoke("transfer:getPending"),
  getTransferHistory: (limit) => ipcRenderer.invoke("transfer:getHistory", limit),
  getTransfersByProduct: (productId) => ipcRenderer.invoke("transfer:getByProduct", productId),
  getTransfersFromWarehouse: (warehouseId) => ipcRenderer.invoke("transfer:getFromWarehouse", warehouseId),
  getTransfersToWarehouse: (warehouseId) => ipcRenderer.invoke("transfer:getToWarehouse", warehouseId),
  getTransferStats: () => ipcRenderer.invoke("transfer:getStats"),
  getTransfersByDateRange: (startDate, endDate) => ipcRenderer.invoke("transfer:getByDateRange", startDate, endDate),

  // --- Supplier Management ---
  createSupplier: (data) => ipcRenderer.invoke("supplier:create", data),
  getAllSuppliers: (filters) => ipcRenderer.invoke("supplier:getAll", filters),
  getSupplierById: (id) => ipcRenderer.invoke("supplier:getById", id),
  updateSupplier: (id, data) => ipcRenderer.invoke("supplier:update", id, data),
  deleteSupplier: (id) => ipcRenderer.invoke("supplier:delete", id),
  getActiveSuppliers: () => ipcRenderer.invoke("supplier:getActive"),
  searchSuppliers: (query) => ipcRenderer.invoke("supplier:search", query),
  getSupplierBalance: (id) => ipcRenderer.invoke("supplier:getBalance", id),
  updateSupplierCredit: (id, amount) => ipcRenderer.invoke("supplier:updateCredit", id, amount),
  updateSupplierDebit: (id, amount) => ipcRenderer.invoke("supplier:updateDebit", id, amount),
  updateSupplierBalance: (id, amount) => ipcRenderer.invoke("supplier:updateBalance", id, amount),
  getSupplierStats: () => ipcRenderer.invoke("supplier:getStats"),
  getSuppliersWithHighBalance: (minBalance) => ipcRenderer.invoke("supplier:getHighBalance", minBalance),
  getTopSuppliers: (limit) => ipcRenderer.invoke("supplier:getTop", limit),
  getSupplierSummary: () => ipcRenderer.invoke("supplier:getSummary"),
  getSuppliersWithCredit: () => ipcRenderer.invoke("supplier:getWithCredit"),
  getSuppliersWithDebit: () => ipcRenderer.invoke("supplier:getWithDebit"),
  getSuppliersWithBalance: () => ipcRenderer.invoke("supplier:getWithBalance"),
  exportSuppliers: (filters) => ipcRenderer.invoke("supplier:export", filters),
  getSupplierPurchases: (id) => ipcRenderer.invoke("supplier:getPurchases", id),
  getSupplierWithMostPurchases: () => ipcRenderer.invoke("supplier:getMostPurchases"),

  // --- Customer Management ---
  createCustomer: (data) => ipcRenderer.invoke("customer:create", data),
  getAllCustomers: (filters) => ipcRenderer.invoke("customer:getAll", filters),
  getCustomerById: (id) => ipcRenderer.invoke("customer:getById", id),
  updateCustomer: (id, data) => ipcRenderer.invoke("customer:update", id, data),
  deleteCustomer: (id) => ipcRenderer.invoke("customer:delete", id),
  getActiveCustomers: () => ipcRenderer.invoke("customer:getActive"),
  searchCustomers: (query) => ipcRenderer.invoke("customer:search", query),
  getCustomerBalance: (id) => ipcRenderer.invoke("customer:getBalance", id),
  updateCustomerCredit: (id, amount) => ipcRenderer.invoke("customer:updateCredit", id, amount),
  updateCustomerDebit: (id, amount) => ipcRenderer.invoke("customer:updateDebit", id, amount),
  updateCustomerBalance: (id, amount) => ipcRenderer.invoke("customer:updateBalance", id, amount),
  getCustomerStats: () => ipcRenderer.invoke("customer:getStats"),
  getTopCustomers: (limit) => ipcRenderer.invoke("customer:getTop", limit),
  getCustomerWithSales: (id) => ipcRenderer.invoke("customer:getWithSales", id),
  getCustomersWithCredit: () => ipcRenderer.invoke("customer:getWithCredit"),
  getCustomersWithDebit: () => ipcRenderer.invoke("customer:getWithDebit"),
  getCustomersWithBalance: () => ipcRenderer.invoke("customer:getWithBalance"),
  exportCustomers: (filters) => ipcRenderer.invoke("customer:export", filters),

  // --- Authentication & Profile Management ---
  login: (credentials) => ipcRenderer.invoke("auth:login", credentials),
  updateProfile: (profileData) => ipcRenderer.invoke("auth:update-profile", profileData),
  changePassword: (passwordData) => ipcRenderer.invoke("auth:change-password", passwordData),

  // --- Shop Management ---
  getShop: () => ipcRenderer.invoke("shop:get"),
  createShop: (data) => ipcRenderer.invoke("shop:create", data),
  updateShop: (data) => ipcRenderer.invoke("shop:update", data),

  // --- Backup Management ---
  createBackup: () => ipcRenderer.invoke("backup:create"),
  restoreBackup: (zipFilePath) => ipcRenderer.invoke("backup:restore", zipFilePath),
  selectBackupFile: () => ipcRenderer.invoke('dialog:selectBackupFile'),
});