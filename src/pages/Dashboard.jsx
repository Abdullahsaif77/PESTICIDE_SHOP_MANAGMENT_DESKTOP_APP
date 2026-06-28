import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Profile from '../components/Profile';
import Products from '../components/Products';
import Warehouses from "../components/WareHouse"

const Dashboard = ({ user, onLogout, onUserUpdate }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const handleSignOut = () => {
    onLogout();
    navigate('/login');
  };

  const renderPanelContent = () => {
    switch (activeTab) {

      case 'dashboard':
        return (
          <div className="bg-white p-6 rounded-2xl">
            <h2 className="text-lg font-bold">Overview Dashboard</h2>
            <p className="text-sm text-slate-500">Analytics ready</p>
          </div>
        );

      case 'products':
        return (<Products/>)

      case 'inventory':
        return <div className="bg-white p-6 rounded-2xl">Inventory</div>;

      case 'sales':
        return <div className="bg-white p-6 rounded-2xl">Sales</div>;
      case 'warehouses':
        return <Warehouses/>

      case 'Admin Control Center':
        return (
          <Profile
            user={user}
            onUserUpdate={onUserUpdate}
          />
        );

      default:
        return <div className="bg-white p-6 rounded-2xl">Coming Soon</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleSignOut}
        user={user}
      />

      <div className="flex-1 pl-64">

        <header className="bg-white p-4 border-b">
          <h1 className="text-xl font-bold capitalize">
            {activeTab}
          </h1>
        </header>

        <main className="p-6">
          {renderPanelContent()}
        </main>

      </div>
    </div>
  );
};

export default Dashboard;