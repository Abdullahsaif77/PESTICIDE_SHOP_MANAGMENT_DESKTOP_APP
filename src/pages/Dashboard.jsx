// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  // State tracking which dashboard sub-view is rendered on the right panel
  const [activeTab, setActiveTab] = useState('dashboard');

  // Protection layer: Safeguard content against unauthorized guests
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleSignOut = () => {
    onLogout();
    navigate('/login');
  };

  // Helper dynamic function to render matching child screens inside view box
  const renderPanelContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[70vh] flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 text-2xl font-bold mx-auto mb-4 border border-emerald-100">
                ✓
              </div>
              <h3 className="text-lg font-bold text-slate-800">Overview Panel Ready</h3>
              <p className="text-sm text-slate-500 mt-1">
                Your analytics workspace is loaded. Next up, we can compile your dynamic P&L statistical metric summaries here!
              </p>
            </div>
          </div>
        );
      case 'products':
        return <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-700">Products Content Screen Placeholder</div>;
      case 'inventory':
        return <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-700">Inventory Stock Tracking Placeholder</div>;
      case 'sales':
        return <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-700">Sales Transactions Register Placeholder</div>;
      default:
        return <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-700">Component Panel Coming Soon</div>;
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-900 font-sans antialiased">
      
      {/* 1. Left Fixed Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleSignOut} 
        user={user}
      />

      {/* 2. Right Workspace (Shifted right by pl-64 to clear the sidebar layout) */}
      <div className="flex-1 pl-64 flex flex-col">
        
        {/* Dynamic Top Header Bar matching context titles */}
        <header className="flex justify-between items-center bg-white px-8 py-5 border-b border-slate-200/80 sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 capitalize tracking-tight">
              {activeTab === 'dashboard' ? 'Overview Dashboard' : activeTab}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Overview of your shop performance and data insights.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 px-4 rounded-xl">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-slate-700 tracking-wide">
              Live Database Connected
            </span>
          </div>
        </header>

        {/* 3. Render Area Component View Window */}
        <main className="p-8 flex-1 overflow-y-auto">
          {renderPanelContent()}
        </main>

      </div>
    </div>
  );
};

export default Dashboard;