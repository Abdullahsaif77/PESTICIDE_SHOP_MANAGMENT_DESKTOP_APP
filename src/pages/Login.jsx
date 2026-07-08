import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/logo.png";

const Login = ({ onLoginSuccess, user }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shopSettings, setShopSettings] = useState(null);

  // Fetch shop settings on component mount
  useEffect(() => {
    const fetchShopSettings = async () => {
      try {
        const result = await window.api.getShop();
        console.log('📦 Shop settings for login:', result);
        
        if (result && typeof result === 'object') {
          if (result.success && result.data) {
            setShopSettings(result.data);
          } else if (result.id || result.shop_name) {
            setShopSettings(result);
          } else if (result.error) {
            console.error('Error fetching shop:', result.error);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching shop settings:', error);
      }
    };

    fetchShopSettings();
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await window.api.login({ username, password });
      
      if (response.success) {
        onLoginSuccess(response.user);
        navigate('/dashboard');
      } else {
        setError(response.error || 'Invalid credentials.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get shop name with fallback
  const getShopName = () => {
    return shopSettings?.shop_name || 'Pesticide Shop';
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#0B251E] font-sans px-4 overflow-hidden">
      
      <style>{`
        @keyframes drift {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          50% { transform: translateY(-40px) translateX(30px) rotate(180deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(360deg); }
        }
        @keyframes crossSlide {
          0% { transform: translateX(-5%) translateY(-5%); }
          100% { transform: translateX(5%) translateY(5%); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-drift-slow { animation: drift 14s infinite ease-in-out; }
        .animate-drift-fast { animation: drift 8s infinite ease-in-out; }
        .animate-grid-slide { animation: crossSlide 15s infinite alternate ease-in-out; }
        .animate-pulse-slow { animation: pulse 3s infinite ease-in-out; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-shimmer {
          background: linear-gradient(90deg, 
            rgba(255,255,255,0) 0%, 
            rgba(255,255,255,0.1) 50%, 
            rgba(255,255,255,0) 100%
          );
          background-size: 200% auto;
          animation: shimmer 3s infinite;
        }
      `}</style>

      {/* Background elements with dark green theme */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a3a30_1px,transparent_1px),linear-gradient(to_bottom,#1a3a30_1px,transparent_1px)] bg-[size:5rem_5rem] opacity-30 animate-grid-slide" />
        
        {/* Decorative circles with emerald theme */}
        <div className="absolute top-[15%] left-[10%] w-32 h-32 rounded-full border-4 border-emerald-500/20 border-dashed opacity-60 animate-drift-slow" />
        <div className="absolute bottom-[20%] right-[10%] w-40 h-40 rounded-full border-2 border-emerald-400/20 bg-emerald-500/10 opacity-70 animate-drift-fast" />
        <div className="absolute top-[-5%] right-[5%] w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] left-[2%] w-[30rem] h-[30rem] bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute top-[30%] right-[15%] w-24 h-24 rounded-full bg-emerald-400/10 blur-2xl animate-drift-slow" />
        <div className="absolute bottom-[35%] left-[20%] w-32 h-32 rounded-full bg-teal-400/10 blur-2xl animate-drift-fast" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-500/20">
        
        {/* Logo and Shop Name - Without Box */}
        <div className="flex flex-col items-center mb-8">
          {/* Logo - Prominent and floating */}
          <div className="relative animate-float">
            <img 
              src={logo} 
              alt="Shop Logo" 
              className="w-28 h-28 object-contain drop-shadow-2xl"
            />
            {/* Glow effect behind logo */}
            <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-2xl -z-10" />
            <div className="absolute -inset-8 bg-emerald-400/10 rounded-full blur-3xl -z-20" />
          </div>

          {/* Shop Name */}
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-lg">
              {getShopName()}
            </h2>
            {shopSettings?.license_number && (
              <p className="text-xs text-emerald-300 font-medium mt-1">
                Lic: {shopSettings.license_number}
              </p>
            )}
            {shopSettings?.address && (
              <p className="text-[11px] text-emerald-200/70 mt-1 truncate max-w-xs">
                {shopSettings.address}
              </p>
            )}
          </div>
          
          {/* Divider */}
          <div className="w-20 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mt-4" />
          
          <p className="text-sm text-emerald-200/80 font-medium mt-3">
            Sign in to manage inventory & sales
          </p>
        </div>

        {error && (
          <div className="p-3 mb-5 text-sm font-semibold text-red-200 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-300 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-bold text-emerald-200 mb-1.5">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-4 py-2.5 border border-emerald-500/30 bg-white/10 text-white font-medium rounded-xl shadow-sm placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all backdrop-blur-sm"
              disabled={loading}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-emerald-200 mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2.5 border border-emerald-500/30 bg-white/10 text-white font-medium rounded-xl shadow-sm placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all backdrop-blur-sm"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full mt-2 py-3 px-4 text-sm font-bold text-white rounded-xl shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 relative overflow-hidden ${
              loading 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 cursor-not-allowed opacity-70' 
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[size:200%_auto] hover:bg-right active:scale-[0.99] shadow-emerald-500/30 font-extrabold tracking-wide hover:shadow-emerald-500/50'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </span>
            ) : 'Login'}
          </button>

          {/* Footer info */}
          <div className="text-center mt-4">
            {(shopSettings?.email || shopSettings?.phone) && (
              <p className="text-[11px] text-emerald-300/70">
                {shopSettings?.email && `📧 ${shopSettings.email}`}
                {shopSettings?.phone && shopSettings?.email && ' | '}
                {shopSettings?.phone && `📞 ${shopSettings.phone}`}
              </p>
            )}
            <p className="text-[9px] text-emerald-400/50 mt-2">
              Version 1.0.0
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;