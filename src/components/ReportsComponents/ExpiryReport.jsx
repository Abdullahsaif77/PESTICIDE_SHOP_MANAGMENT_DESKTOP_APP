// src/pages/Reports/ExpiryReport.jsx

import React, { useState, useEffect } from 'react';
import { 
  Clock, AlertTriangle, ArrowLeft, RefreshCw, 
  Loader2, Search, X, ChevronLeft, ChevronRight 
} from 'lucide-react';

const api = window.api || {};

export default function ExpiryReport({ setActiveTab }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ 
    summary: { expired: 0, expiring30: 0, expiring60: 0 }, 
    items: [] 
  });
  const [filters, setFilters] = useState({ 
    search: '', 
    warehouse: '', 
    expiryStatus: '' 
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('📊 Loading expiry report with filters:', filters);
      
      const result = await api.getExpiryReport(filters);
      console.log('📊 Expiry report result:', result);
      
      if (result && result.success) {
        setData(result.data);
      } else {
        setData({ summary: { expired: 0, expiring30: 0, expiring60: 0 }, items: [] });
      }
    } catch (error) {
      console.error('Error loading expiry report:', error);
      setData({ summary: { expired: 0, expiring30: 0, expiring60: 0 }, items: [] });
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
    setFilters({ search: '', warehouse: '', expiryStatus: '' });
  };

  const summary = data.summary || {};
  const items = data.items || [];

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getExpiryStatus = (daysRemaining) => {
    if (daysRemaining === undefined || daysRemaining === null) {
      return { label: 'Unknown', color: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
    if (daysRemaining < 0) {
      return { label: 'Expired', color: 'bg-red-50 text-red-600 border-red-200', icon: AlertTriangle };
    } else if (daysRemaining <= 30) {
      return { label: 'Expiring Soon', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: Clock };
    } else if (daysRemaining <= 60) {
      return { label: 'Expiring', color: 'bg-yellow-50 text-yellow-600 border-yellow-200', icon: Clock };
    }
    return { label: 'Good', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: Clock };
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100/50 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-sm">Loading expiry report...</span>
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-rose-700 to-rose-500 bg-clip-text text-transparent">
              Expiry Report
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Clock size={12} />
              Track product expiry dates and batch management
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <SummaryCard
          icon={AlertTriangle}
          label="Expired"
          value={summary.expired || 0}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <SummaryCard
          icon={Clock}
          label="Expiring in 30 Days"
          value={summary.expiring30 || 0}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
        <SummaryCard
          icon={Clock}
          label="Expiring in 60 Days"
          value={summary.expiring60 || 0}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
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
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 bg-white w-40"
            />
          </div>
          <div className="flex items-center gap-2 ml-0 sm:ml-auto">
            <select
              value={filters.expiryStatus}
              onChange={(e) => setFilters({ ...filters, expiryStatus: e.target.value })}
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 bg-white"
            >
              <option value="">All Status</option>
              <option value="expired">Expired</option>
              <option value="expiring_soon">Expiring Soon (0-30 days)</option>
              <option value="good">Good (30+ days)</option>
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
            <thead className="bg-gradient-to-r from-slate-50 to-rose-50/30 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Batch</th>
                <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Manufacturing</th>
                <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Expiry</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Days Left</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
                <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Warehouse</th>
                <th className="px-3 py-2.5 text-center text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No expiry records found
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const status = getExpiryStatus(item.days_remaining);
                  const StatusIcon = status.icon || Clock;
                  const days = item.days_remaining !== undefined && item.days_remaining !== null 
                    ? Math.round(item.days_remaining) 
                    : null;
                  
                  return (
                    <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3 py-2.5 font-medium text-slate-700">
                        {item.product || '-'}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[10px] text-slate-500">
                        {item.batch_number || '-'}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">
                        {formatDate(item.manufacturing_date || item.created_at)}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-700">
                        {formatDate(item.expiry_date)}
                      </td>
                      <td className={`px-3 py-2.5 text-right font-bold ${
                        days !== null && days < 0 ? 'text-red-600' : 
                        days !== null && days <= 30 ? 'text-amber-600' : 
                        days !== null && days <= 60 ? 'text-yellow-600' : 
                        'text-emerald-600'
                      }`}>
                        {days !== null ? days : '-'}
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-600">
                        {item.quantity || 0}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">
                        {item.warehouse || '-'}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${status.color}`}>
                          <StatusIcon size={10} />
                          {status.label}
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
        {items.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
              <span>
                Total: <span className="font-bold">{items.length}</span> batches
              </span>
              <span>
                Expired: <span className="font-bold text-red-600">
                  {items.filter(item => item.days_remaining !== null && item.days_remaining < 0).length}
                </span>
              </span>
              <span>
                Expiring Soon: <span className="font-bold text-amber-600">
                  {items.filter(item => item.days_remaining !== null && item.days_remaining >= 0 && item.days_remaining <= 30).length}
                </span>
              </span>
              <span>
                Good: <span className="font-bold text-emerald-600">
                  {items.filter(item => item.days_remaining !== null && item.days_remaining > 30).length}
                </span>
              </span>
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