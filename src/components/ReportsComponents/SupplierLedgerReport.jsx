// src/pages/Reports/SupplierLedgerReport.jsx
import React, { useState, useEffect } from 'react';
import { Handshake, DollarSign, Printer, Download, FileText, FileSpreadsheet, Eye } from 'lucide-react';
import { ReportFilters } from './ReportFilters';
import { ReportActions } from './ReportActions';
import { ReportTable } from './ReportTable';

export default function SupplierLedgerReport() {
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
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error loading supplier ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  const summary = data.summary || {};
  const items = data.items || [];

  const columns = [
    { key: 'name', label: 'Supplier', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'total_purchases', label: 'Total Purchases', sortable: true, render: (v) => `₨${v.toFixed(2)}` },
    { key: 'payments_made', label: 'Payments Made', sortable: true, render: (v) => `₨${v.toFixed(2)}` },
    { key: 'payable', label: 'Amount Payable', sortable: true, render: (v) => `₨${v.toFixed(2)}` },
    { key: 'opening_balance', label: 'Opening Balance', sortable: true, render: (v) => `₨${v.toFixed(2)}` },
    { key: 'closing_balance', label: 'Closing Balance', sortable: true, render: (v) => `₨${v.toFixed(2)}` },
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-teal-700 to-teal-500 bg-clip-text text-transparent">
            Supplier Ledger Report
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <Handshake size={12} />
            Supplier balances and payment history
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
        <SummaryCard icon={Handshake} label="Total Suppliers" value={summary.totalSuppliers || 0} color="text-teal-600" bgColor="bg-teal-50" />
        <SummaryCard icon={DollarSign} label="Total Payable" value={`₨${(summary.totalPayable || 0).toFixed(2)}`} color="text-amber-600" bgColor="bg-amber-50" />
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