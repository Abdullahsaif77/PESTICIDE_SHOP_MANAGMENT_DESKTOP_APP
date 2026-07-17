import React, { useState, useEffect } from "react";

// ── SUCCESS MODAL ──────────────────────────────────────────────────────────────
const SuccessModal = ({ modal, onClose }) => {
  useEffect(() => {
    if (!modal.open) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [modal.open]);

  if (!modal.open) return null;

  const icons = {
    profile: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    password: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    shop: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    backup: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    restore: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  };

  const gradients = {
    profile: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    password: "linear-gradient(135deg, #10b981, #059669)",
    shop: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
    backup: "linear-gradient(135deg, #f59e0b, #d97706)",
    restore: "linear-gradient(135deg, #ef4444, #dc2626)",
    error: "linear-gradient(135deg, #ef4444, #dc2626)",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)", animation: "accFadeIn 0.2s ease" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center max-w-xs w-full mx-4 relative overflow-hidden"
        style={{ animation: "modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: gradients[modal.type] || gradients.profile }} />

        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white mb-4 shadow-lg"
          style={{ background: gradients[modal.type] || gradients.profile, boxShadow: `0 8px 24px rgba(0,0,0,0.18)` }}
        >
          {icons[modal.type] || icons.profile}
        </div>

        <div className="absolute top-[58px] left-1/2 -translate-x-1/2 translate-x-[18px] -translate-y-[18px]">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h3 className="font-bold text-slate-900 text-sm mb-1">{modal.title}</h3>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-5">{modal.subtitle}</p>

        <div className="w-full h-0.5 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full"
            style={{ background: gradients[modal.type] || gradients.profile, animation: "progressShrink 3.5s linear forwards" }}
          />
        </div>

        <button
          onClick={onClose}
          className="px-5 py-1.5 text-white text-xs font-semibold rounded-lg transition-all hover:-translate-y-px active:translate-y-0"
          style={{ background: gradients[modal.type] || gradients.profile }}
        >
          Got it
        </button>
      </div>

      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.85) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes progressShrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// ── CONFIRMATION MODAL ────────────────────────────────────────────────────────
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel" }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)", animation: "accFadeIn 0.2s ease" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4"
        style={{ animation: "modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-amber-100 rounded-full text-amber-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
        </div>
        <p className="text-xs text-slate-600 mb-5">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
const AdminControlCenter = ({ user, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState("profile");

  // Modal state
  const [modal, setModal] = useState({ open: false, type: "profile", title: "", subtitle: "" });
  const showModal = (type, title, subtitle) => setModal({ open: true, type, title, subtitle });
  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // =========================
  // STATE MANAGEMENT
  // =========================
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState("");
  const [passShake, setPassShake] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [shop, setShop] = useState({
    shop_name: "", address: "", phone: "", email: "",
    license_number: "", gst_number: "", currency: "PKR",
  });
  const [shopLoading, setShopLoading] = useState(false);
  const [shopMsg, setShopMsg] = useState("");

  // ── BACKUP STATE ─────────────────────────────────────────────────────────────
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [backupMsg, setBackupMsg] = useState("");
  const [lastBackup, setLastBackup] = useState(null);

  useEffect(() => {
    if (activeTab === "shop") loadShop();
  }, [activeTab]);

  const loadShop = async () => {
    try {
      const data = await window.api.getShop();
      if (data) setShop(data);
    } catch (err) { console.log(err); }
  };

  // Password strength
  const getStrength = (val) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  };
  const strengthColors = ["#ef4444", "#f97316", "#eab308", "#10b981"];
  const strengthScore = getStrength(newPassword);
  const strengthWidth = newPassword ? `${strengthScore * 25}%` : "0%";
  const strengthColor = newPassword ? strengthColors[strengthScore - 1] || "#ef4444" : "transparent";

  const passwordsMatch = confirmPassword && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword && newPassword !== confirmPassword;

  const triggerShake = () => {
    setPassShake(true);
    setTimeout(() => setPassShake(false), 400);
  };

  // ── HANDLERS ────────────────────────────────────────────────────────────────
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg("");
    try {
      const res = await window.api.updateProfile({ id: user.id, fullName, username });
      if (res.success) {
        onUserUpdate?.(res.user);
        showModal("profile", "Profile Updated", "Your account identity has been saved successfully.");
      } else {
        setProfileMsg(res.error || "Failed");
      }
    } catch {
      setProfileMsg("Error");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) { setPassMsg("Fill all password fields"); return; }
    if (newPassword !== confirmPassword) { setPassMsg("Passwords do not match"); triggerShake(); return; }
    if (newPassword.length < 6) { setPassMsg("Password too short"); return; }
    setPassLoading(true);
    setPassMsg("");
    try {
      const res = await window.api.changePassword({ id: user.id, currentPassword, newPassword });
      if (res.success) {
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
        showModal("password", "Password Changed", "Your security key has been updated. Stay safe!");
      } else {
        setPassMsg(res.error || "Failed");
        triggerShake();
      }
    } catch {
      setPassMsg("Error");
    } finally {
      setPassLoading(false);
    }
  };

  // ✅ FIXED: Shop update handler
  const handleShopUpdate = async (e) => {
    e.preventDefault();
    setShopLoading(true);
    setShopMsg("");
    try {
      const res = await window.api.updateShop(shop);
      
      console.log('Shop update response:', res); // Debug log
      
      // ✅ Check for success in multiple ways
      if (res?.success === true || res?.changes > 0 || res?.id) {
        showModal("shop", "Shop Settings Saved", "Your shop profile has been synchronized successfully.");
        // Reload shop data to confirm changes
        await loadShop();
      } else if (res?.error) {
        setShopMsg(res.error);
        showModal("error", "Update Failed", res.error);
      } else {
        setShopMsg("No changes detected or update failed");
        showModal("error", "Update Failed", "No changes were detected or the update failed.");
      }
    } catch (err) {
      console.error('Shop update error:', err);
      setShopMsg(err.message || "Error updating shop");
      showModal("error", "Update Failed", err.message || "An error occurred while updating shop settings");
    } finally {
      setShopLoading(false);
    }
  };

  // ── BACKUP HANDLERS ─────────────────────────────────────────────────────────

  const handleCreateBackup = async () => {
    setBackupLoading(true);
    setBackupMsg("");
    try {
      const result = await window.api.createBackup();
      if (result.success) {
        setLastBackup(result.backup);
        showModal("backup", "Backup Created!", `Backup saved successfully: ${result.backup.filename}`);
      } else {
        setBackupMsg(result.error || "Failed to create backup");
        showModal("error", "Backup Failed", result.error || "An error occurred while creating backup");
      }
    } catch (err) {
      setBackupMsg("Error creating backup");
      showModal("error", "Backup Failed", err.message || "An error occurred");
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    try {
      setConfirmModal({
        isOpen: true,
        title: "Restore Database",
        message: "Are you sure you want to restore the database? This will replace the current database. An emergency backup will be created automatically.",
        onConfirm: async () => {
          setConfirmModal({ ...confirmModal, isOpen: false });
          
          try {
            setRestoreLoading(true);
            setBackupMsg("");
            
            const result = await window.api.selectBackupFile();
            
            if (result.canceled) {
              setRestoreLoading(false);
              return;
            }
            
            const restoreResult = await window.api.restoreBackup(result.filePath);
            
            if (restoreResult.success) {
              showModal("restore", "Restore Complete!", "Database restored successfully!");
            } else {
              showModal("error", "Restore Failed", restoreResult.error || "Failed to restore backup");
            }
          } catch (err) {
            showModal("error", "Restore Failed", err.message || "An error occurred");
          } finally {
            setRestoreLoading(false);
          }
        }
      });
    } catch (err) {
      showModal("error", "Restore Failed", err.message || "An error occurred");
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ── EYE ICON ────────────────────────────────────────────────────────────────
  const EyeIcon = ({ show }) => show
    ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
    : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;

  const inp = "w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all text-slate-800 text-xs";

  return (
    <>
      <SuccessModal modal={modal} onClose={closeModal} />
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />

      <div className="max-w-full mx-auto my-6 bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden text-xs text-slate-600 antialiased font-sans">

        {/* ── HEADER & TABS ── */}
        <div className="px-5 pt-4 pb-0 bg-slate-50 border-b border-slate-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1 text-white rounded-md shadow-sm" style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 2px 6px rgba(16,185,129,0.35)" }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="font-bold text-slate-900 tracking-tight text-sm">System Settings</h2>
          </div>
          <div className="flex gap-1 self-start sm:self-center">
            {[{ id: "profile", label: "Profile" }, { id: "shop", label: "Shop" }, { id: "backup", label: "Backup" }].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 -mb-[1px] ${activeTab === tab.id ? "border-emerald-600 text-emerald-600 bg-white font-bold" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gradient divider */}
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #10b981 30%, #3b82f6 70%, transparent)", opacity: 0.35 }} />

        {/* ── PANELS ── */}
        <div className="p-5 min-h-[280px]">

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="space-y-5" style={{ animation: "accFadeIn 0.2s ease" }}>

              {/* Account identity */}
              <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center pb-5 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Account Identity</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Your public administrator profile details.</p>
                </div>
                <div className="sm:col-span-2 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className={inp} />
                    <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className={inp} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-rose-500">{profileMsg}</span>
                    <button disabled={profileLoading} className="px-3 py-1.5 text-white font-medium rounded-md shadow-sm transition-all disabled:opacity-50 text-xs hover:-translate-y-px active:translate-y-0"
                      style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>
                      {profileLoading ? "Saving..." : "Update Identity"}
                    </button>
                  </div>
                </div>
              </form>

              {/* Password change */}
              <form onSubmit={handleChangePassword}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start transition-all"
                style={passShake ? { animation: "accShake 0.35s ease" } : {}}>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Security Key</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Keep your dashboard secure by updating your password.</p>
                </div>
                <div className="sm:col-span-2 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                    {/* Current */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Current</label>
                      <div className="relative">
                        <input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className={`${inp} pr-8`} />
                        <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Toggle visibility">
                          <EyeIcon show={showCurrent} />
                        </button>
                      </div>
                    </div>

                    {/* New */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">New password</label>
                      <div className="relative">
                        <input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className={`${inp} pr-8`} />
                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Toggle visibility">
                          <EyeIcon show={showNew} />
                        </button>
                      </div>
                      {newPassword && (
                        <div className="h-0.5 rounded-full bg-slate-100 overflow-hidden mt-0.5">
                          <div className="h-full rounded-full transition-all duration-300" style={{ width: strengthWidth, background: strengthColor }} />
                        </div>
                      )}
                    </div>

                    {/* Confirm */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Confirm</label>
                      <div className="relative">
                        <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password"
                          className={`${inp} pr-8 ${passwordsMatch ? "border-emerald-400 ring-2 ring-emerald-500/10" : passwordsMismatch ? "border-rose-400 ring-2 ring-rose-500/10" : ""}`} />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Toggle visibility">
                          <EyeIcon show={showConfirm} />
                        </button>
                      </div>
                      {confirmPassword && (
                        <span className={`text-[10px] font-semibold flex items-center gap-1 ${passwordsMatch ? "text-emerald-600" : "text-rose-500"}`}>
                          {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-rose-500">{passMsg}</span>
                    <button disabled={passLoading} className="px-3 py-1.5 text-white font-medium rounded-md shadow-sm transition-all disabled:opacity-50 text-xs hover:-translate-y-px active:translate-y-0"
                      style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 1px 4px rgba(16,185,129,0.3)" }}>
                      {passLoading ? "Authorizing..." : "Change Password"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* SHOP TAB */}
          {activeTab === "shop" && (
            <form onSubmit={handleShopUpdate} className="space-y-4" style={{ animation: "accFadeIn 0.2s ease" }}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Shop Identity", key: "shop_name", placeholder: "Shop Name" },
                  { label: "Phone Line", key: "phone", placeholder: "Contact Number" },
                  { label: "Email", key: "email", placeholder: "Email Address", type: "email" },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key} className="flex flex-col gap-0.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</label>
                    <input type={type || "text"} value={shop[key]} onChange={(e) => setShop({ ...shop, [key]: e.target.value })} placeholder={placeholder} className={inp} />
                  </div>
                ))}
                <div className="flex flex-col gap-0.5 select-none">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    System Currency <span className="text-[9px] text-slate-400 normal-case font-normal">(System Locked)</span>
                  </label>
                  <div className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-slate-500 font-semibold flex items-center justify-between cursor-not-allowed text-xs">
                    <span>{shop.currency || "PKR"}</span>
                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">GST Registry <span className="font-normal lowercase">(optional)</span></label>
                  <input value={shop.gst_number} onChange={(e) => setShop({ ...shop, gst_number: e.target.value })} placeholder="GST-ID (Optional)" className={inp} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">License Key <span className="font-normal lowercase">(optional)</span></label>
                  <input value={shop.license_number} onChange={(e) => setShop({ ...shop, license_number: e.target.value })} placeholder="License ID (Optional)" className={inp} />
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Physical Headquarters Address</label>
                <input value={shop.address} onChange={(e) => setShop({ ...shop, address: e.target.value })} placeholder="Full retail location address" className={inp} />
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[11px] font-medium italic text-slate-400">{shopMsg}</span>
                <button disabled={shopLoading} className="px-4 py-1.5 text-white font-medium rounded-md shadow-sm transition-all disabled:opacity-50 text-xs hover:-translate-y-px active:translate-y-0"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 1px 4px rgba(16,185,129,0.3)" }}>
                  {shopLoading ? "Synchronizing..." : "Save Settings"}
                </button>
              </div>
            </form>
          )}

          {/* ── BACKUP TAB ── */}
          {activeTab === "backup" && (
            <div style={{ animation: "accFadeIn 0.2s ease" }}>
              
              {/* Backup Stats */}
              {lastBackup && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-[10px] font-medium text-emerald-700">Last Backup</p>
                  <p className="text-xs text-emerald-600">{lastBackup.filename}</p>
                  <p className="text-[10px] text-emerald-500">
                    {formatDate(lastBackup.createdAt)} • {formatSize(lastBackup.size)}
                  </p>
                </div>
              )}

              {/* Backup Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <button
                  onClick={handleCreateBackup}
                  disabled={backupLoading}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-50 hover:-translate-y-px active:translate-y-0 text-xs"
                  style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  {backupLoading ? "Creating..." : "Create Backup"}
                </button>
                
                <button
                  onClick={handleRestoreBackup}
                  disabled={restoreLoading}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-50 hover:-translate-y-px active:translate-y-0 text-xs"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 2px 8px rgba(245,158,11,0.25)" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {restoreLoading ? "Restoring..." : "Restore Backup"}
                </button>
              </div>

              {/* Status Message */}
              {backupMsg && (
                <div className={`mb-4 px-3 py-2 rounded-lg text-xs ${backupMsg.includes('Error') || backupMsg.includes('Failed') ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                  {backupMsg}
                </div>
              )}

              {/* Info Card */}
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200/60 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-slate-200/60 rounded-lg text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-700">About Backups</h4>
                    <ul className="text-[10px] text-slate-500 space-y-0.5 mt-1">
                      <li>• Backups are saved as ZIP files in the application data folder</li>
                      <li>• Each backup contains your complete database (shop.db)</li>
                      <li>• Latest 30 backups are automatically retained</li>
                      <li>• Emergency backups are created automatically before restore</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <style>{`
          @keyframes accFadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes accShake {
            0%,100% { transform: translateX(0); }
            20%     { transform: translateX(-4px); }
            40%     { transform: translateX(4px); }
            60%     { transform: translateX(-3px); }
            80%     { transform: translateX(3px); }
          }
          @keyframes modalPop {
            from { opacity: 0; transform: scale(0.85) translateY(16px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes progressShrink {
            from { width: 100%; }
            to   { width: 0%; }
          }
        `}</style>
      </div>
    </>
  );
};

export default AdminControlCenter;