// src/pages/Reports/WarehouseReport.jsx

import React, { useState, useEffect } from 'react';
import {
  Warehouse, Package, Box, TrendingUp, TrendingDown, DollarSign,
  ArrowLeft, RefreshCw, Loader2, Search, ChevronLeft, ChevronRight
} from 'lucide-react';

const api = window.api || {};

export default function WarehouseReport({ setActiveTab }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ 
    summary: { 
      total_warehouses: 0, 
      total_products: 0, 
      total_quantity: 0, 
      inventory_value: 0 
    }, 
    items: [] 
  });
  const [filters, setFilters] = useState({ search: '' });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    loadData();
  }, [filters, pagination.current]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('📊 Loading warehouse report with filters:', filters);
      
      const result = await api.getWarehouseReport({
        ...filters,
        page: pagination.current,
        pageSize: pagination.pageSize
      });
      
      console.log('📊 Warehouse report result:', result);
      
      if (result && result.success) {
        setData(result.data);
        setPagination(prev => ({ 
          ...prev, 
          total: result.data?.total || result.data?.items?.length || 0 
        }));
      } else {
        setData({ 
          summary: { 
            total_warehouses: 0, 
            total_products: 0, 
            total_quantity: 0, 
            inventory_value: 0 
          }, 
          items: [] 
        });
      }
    } catch (error) {
      console.error('Error loading warehouse report:', error);
      setData({ 
        summary: { 
          total_warehouses: 0, 
          total_products: 0, 
          total_quantity: 0, 
          inventory_value: 0 
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
    setFilters({ search: '' });
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
          <span className="text-sm">Loading warehouse report...</span>
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-cyan-700 to-cyan-500 bg-clip-text text-transparent">
              Warehouse Report
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Warehouse size={12} />
              Stock distribution across warehouses
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <SummaryCard 
          icon={Warehouse} 
          label="Total Warehouses" 
          value={formatNumber(summary.total_warehouses || summary.totalWarehouses || 0)} 
          color="text-cyan-600" 
          bgColor="bg-cyan-50" 
        />
        <SummaryCard 
          icon={Package} 
          label="Total Products" 
          value={formatNumber(summary.total_products || summary.totalProducts || 0)} 
          color="text-sky-600" 
          bgColor="bg-sky-50" 
        />
        <SummaryCard 
          icon={Box} 
          label="Total Quantity" 
          value={formatNumber(summary.total_quantity || summary.totalQuantity || 0)} 
          color="text-amber-600" 
          bgColor="bg-amber-50" 
        />
        <SummaryCard 
          icon={DollarSign} 
          label="Inventory Value" 
          value={formatCurrency(summary.inventory_value || summary.inventoryValue || 0)} 
          color="text-emerald-600" 
          bgColor="bg-emerald-50" 
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
              placeholder="Search warehouses..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 bg-white w-40"
            />
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
            <thead className="bg-gradient-to-r from-slate-50 to-cyan-50/30 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Warehouse</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Products Stored</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Quantity</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Inventory Value</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Incoming</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Outgoing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No warehouse records found
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-2.5 font-medium text-slate-700">
                      {item.warehouse || '-'}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-600">
                      {formatNumber(item.products || 0)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-600">
                      {formatNumber(item.total_qty || item.totalQuantity || 0)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-emerald-600">
                      {formatCurrency(item.inventory_value || item.inventoryValue || 0)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-green-600">
                      {formatNumber(item.incoming || 0)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-red-600">
                      {formatNumber(item.outgoing || 0)}
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

      {/* Summary Footer */}
      {items.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-gradient-to-r from-cyan-50 to-cyan-100/30 rounded-lg border border-cyan-200 p-3 text-center">
            <p className="text-[8px] text-cyan-600 uppercase font-medium">Total Incoming</p>
            <p className="text-lg font-bold text-cyan-700">
              {formatNumber(items.reduce((sum, item) => sum + (item.incoming || 0), 0))}
            </p>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-red-100/30 rounded-lg border border-red-200 p-3 text-center">
            <p className="text-[8px] text-red-600 uppercase font-medium">Total Outgoing</p>
            <p className="text-lg font-bold text-red-700">
              {formatNumber(items.reduce((sum, item) => sum + (item.outgoing || 0), 0))}
            </p>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/30 rounded-lg border border-emerald-200 p-3 text-center col-span-2 sm:col-span-1">
            <p className="text-[8px] text-emerald-600 uppercase font-medium">Total Inventory Value</p>
            <p className="text-lg font-bold text-emerald-700">
              {formatCurrency(items.reduce((sum, item) => sum + (item.inventory_value || item.inventoryValue || 0), 0))}
            </p>
          </div>
        </div>
      )}
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