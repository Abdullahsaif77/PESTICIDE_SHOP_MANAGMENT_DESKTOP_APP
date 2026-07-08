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
  Warehouse,
  BookOpen,
  RefreshCw,
  Store,
  AlertCircle,
  FileText
} from 'lucide-react';
import logo from "../assets/logo.png";

const Sidebar = ({ activeTab, setActiveTab, onLogout, user }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [shopSettings, setShopSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const settingsRef = useRef(null);

  const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales', icon: TrendingUp },
  { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
  { id: 'suppliers', label: 'Suppliers', icon: Handshake },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'warehouses', label: 'Warehouses', icon: Warehouse },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'ledger', label: 'Ledger (Khata)', icon: BookOpen },
  { id: 'expenses', label: 'Expenses', icon: CreditCard },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'returns', label: 'Returns', icon: RefreshCw },
];

  // Fetch shop settings
  useEffect(() => {
    const fetchShopSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching shop settings...');
        const result = await window.api.getShop();
        
        console.log('📦 Shop settings response:', result);
        
        if (result && typeof result === 'object') {
          if (result.success && result.data) {
            setShopSettings(result.data);
          } else if (result.id || result.shop_name) {
            setShopSettings(result);
          } else if (result.error) {
            setError(result.error);
            console.error('❌ Error in response:', result.error);
          } else if (!result) {
            setError('No shop settings found');
            await createDefaultShop();
          }
        } else {
          setError('Invalid response format');
        }
      } catch (error) {
        console.error('❌ Error fetching shop settings:', error);
        setError(error.message || 'Failed to load shop settings');
        await createDefaultShop();
      } finally {
        setLoading(false);
      }
    };

    const createDefaultShop = async () => {
      try {
        console.log('🔄 Creating default shop...');
        const defaultData = {
          shop_name: 'My Pesticide Shop',
          address: '123 Main Street, City',
          phone: '555-0123',
          email: 'shop@example.com',
          license_number: 'LIC-001',
          gst_number: 'GST-001',
          currency: 'USD'
        };
        
        const result = await window.api.createShop(defaultData);
        console.log('📦 Create shop response:', result);
        
        if (result && result.success) {
          setShopSettings(result.data || defaultData);
          setError(null);
        } else if (result && result.id) {
          setShopSettings(result);
          setError(null);
        } else {
          setShopSettings(defaultData);
        }
      } catch (err) {
        console.error('❌ Failed to create default shop:', err);
        setShopSettings({
          shop_name: 'My Pesticide Shop',
          address: '123 Main Street, City',
          phone: '555-0123',
          email: 'shop@example.com',
          license_number: 'LIC-001',
          gst_number: 'GST-001',
          currency: 'USD'
        });
      }
    };

    fetchShopSettings();
  }, []);

  // Handle click outside settings dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get shop name with fallback
  const getShopName = () => {
    if (loading) return 'Loading...';
    if (error) return 'Shop Settings Error';
    return shopSettings?.shop_name || 'Pesticide Shop';
  };

  // Get license number with fallback
  const getLicenseNumber = () => {
    if (loading) return 'Loading...';
    if (error) return '⚠️ Error';
    return shopSettings?.license_number ? `Lic: ${shopSettings.license_number}` : 'Shop Manager';
  };

  return (
    <div className="w-56 bg-[#0B251E] text-emerald-100 h-screen flex flex-col justify-between fixed top-0 left-0 border-r border-emerald-950/40">

      {/* HEADER */}
      <div>
        <div className="p-4 flex flex-col items-center gap-3 border-b border-emerald-900/10">
          {/* Logo - No box, larger and prominent with glow effect */}
          <div className="relative">
            <img 
              src={logo} 
              alt="Shop Logo" 
              className="w-24 h-24 object-contain drop-shadow-2xl animate-float"
            />
            {/* Glow effect behind logo */}
            <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-2xl -z-10" />
            <div className="absolute -inset-8 bg-emerald-400/10 rounded-full blur-3xl -z-20" />
          </div>
          
          <div className="text-center w-full">
            <h2 className="text-sm font-extrabold text-white truncate drop-shadow-lg">
              {getShopName()}
            </h2>
            <div className="flex items-center justify-center gap-1">
              <span className="text-[9px] text-emerald-400">
                {getLicenseNumber()}
              </span>
              {error && (
                <AlertCircle size={10} className="text-amber-400" />
              )}
            </div>
            {error && (
              <div className="text-[8px] text-amber-400 mt-0.5">
                {error}
              </div>
            )}
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
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-800/60 text-white shadow-lg shadow-emerald-900/20'
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
          <div className="absolute bottom-[60px] left-3 right-3 bg-[#113129] rounded-xl p-2 space-y-1 border border-emerald-800/30 shadow-xl">
            <button
              onClick={() => {
                setActiveTab('Admin Control Center');
                setShowSettings(false);
              }}
              className="flex items-center gap-2 text-xs text-white hover:bg-emerald-800/40 p-2 rounded transition-colors w-full"
            >
              <User size={14} />
              Admin Control Center
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-xs text-red-300 hover:bg-red-900/30 p-2 rounded transition-colors w-full"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}

        <div
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center justify-between cursor-pointer hover:bg-emerald-900/20 p-2 rounded-lg transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white truncate">{user?.fullName || 'User'}</p>
            <p className="text-[10px] text-emerald-400">@{user?.username || 'user'}</p>
          </div>
          <Settings size={14} className="text-emerald-400/60 hover:text-emerald-300 transition-colors" />
        </div>

        <div className="text-[9px] text-emerald-800 mt-2 text-center">
          V1.0.0
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;