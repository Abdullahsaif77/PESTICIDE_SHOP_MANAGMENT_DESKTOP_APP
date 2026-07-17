// src/pages/Reports/LowStockReport.jsx

import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, Package, ArrowLeft, RefreshCw, 
  Loader2, Search, X, ChevronLeft, ChevronRight 
} from 'lucide-react';

const api = window.api || {};

export default function LowStockReport({ setActiveTab }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ 
    search: '', 
    warehouse: '' 
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('📊 Loading low stock report with filters:', filters);
      
      const result = await api.getLowStockReport(filters);
      console.log('📊 Low stock report result:', result);
      
      if (result && result.success) {
        setData(result.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error loading low stock report:', error);
      setData([]);
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
    setFilters({ search: '', warehouse: '' });
  };

  const formatNumber = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    return Number(value).toFixed(1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100/50 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-sm">Loading low stock report...</span>
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-red-700 to-red-500 bg-clip-text text-transparent">
              Low Stock Report
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <AlertCircle size={12} />
              Products below minimum stock levels
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-red-50 to-amber-50/50 rounded-xl border border-red-200/60 shadow-sm p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-red-100">
            <AlertCircle size={24} className="text-red-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Low Stock Items</p>
            <p className="text-2xl font-bold text-red-600">{data.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {data.filter(item => item.current_qty <= item.min_qty * 0.3).length} items are at critical level
            </p>
          </div>
        </div>
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
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-white w-40"
            />
          </div>
          <div className="flex items-center gap-2 ml-0 sm:ml-auto">
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
            <thead className="bg-gradient-to-r from-slate-50 to-red-50/30 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Current Qty</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Min Qty</th>
                <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Warehouse</th>
                <th className="px-3 py-2.5 text-center text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No low stock items found
                  </td>
                </tr>
              ) : (
                data.map((item, index) => {
                  const isCritical = item.current_qty <= item.min_qty * 0.3;
                  return (
                    <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3 py-2.5 font-medium text-slate-700">
                        {item.product || '-'}
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-red-600">
                        {formatNumber(item.current_qty || 0)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-600">
                        {formatNumber(item.min_qty || 0)}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">
                        {item.warehouse || '-'}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${
                          isCritical 
                            ? 'bg-red-50 text-red-600 border-red-200' 
                            : 'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                          <AlertCircle size={10} />
                          {isCritical ? 'Critical' : 'Low'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        {data.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
              <span>
                Total: <span className="font-bold text-red-600">{data.length}</span> items
              </span>
              <span>
                Critical: <span className="font-bold text-red-600">
                  {data.filter(item => item.current_qty <= item.min_qty * 0.3).length}
                </span> items
              </span>
              <span>
                Low: <span className="font-bold text-amber-600">
                  {data.filter(item => item.current_qty > item.min_qty * 0.3).length}
                </span> items
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}