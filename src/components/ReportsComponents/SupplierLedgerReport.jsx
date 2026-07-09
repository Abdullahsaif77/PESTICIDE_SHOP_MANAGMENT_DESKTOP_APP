// src/pages/Reports/SupplierLedgerReport.jsx
import React, { useState, useEffect } from 'react';
import { Handshake, DollarSign, Eye, ArrowLeft, X } from 'lucide-react';
import { ReportFilters } from './ReportFilters';
import { ReportTable } from './ReportTable';

const api = window.api || {};

export default function SupplierLedgerReport({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ summary: {}, items: [] });
  const [filters, setFilters] = useState({ search: '' });
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await api.getSupplierLedgerReport(filters);
      if (result && result.success) {
        setData(result.data);
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

  const summary = data.summary || {};
  const items = data.items || [];

  // Helper function to safely format currency
  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '₨0.00';
    }
    return `₨${Number(value).toFixed(2)}`;
  };

  const columns = [
    { key: 'name', label: 'Supplier', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    { 
      key: 'total_purchases', 
      label: 'Total Purchases', 
      sortable: true, 
      render: (v) => formatCurrency(v) 
    },
    { 
      key: 'payments_made', 
      label: 'Payments Made', 
      sortable: true, 
      render: (v) => formatCurrency(v) 
    },
    { 
      key: 'payable', 
      label: 'Amount Payable', 
      sortable: true, 
      render: (v) => formatCurrency(v) 
    },
    { 
      key: 'opening_balance', 
      label: 'Opening Balance', 
      sortable: true, 
      render: (v) => formatCurrency(v) 
    },
    { 
      key: 'closing_balance', 
      label: 'Closing Balance', 
      sortable: true, 
      render: (v) => formatCurrency(v) 
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (v, row) => (
        <button
          onClick={() => setSelectedSupplier(row)}
          className="p-1 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
          title="View Full Ledger"
        >
          <Eye size={14} />
        </button>
      )
    }
  ];

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100/50 min-h-screen">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <SummaryCard 
          icon={Handshake} 
          label="Total Suppliers" 
          value={summary.totalSuppliers || 0} 
          color="text-teal-600" 
          bgColor="bg-teal-50" 
        />
        <SummaryCard 
          icon={DollarSign} 
          label="Total Payable" 
          value={formatCurrency(summary.totalPayable)} 
          color="text-amber-600" 
          bgColor="bg-amber-50" 
        />
        <SummaryCard 
          icon={DollarSign} 
          label="Total Balance" 
          value={formatCurrency(summary.totalBalance)} 
          color="text-emerald-600" 
          bgColor="bg-emerald-50" 
        />
      </div>

      {/* Filters */}
      <ReportFilters
        searchQuery={filters.search}
        onSearchChange={(value) => setFilters({ search: value })}
        onClearFilters={() => setFilters({ search: '' })}
      />

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        <ReportTable 
          columns={columns} 
          data={items} 
          loading={loading} 
        />
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
      const result = await api.getSupplierLedgerDetails(supplier.id);
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
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent" />
            </div>
          ) : ledgerEntries.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No ledger entries found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Purchase #</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Debit</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Credit</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerEntries.map((entry, index) => (
                    <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2 text-sm text-slate-700">{entry.purchase_number || '-'}</td>
                      <td className="px-4 py-2 text-sm text-slate-600">
                        {entry.date ? new Date(entry.date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-right font-medium text-red-600">
                        {entry.debit ? formatCurrency(entry.debit) : '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-right font-medium text-emerald-600">
                        {entry.credit ? formatCurrency(entry.credit) : '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-right font-bold text-slate-800">
                        {formatCurrency(entry.balance)}
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