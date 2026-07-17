// src/pages/Reports/PurchaseReport.jsx

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, DollarSign, Box, Package,
  ArrowLeft, RefreshCw, Loader2, Calendar,
  Search, X, ChevronLeft, ChevronRight
} from 'lucide-react';

const api = window.api || {};

export default function PurchaseReport({ setActiveTab }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ 
    summary: { 
      total_purchases: 0, 
      total_quantity: 0, 
      total_cost: 0 
    }, 
    items: [] 
  });
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    search: '',
    supplier: '',
    warehouse: ''
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    loadData();
  }, [filters, pagination.current]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('📊 Loading purchase report with filters:', filters);
      
      const result = await api.getPurchaseReport({
        ...filters,
        page: pagination.current,
        pageSize: pagination.pageSize
      });
      
      console.log('📊 Purchase report result:', result);
      
      if (result && result.success) {
        setData(result.data);
        setPagination(prev => ({ 
          ...prev, 
          total: result.data?.total || result.data?.items?.length || 0 
        }));
      } else {
        setData({ 
          summary: { 
            total_purchases: 0, 
            total_quantity: 0, 
            total_cost: 0 
          }, 
          items: [] 
        });
      }
    } catch (error) {
      console.error('Error loading purchase report:', error);
      setData({ 
        summary: { 
          total_purchases: 0, 
          total_quantity: 0, 
          total_cost: 0 
        }, 
        items: [] 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (setActiveTab) {
      setActiveTab('reports');
    }
  };

  const handleDateChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      search: '',
      supplier: '',
      warehouse: ''
    });
    setPagination({ ...pagination, current: 1 });
  };

  const summary = data.summary || {};
  const items = data.items || [];

  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '₨0.00';
    }
    return `₨${Number(value).toFixed(2)}`;
  };

  const formatNumber = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    return Number(value).toFixed(0);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100/50 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-sm">Loading purchase report...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100/50 min-h-screen">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-all duration-200 group"
            title="Go Back"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-blue-500 bg-clip-text text-transparent">
              Purchase Report
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <ShoppingCart size={12} />
              Track purchase history and costs
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary Cards - All 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <SummaryCard 
          icon={DollarSign} 
          label="Total Purchases" 
          value={formatCurrency(summary.total_purchases || summary.totalPurchases || 0)} 
          color="text-blue-600" 
          bgColor="bg-blue-50" 
          subtitle="Total amount spent on purchases"
        />
        <SummaryCard 
          icon={Box} 
          label="Total Quantity" 
          value={formatNumber(summary.total_quantity || summary.totalQuantity || 0)} 
          color="text-amber-600" 
          bgColor="bg-amber-50"
          subtitle="Total items purchased"
        />
        <SummaryCard 
          icon={Package} 
          label="Total Cost" 
          value={formatCurrency(summary.total_cost || summary.totalCost || 0)} 
          color="text-purple-600" 
          bgColor="bg-purple-50"
          subtitle="Cost of goods (purchase price × quantity)"
        />
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm p-3 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400" />
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Date Range</label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
            />
          </div>
          <div className="flex items-center gap-2 ml-0 sm:ml-auto">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-8 pr-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white w-32"
              />
            </div>
            <button
              onClick={handleResetFilters}
              className="px-2 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Purchase #</th>
                <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Supplier</th>
                <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Warehouse</th>
                <th className="px-3 py-2.5 text-center text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Quantity</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No purchase records found
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-[10px] text-slate-600">
                      {item.purchase_number || item.purchase_id || '-'}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">
                      {item.date ? new Date(item.date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">
                      {item.supplier || '-'}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">
                      {item.warehouse || '-'}
                    </td>
                    <td className="px-3 py-2.5 text-center text-slate-600">
                      {item.items || 0}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-600">
                      {formatNumber(item.quantity || 0)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-slate-700">
                      {formatCurrency(item.amount || 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total > pagination.pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <div className="text-[10px] text-slate-400">
              Showing {pagination.current * pagination.pageSize - pagination.pageSize + 1} to{' '}
              {Math.min(pagination.current * pagination.pageSize, pagination.total)} of {pagination.total} entries
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
                disabled={pagination.current === 1}
                className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-2 py-1 text-[10px] text-slate-600">
                {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
                disabled={pagination.current * pagination.pageSize >= pagination.total}
                className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const SummaryCard = ({ icon: Icon, label, value, color, bgColor, subtitle }) => (
  <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${bgColor}`}>
        <Icon size={16} className={color} />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
        {subtitle && (
          <p className="text-[8px] text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
);