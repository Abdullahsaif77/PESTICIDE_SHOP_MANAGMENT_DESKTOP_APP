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
  LogOut,
   Warehouse
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout, user }) => {
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);

 const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'warehouses', label: 'Warehouses', icon: Warehouse },
    { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
    { id: 'suppliers', label: 'Suppliers', icon: Handshake },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'expenses', label: 'Expenses', icon: CreditCard },
];

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
    <div className="w-56 bg-[#0B251E] text-emerald-100 h-screen flex flex-col justify-between fixed top-0 left-0 border-r border-emerald-950/40">

      {/* HEADER */}
      <div>
        <div className="p-4 flex items-center gap-2.5 border-b border-emerald-900/10">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
            🌱
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white">Pesticide Management</h2>
            <span className="text-[9px] text-emerald-400">Shop Manager</span>
          </div>
        </div>

        {/* MENU */}
        <nav className="p-2 space-y-1 mt-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                  isActive
                    ? 'bg-emerald-800/60 text-white'
                    : 'text-emerald-200/60 hover:bg-emerald-900/30 hover:text-white'
                }`}
              >
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* FOOTER */}
      <div className="p-3 relative" ref={settingsRef}>

        {showSettings && (
          <div className="absolute bottom-[60px] left-3 right-3 bg-[#113129] rounded-xl p-2 space-y-1">
            <button
              onClick={() => {
                setActiveTab('Admin Control Center');
                setShowSettings(false);
              }}
              className="flex items-center gap-2 text-xs text-white hover:bg-emerald-800/40 p-2 rounded"
            >
              <User size={14} />
              Admin Control Center
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-xs text-red-300 hover:bg-red-900/30 p-2 rounded"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}

        <div
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center justify-between cursor-pointer"
        >
          <div>
            <p className="text-xs text-white">{user?.fullName}</p>
            <p className="text-[10px] text-emerald-400">@{user?.username}</p>
          </div>
          <Settings size={14} />
        </div>

        <div className="text-[9px] text-emerald-800 mt-2 text-center">
          V1.0.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;