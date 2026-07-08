// src/pages/Reports/CustomerLedgerReport.jsx
import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Printer, Download, FileText, FileSpreadsheet, Eye } from 'lucide-react';
import { ReportFilters } from './ReportFilters';
import { ReportActions } from './ReportActions';
import { ReportTable } from './ReportTable';

export default function CustomerLedgerReport() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ summary: {}, items: [] });
  const [filters, setFilters] = useState({ search: '' });
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await api.getCustomerLedgerReport(filters);
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error loading customer ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  const summary = data.summary || {};
  const items = data.items || [];

  const columns = [
    { key: 'name', label: 'Customer', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'total_purchases', label: 'Total Purchases', sortable: true, render: (v) => `₨${v.toFixed(2)}` },
    { key: 'total_paid', label: 'Total Paid', sortable: true, render: (v) => `₨${v.toFixed(2)}` },
    { key: 'outstanding', label: 'Outstanding', sortable: true, render: (v) => `₨${v.toFixed(2)}` },
    { key: 'opening_balance', label: 'Opening Balance', sortable: true, render: (v) => `₨${v.toFixed(2)}` },
    { key: 'closing_balance', label: 'Closing Balance', sortable: true, render: (v) => `₨${v.toFixed(2)}` },
    {
      key: 'actions',
      label: 'Actions',
      render: (v, row) => (
        <button
          onClick={() => setSelectedCustomer(row)}
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-indigo-700 to-indigo-500 bg-clip-text text-transparent">
            Customer Ledger Report
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <Users size={12} />
            Customer balances and transaction history
          </p>
        </div>
        <ReportActions
          onPrint={() => window.print()}
          onExportPDF={() => {}}
          onExportExcel={() => {}}
          onExportCSV={() => {}}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <SummaryCard icon={Users} label="Total Customers" value={summary.totalCustomers || 0} color="text-indigo-600" bgColor="bg-indigo-50" />
        <SummaryCard icon={DollarSign} label="Total Outstanding" value={`₨${(summary.totalOutstanding || 0).toFixed(2)}`} color="text-amber-600" bgColor="bg-amber-50" />
        <SummaryCard icon={DollarSign} label="Total Balance" value={`₨${(summary.totalBalance || 0).toFixed(2)}`} color="text-emerald-600" bgColor="bg-emerald-50" />
      </div>

      <ReportFilters
        searchQuery={filters.search}
        onSearchChange={(value) => setFilters({ search: value })}
        onClearFilters={() => setFilters({ search: '' })}
      />

      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        <ReportTable columns={columns} data={items} loading={loading} />
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