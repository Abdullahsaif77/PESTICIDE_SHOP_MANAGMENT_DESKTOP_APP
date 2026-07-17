// src/pages/Reports/InventoryReport.jsx

import React, { useState, useEffect } from 'react';
import {
  Package, Box, DollarSign, TrendingUp,
  AlertCircle, CheckCircle, Calculator,
  ArrowLeft, RefreshCw, Loader2, Search, X,
  ChevronLeft, ChevronRight
} from 'lucide-react';

const api = window.api || {};

export default function InventoryReport({ setActiveTab }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ 
    summary: { 
      total_stock: 0, 
      stock_value: 0, 
      avg_cost: 0, 
      selling_value: 0 
    }, 
    items: [] 
  });
  const [filters, setFilters] = useState({
    search: '',
    warehouse: '',
    status: ''
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    loadData();
  }, [filters, pagination.current]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('📊 Loading inventory report with filters:', filters);
      
      const result = await api.getInventoryReport({
        ...filters,
        page: pagination.current,
        pageSize: pagination.pageSize
      });
      
      console.log('📊 Inventory report result:', result);
      
      if (result && result.success) {
        setData(result.data);
        setPagination(prev => ({ 
          ...prev, 
          total: result.data?.total || result.data?.items?.length || 0 
        }));
      } else {
        setData({ 
          summary: { 
            total_stock: 0, 
            stock_value: 0, 
            avg_cost: 0, 
            selling_value: 0 
          }, 
          items: [] 
        });
      }
    } catch (error) {
      console.error('Error loading inventory report:', error);
      setData({ 
        summary: { 
          total_stock: 0, 
          stock_value: 0, 
          avg_cost: 0, 
          selling_value: 0 
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

  const handleResetFilters = () => {
    setFilters({ search: '', warehouse: '', status: '' });
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

  const getStatusBadge = (status) => {
    const configs = {
      'In Stock': { color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle },
      'Low Stock': { color: 'bg-amber-50 text-amber-600 border-amber-200', icon: AlertCircle },
      'Out of Stock': { color: 'bg-red-50 text-red-600 border-red-200', icon: AlertCircle }
    };
    const config = configs[status] || configs['In Stock'];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${config.color}`}>
        <Icon size={10} />
        {status}
      </span>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100/50 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-sm">Loading inventory report...</span>
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-amber-700 to-amber-500 bg-clip-text text-transparent">
              Inventory Report
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Package size={12} />
              Current stock, value, and profit potential
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <SummaryCard 
          icon={Box} 
          label="Current Stock" 
          value={formatNumber(summary.total_stock || summary.totalStock || 0)} 
          color="text-sky-600" 
          bgColor="bg-sky-50" 
        />
        <SummaryCard 
          icon={DollarSign} 
          label="Stock Value" 
          value={formatCurrency(summary.stock_value || summary.stockValue || 0)} 
          color="text-emerald-600" 
          bgColor="bg-emerald-50" 
        />
        <SummaryCard 
          icon={Calculator} 
          label="Average Cost" 
          value={formatCurrency(summary.avg_cost || summary.avgCost || 0)} 
          color="text-amber-600" 
          bgColor="bg-amber-50" 
        />
        <SummaryCard 
          icon={TrendingUp} 
          label="Selling Value" 
          value={formatCurrency(summary.selling_value || summary.sellingValue || 0)} 
          color="text-purple-600" 
          bgColor="bg-purple-50" 
        />
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm p-3 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-slate-400" />
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Search</label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white w-40"
            />
          </div>
          <div className="flex items-center gap-2 ml-0 sm:ml-auto">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 bg-white"
            >
              <option value="">All Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
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
            <thead className="bg-gradient-to-r from-slate-50 to-amber-50/30 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Warehouse</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Purchase Price</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Selling Price</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Stock Value</th>
                <th className="px-3 py-2.5 text-center text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No inventory records found
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-2.5 font-medium text-slate-700">
                      {item.product || '-'}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[10px] text-slate-500">
                      {item.sku || item.code || '-'}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">
                      {item.warehouse || '-'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-slate-700">
                      {formatNumber(item.stock || 0)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-600">
                      {formatCurrency(item.purchase_price || 0)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-600">
                      {formatCurrency(item.selling_price || item.sale_price || 0)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-emerald-600">
                      {formatCurrency(item.stock_value || 0)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {getStatusBadge(item.status || 'In Stock')}
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

const SummaryCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${bgColor}`}>
        <Icon size={16} className={color} />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  </div>
);