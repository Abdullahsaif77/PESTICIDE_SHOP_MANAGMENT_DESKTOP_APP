// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Profile from '../components/Profile';
import Products from '../components/Products';
import Warehouses from "../components/WareHouse";
import Inventory from '../components/Inventory';
import Suppliers from '../components/Supplier';
import Customers from '../components/Customer';
import Purchases from '../components/Purchase';
import Sales from '../components/Sales';
import Ledger from '../components/Ledger';
import Expenses from '../components/Expenses';
import DashboardStats from '../components/DashboardStats';
import ProductReturn from '../components/ProductReturn';

// ===== REPORTS IMPORTS =====
import Reports from "../components/Reports"
import SalesReport from "../components/ReportsComponents/SalesReport"
import PurchaseReport from '../components/ReportsComponents/PurchaseReport';
import ProfitLossReport from '../components/ReportsComponents/ProfitLossReport';
import InventoryReport from '../components/ReportsComponents/InventoryReport';
import LowStockReport from '../components/ReportsComponents/LowStockReport';
import ExpiryReport from '../components/ReportsComponents/ExpiryReport';
import CustomerLedgerReport from '../components/ReportsComponents/CustomerLedgerReport';
import SupplierLedgerReport from '../components/ReportsComponents/SupplierLedgerReport';
import ExpenseReport from '../components/ReportsComponents/ExpenseReport';
import WarehouseReport from '../components/ReportsComponents/WarehouseReport';

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
        return <DashboardStats setActiveTab={setActiveTab} />;

      case 'products':
        return <Products />;

      case 'returns':
        return <ProductReturn />;

      case 'inventory':
        return <Inventory />;

      case 'purchases':
        return <Purchases />;

      case 'suppliers':
        return <Suppliers />;

      case 'sales':
        return <Sales />;

      case 'customers':
        return <Customers />;

      case 'ledger':
        return <Ledger />;

      case 'warehouses':
        return <Warehouses />;

      case 'expenses':
        return <Expenses />;

      // ===== REPORTS CASES =====
      case 'reports':
        return <Reports setActiveTab={setActiveTab} />;

      case 'reports-sales':
        return <SalesReport />;

      case 'reports-purchases':
        return <PurchaseReport />;

      case 'reports-profit-loss':
        return <ProfitLossReport />;

      case 'reports-inventory':
        return <InventoryReport />;

      case 'reports-low-stock':
        return <LowStockReport />;

      case 'reports-expiry':
        return <ExpiryReport />;

      case 'reports-customer-ledger':
        return <CustomerLedgerReport />;

      case 'reports-supplier-ledger':
        return <SupplierLedgerReport />;

      case 'reports-expenses':
        return <ExpenseReport />;

      case 'reports-warehouse':
        return <WarehouseReport />;

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
            {activeTab === 'Admin Control Center' ? 'Profile' : activeTab.replace('reports-', '')}
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