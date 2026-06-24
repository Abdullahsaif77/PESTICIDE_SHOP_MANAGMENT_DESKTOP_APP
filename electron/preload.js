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