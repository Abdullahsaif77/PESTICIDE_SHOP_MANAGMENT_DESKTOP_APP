import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLoginSuccess, user }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


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
      // 🔌 Send credentials to Electron backend (main process via bridge)
      const response = await window.api.login({ username, password });
      
      if (response.success) {
        // Update state in App.jsx
        onLoginSuccess(response.user);
        // 🚀 Navigate immediately to dashboard screen
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

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-slate-100 font-sans px-4 overflow-hidden">
      
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
        .animate-drift-slow { animation: drift 14s infinite ease-in-out; }
        .animate-drift-fast { animation: drift 8s infinite ease-in-out; }
        .animate-grid-slide { animation: crossSlide 15s infinite alternate ease-in-out; }
      `}</style>

      {/* Background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1.5px,transparent_1.5px),linear-gradient(to_bottom,#cbd5e1_1.5px,transparent_1.5px)] bg-[size:5rem_5rem] opacity-60 animate-grid-slide" />
        <div className="absolute top-[15%] left-[10%] w-32 h-32 rounded-full border-4 border-emerald-400 border-dashed opacity-80 animate-drift-slow" />
        <div className="absolute bottom-[20%] right-[10%] w-40 h-40 rounded-full border-2 border-teal-500 bg-teal-100/50 opacity-90 animate-drift-fast" />
        <div className="absolute top-[-5%] right-[5%] w-[30rem] h-[30rem] bg-emerald-200/50 rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] left-[2%] w-[30rem] h-[30rem] bg-teal-200/40 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl border-2 border-slate-200">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Shop Management System</h2>
          <p className="text-sm text-slate-600 font-medium mt-1.5">Sign in to manage inventory & sales</p>
        </div>

        {error && (
          <div className="p-3 mb-5 text-sm font-semibold text-red-800 bg-red-100 border-2 border-red-200 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-bold text-slate-800 mb-1.5">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-4 py-2.5 border-2 border-slate-300 bg-slate-50 text-slate-900 font-medium rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
              disabled={loading}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-slate-800 mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2.5 border-2 border-slate-300 bg-slate-50 text-slate-900 font-medium rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full mt-2 py-3 px-4 text-sm font-bold text-white rounded-xl shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 ${
              loading 
                ? 'bg-gradient-to-r from-emerald-400 to-teal-400 cursor-not-allowed opacity-70' 
                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-[size:200%_auto] hover:bg-right active:scale-[0.99] shadow-emerald-600/30 font-extrabold tracking-wide'
            }`}
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;