// src/pages/Reports/ExpiryReport.jsx
import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Printer, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { ReportFilters } from './ReportFilters';
import { ReportActions } from './ReportActions';
import { ReportTable } from './ReportTable';

export default function ExpiryReport() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ summary: {}, items: [] });
  const [filters, setFilters] = useState({ search: '', warehouse: '', expiryStatus: '' });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await api.getExpiryReport(filters);
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error loading expiry report:', error);
    } finally {
      setLoading(false);
    }
  };

  const summary = data.summary || {};
  const items = data.items || [];

  const getExpiryStatus = (daysRemaining) => {
    if (daysRemaining < 0) {
      return { label: 'Expired', color: 'bg-red-50 text-red-600 border-red-200' };
    } else if (daysRemaining <= 30) {
      return { label: 'Expiring Soon', color: 'bg-amber-50 text-amber-600 border-amber-200' };
    } else if (daysRemaining <= 60) {
      return { label: 'Expiring', color: 'bg-yellow-50 text-yellow-600 border-yellow-200' };
    }
    return { label: 'Good', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
  };

  const columns = [
    { key: 'product', label: 'Product', sortable: true },
    { key: 'batch_number', label: 'Batch Number', sortable: true },
    { key: 'manufacturing_date', label: 'Manufacturing Date', sortable: true },
    { key: 'expiry_date', label: 'Expiry Date', sortable: true },
    { key: 'days_remaining', label: 'Days Remaining', sortable: true },
    { key: 'quantity', label: 'Quantity', sortable: true },
    { key: 'warehouse', label: 'Warehouse', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (v, row) => {
        const status = getExpiryStatus(row.days_remaining);
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${status.color}`}>
            {status.label}
          </span>
        );
      }
    }
  ];

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100/50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-rose-700 to-rose-500 bg-clip-text text-transparent">
            Expiry Report
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <Clock size={12} />
            Track product expiry dates and batch management
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

      <ReportFilters
        searchQuery={filters.search}
        onSearchChange={(value) => setFilters({ ...filters, search: value })}
        filters={[
          { key: 'warehouse', label: 'Warehouse', value: filters.warehouse, options: [] },
          { key: 'expiryStatus', label: 'Status', value: filters.expiryStatus, options: [
            { value: 'expired', label: 'Expired' },
            { value: 'expiring_soon', label: 'Expiring Soon' },
            { value: 'good', label: 'Good' }
          ]}
        ]}
        onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
        onClearFilters={() => setFilters({ search: '', warehouse: '', expiryStatus: '' })}
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