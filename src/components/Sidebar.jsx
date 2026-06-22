// src/components/Sidebar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Handshake, 
  ShoppingCart,
  Settings,
  User,
  LogOut
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout, user }) => {
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'expenses', label: 'Expenses', icon: CreditCard },
    { id: 'suppliers', label: 'Suppliers', icon: Handshake },
    { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
  ];

  // Close the settings popover if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-56 bg-[#0B251E] text-emerald-100 h-screen flex flex-col justify-between fixed top-0 left-0 border-r border-emerald-950/40 select-none font-sans">
      
      <div>
        {/* Top Header Section: Small & Sharp Branding */}
        <div className="p-4 flex items-center gap-2.5 border-b border-emerald-900/10">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-sm shadow-md shadow-emerald-500/10">
            🌱
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-tight leading-none">Pesticide managment</h2>
            <span className="text-[9px] text-emerald-400 font-bold tracking-wider uppercase">Shop Manager</span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="p-2 space-y-0.5 mt-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const IconComponent = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setShowSettings(false); // Close settings panel when shifting views
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 group ${
                  isActive
                    ? 'bg-emerald-800/60 text-white shadow-sm shadow-emerald-950/20'
                    : 'hover:bg-emerald-900/30 hover:text-white text-emerald-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <IconComponent 
                    size={15} 
                    className={`transition-colors stroke-[2.2] ${
                      isActive ? 'text-emerald-400' : 'text-emerald-300/40 group-hover:text-emerald-200'
                    }`} 
                  />
                  <span>{item.label}</span>
                </div>
                
                {isActive && (
                  <span className="w-1 h-1 bg-emerald-400 rounded-full shadow-[0_0_6px_#34d399]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Section with Interactive Actions Popover */}
      <div className="p-3 border-t border-emerald-900/10 bg-black/10 relative" ref={settingsRef}>
        
        {/* Settings Mini Context Panel */}
        {showSettings && (
          <div className="absolute bottom-[60px] left-3 right-3 bg-[#113129] border border-emerald-800/40 rounded-xl p-1.5 shadow-xl animate-fade-in space-y-0.5 z-50">
            <button 
              onClick={() => {
                setActiveTab('profile');
                setShowSettings(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:text-white hover:bg-emerald-800/40 rounded-lg transition-colors font-medium"
            >
              <User size={14} className="text-emerald-400 stroke-[2.2]" />
              Profile Settings
            </button>
            <button 
              onClick={() => {
                setShowSettings(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-950/30 rounded-lg transition-colors font-medium"
            >
              <LogOut size={14} className="stroke-[2.2]" />
              Sign Out Account
            </button>
          </div>
        )}

        {/* Profile / Settings Trigger Bar */}
        <div 
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center justify-between p-1.5 hover:bg-emerald-900/30 rounded-xl cursor-pointer transition-colors duration-150 group"
        >
          <div className="truncate pr-2">
            <p className="text-[11px] font-bold text-white truncate leading-tight">{user?.fullName || 'Shop Admin'}</p>
            <p className="text-[9px] text-emerald-400 font-medium truncate mt-0.5">@{user?.username || 'admin'}</p>
          </div>
          <div className="p-1.5 text-emerald-300 group-hover:text-white transition-colors">
            <Settings size={14} className={`stroke-[2.2] transition-transform duration-300 ${showSettings ? 'rotate-45' : ''}`} />
          </div>
        </div>

        <div className="text-[9px] text-emerald-800 font-bold tracking-wider text-center pt-2 mt-1.5 border-t border-emerald-900/5">
          V1.0.0 · AGRIMANAGE
        </div>
      </div>

    </div>
  );
};

export default Sidebar;