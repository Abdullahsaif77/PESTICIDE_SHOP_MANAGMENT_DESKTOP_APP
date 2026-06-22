const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // --- Product Management ---
  getProducts: () => ipcRenderer.invoke("product:get"),
  addProduct: (data) => ipcRenderer.invoke("product:add", data),
  deleteProduct: (id) => ipcRenderer.invoke("product:delete", id),

  // --- Authentication & Profile Management ---
  login: (credentials) => ipcRenderer.invoke("auth:login", credentials),
  updateProfile: (profileData) => ipcRenderer.invoke("auth:update-profile", profileData),
  changePassword: (passwordData) => ipcRenderer.invoke("auth:change-password", passwordData),
});