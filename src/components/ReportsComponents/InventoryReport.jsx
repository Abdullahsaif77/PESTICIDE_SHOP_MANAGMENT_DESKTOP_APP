// src/pages/Reports/InventoryReport.jsx
import React, { useState, useEffect } from 'react';
import {
  Package, Box, DollarSign, TrendingUp,
  Printer, Download, FileText, FileSpreadsheet,
  AlertCircle, CheckCircle
} from 'lucide-react';
import { ReportFilters } from './ReportFilters';
import { ReportActions } from './ReportActions';
import { ReportTable } from './ReportTable';

export default function InventoryReport() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ summary: {}, items: [] });
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
      const result = await api.getInventoryReport({
        ...filters,
        page: pagination.current,
        pageSize: pagination.pageSize
      });
      if (result.success) {
        setData(result.data);
        setPagination(prev => ({ ...prev, total: result.data.total }));
      }
    } catch (error) {
      console.error('Error loading inventory report:', error);
    } finally {
      setLoading(false);
    }
  };

  const summary = data.summary || {};
  const items = data.items || [];

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

  const columns = [
    { key: 'product', label: 'Product', sortable: true },
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'warehouse', label: 'Warehouse', sortable: true },
    { key: 'stock', label: 'Current Stock', sortable: true },
    { key: 'purchase_price', label: 'Purchase Price', sortable: true, render: (v) => `₨${v.toFixed(2)}` },
    { key: 'selling_price', label: 'Selling Price', sortable: true, render: (v) => `₨${v.toFixed(2)}` },
    { key: 'stock_value', label: 'Stock Value', sortable: true, render: (v) => `₨${v.toFixed(2)}` },
    { key: 'status', label: 'Status', render: (v) => getStatusBadge(v) }
  ];

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100/50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-amber-700 to-amber-500 bg-clip-text text-transparent">
            Inventory Report
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <Package size={12} />
            Current stock, value, and profit potential
          </p>
        </div>
        <ReportActions
          onPrint={() => window.print()}
          onExportPDF={() => {}}
          onExportExcel={() => {}}
          onExportCSV={() => {}}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <SummaryCard icon={Box} label="Current Stock" value={summary.totalStock || 0} color="text-sky-600" bgColor="bg-sky-50" />
        <SummaryCard icon={DollarSign} label="Stock Value" value={`₨${(summary.stockValue || 0).toFixed(2)}`} color="text-emerald-600" bgColor="bg-emerald-50" />
        <SummaryCard icon={Calculator} label="Average Cost" value={`₨${(summary.avgCost || 0).toFixed(2)}`} color="text-amber-600" bgColor="bg-amber-50" />
        <SummaryCard icon={TrendingUp} label="Selling Value" value={`₨${(summary.sellingValue || 0).toFixed(2)}`} color="text-purple-600" bgColor="bg-purple-50" />
      </div>

      <ReportFilters
        searchQuery={filters.search}
        onSearchChange={(value) => setFilters({ ...filters, search: value })}
        filters={[
          { key: 'warehouse', label: 'Warehouse', value: filters.warehouse, options: [] },
          { key: 'status', label: 'Status', value: filters.status, options: [
            { value: 'in_stock', label: 'In Stock' },
            { value: 'low_stock', label: 'Low Stock' },
            { value: 'out_of_stock', label: 'Out of Stock' }
          ]}
        ]}
        onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
        onClearFilters={() => setFilters({ search: '', warehouse: '', status: '' })}
      />

      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        <ReportTable
          columns={columns}
          data={items}
          loading={loading}
          pagination={{
            current: pagination.current,
            totalPages: Math.ceil(pagination.total / pagination.pageSize),
            start: (pagination.current - 1) * pagination.pageSize + 1,
            end: Math.min(pagination.current * pagination.pageSize, pagination.total),
            total: pagination.total
          }}
          onPageChange={(page) => setPagination({ ...pagination, current: page })}
        />
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