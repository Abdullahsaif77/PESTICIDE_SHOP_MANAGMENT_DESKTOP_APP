// src/pages/Reports/PurchaseReport.jsx
import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, DollarSign, Box, Package,
  Printer, Download, FileText, FileSpreadsheet
} from 'lucide-react';
import { ReportFilters } from './ReportFilters';
import { ReportActions } from './ReportActions';
import { ReportTable } from './ReportTable';

export default function PurchaseReport() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ summary: {}, items: [] });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    search: '',
    supplier: '',
    warehouse: ''
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    loadData();
  }, [filters, pagination.current]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await api.getPurchaseReport({
        ...filters,
        page: pagination.current,
        pageSize: pagination.pageSize
      });
      if (result.success) {
        setData(result.data);
        setPagination(prev => ({ ...prev, total: result.data.total }));
      }
    } catch (error) {
      console.error('Error loading purchase report:', error);
    } finally {
      setLoading(false);
    }
  };

  const summary = data.summary || {};
  const items = data.items || [];

  const columns = [
    { key: 'purchase_id', label: 'Purchase ID', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'supplier', label: 'Supplier', sortable: true },
    { key: 'warehouse', label: 'Warehouse', sortable: true },
    { key: 'items', label: 'Items', sortable: true },
    { key: 'quantity', label: 'Quantity', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, render: (v) => `₨${v.toFixed(2)}` }
  ];

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100/50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-blue-500 bg-clip-text text-transparent">
            Purchase Report
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <ShoppingCart size={12} />
            Track purchase history and costs
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
        <SummaryCard icon={DollarSign} label="Total Purchases" value={`₨${(summary.totalPurchases || 0).toFixed(2)}`} color="text-blue-600" bgColor="bg-blue-50" />
        <SummaryCard icon={Box} label="Total Quantity" value={summary.totalQuantity || 0} color="text-amber-600" bgColor="bg-amber-50" />
        <SummaryCard icon={Package} label="Total Cost" value={`₨${(summary.totalCost || 0).toFixed(2)}`} color="text-purple-600" bgColor="bg-purple-50" />
      </div>

      <ReportFilters
        dateRange={{ start: filters.startDate, end: filters.endDate }}
        onDateRangeChange={(range) => setFilters({ ...filters, startDate: range.start, endDate: range.end })}
        searchQuery={filters.search}
        onSearchChange={(value) => setFilters({ ...filters, search: value })}
        filters={[
          { key: 'supplier', label: 'Supplier', value: filters.supplier, options: [] },
          { key: 'warehouse', label: 'Warehouse', value: filters.warehouse, options: [] }
        ]}
        onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
        onClearFilters={() => setFilters({ startDate: '', endDate: '', search: '', supplier: '', warehouse: '' })}
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