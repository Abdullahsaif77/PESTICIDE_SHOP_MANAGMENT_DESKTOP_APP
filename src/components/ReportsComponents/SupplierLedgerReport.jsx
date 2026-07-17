// src/pages/Reports/SupplierLedgerReport.jsx

import React, { useState, useEffect } from 'react';
import { 
  Handshake, DollarSign, Eye, ArrowLeft, X, 
  RefreshCw, Loader2, Search, ChevronLeft, ChevronRight 
} from 'lucide-react';

const api = window.api || {};

export default function SupplierLedgerReport({ setActiveTab }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ summary: {}, items: [] });
  const [filters, setFilters] = useState({ search: '' });
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    loadData();
  }, [filters, pagination.current]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('📊 Loading supplier ledger report with filters:', filters);
      
      const result = await api.getSupplierLedgerReport({
        ...filters,
        page: pagination.current,
        pageSize: pagination.pageSize
      });
      
      console.log('📊 Supplier ledger report result:', result);
      
      if (result && result.success) {
        setData(result.data);
        setPagination(prev => ({ 
          ...prev, 
          total: result.data?.total || result.data?.items?.length || 0 
        }));
      } else {
        setData({ summary: {}, items: [] });
      }
    } catch (error) {
      console.error('Error loading supplier ledger:', error);
      setData({ summary: {}, items: [] });
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
          <span className="text-sm">Loading supplier ledger...</span>
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-teal-700 to-teal-500 bg-clip-text text-transparent">
              Supplier Ledger Report
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Handshake size={12} />
              Supplier balances and payment history
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <SummaryCard 
          icon={Handshake} 
          label="Total Suppliers" 
          value={formatNumber(summary.totalSuppliers || summary.total_suppliers || 0)} 
          color="text-teal-600" 
          bgColor="bg-teal-50" 
        />
        <SummaryCard 
          icon={DollarSign} 
          label="Total Payable" 
          value={formatCurrency(summary.totalPayable || summary.total_payable || 0)} 
          color="text-amber-600" 
          bgColor="bg-amber-50" 
        />
        <SummaryCard 
          icon={DollarSign} 
          label="Total Balance" 
          value={formatCurrency(summary.totalBalance || summary.total_balance || 0)} 
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
              placeholder="Search suppliers..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 bg-white w-40"
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
            <thead className="bg-gradient-to-r from-slate-50 to-teal-50/30 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Supplier</th>
                <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Purchases</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Payments Made</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Amount Payable</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Closing Balance</th>
                <th className="px-3 py-2.5 text-center text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No suppliers found
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-2.5 font-medium text-slate-700">
                      {item.name || '-'}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">
                      {item.phone || '-'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-slate-700">
                      {formatCurrency(item.total_purchases || item.totalPurchases || 0)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-emerald-600">
                      {formatCurrency(item.payments_made || item.paymentsMade || 0)}
                    </td>
                    <td className={`px-3 py-2.5 text-right font-bold ${(item.payable || item.total_due || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {formatCurrency(item.payable || item.total_due || 0)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-slate-800">
                      {formatCurrency(item.closing_balance || item.closingBalance || 0)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => setSelectedSupplier(item)}
                        className="p-1 rounded-lg hover:bg-teal-50 text-slate-400 hover:text-teal-600 transition-colors"
                        title="View Full Ledger"
                      >
                        <Eye size={14} />
                      </button>
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

      {/* Supplier Detail Modal */}
      {selectedSupplier && (
        <SupplierDetailModal
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
        />
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

const SupplierDetailModal = ({ supplier, onClose }) => {
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLedgerDetails();
  }, [supplier]);

  const fetchLedgerDetails = async () => {
    setLoading(true);
    try {
      console.log('📊 Fetching ledger details for supplier:', supplier.id);
      
      const result = await api.getSupplierLedgerDetails(supplier.id);
      console.log('📊 Ledger details result:', result);
      
      if (result && result.success) {
        setLedgerEntries(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching ledger details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '₨0.00';
    }
    return `₨${Number(value).toFixed(2)}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" 
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in relative">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center z-10">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Supplier Ledger</h3>
            <p className="text-sm text-slate-600">{supplier.name}</p>
            {supplier.phone && (
              <p className="text-xs text-slate-400">{supplier.phone}</p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 size={24} className="animate-spin text-teal-500" />
            </div>
          ) : ledgerEntries.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No ledger entries found for this supplier
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Purchase #</th>
                    <th className="px-4 py-2 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Debit</th>
                    <th className="px-4 py-2 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Credit</th>
                    <th className="px-4 py-2 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerEntries.map((entry, index) => (
                    <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2 font-mono text-[10px] text-slate-600">
                        {entry.purchase_number || entry.purchase || '-'}
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {entry.date ? new Date(entry.date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-red-600">
                        {entry.debit ? formatCurrency(entry.debit) : '-'}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-emerald-600">
                        {entry.credit ? formatCurrency(entry.credit) : '-'}
                      </td>
                      <td className="px-4 py-2 text-right font-bold text-slate-800">
                        {formatCurrency(entry.balance || entry.due_amount || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};