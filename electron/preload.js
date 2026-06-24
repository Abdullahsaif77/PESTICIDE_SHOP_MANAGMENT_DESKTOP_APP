const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {

  // --- Product Management ---
  getProducts: () => ipcRenderer.invoke("product:get"),
  addProduct: (data) => ipcRenderer.invoke("product:add", data),
  deleteProduct: (id) => ipcRenderer.invoke("product:delete", id),
  updateProduct: (data) => ipcRenderer.invoke("product:update", data),

  // --- Authentication & Profile Management ---
  login: (credentials) => ipcRenderer.invoke("auth:login", credentials),
  updateProfile: (profileData) =>
    ipcRenderer.invoke("auth:update-profile", profileData),
  changePassword: (passwordData) =>
    ipcRenderer.invoke("auth:change-password", passwordData),

  // --- Shop Management ---
  getShop: () => ipcRenderer.invoke("shop:get"),
  createShop: (data) => ipcRenderer.invoke("shop:create", data),
  updateShop: (data) => ipcRenderer.invoke("shop:update", data),

  // --- Backup Management ---
  createBackup: () => ipcRenderer.invoke("backup:create"),
  restoreBackup: (zipFilePath) => ipcRenderer.invoke("backup:restore", zipFilePath),

});