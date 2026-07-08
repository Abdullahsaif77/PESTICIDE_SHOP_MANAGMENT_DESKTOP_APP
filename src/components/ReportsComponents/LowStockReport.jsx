// src/pages/Reports/LowStockReport.jsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, Package, Printer, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { ReportFilters } from './ReportFilters';
import { ReportActions } from './ReportActions';
import { ReportTable } from './ReportTable';

export default function LowStockReport() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ search: '', warehouse: '' });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await api.getLowStockReport(filters);
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error loading low stock report:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'product', label: 'Product', sortable: true },
    { key: 'current_qty', label: 'Current Quantity', sortable: true },
    { key: 'min_qty', label: 'Minimum Quantity', sortable: true },
    { key: 'warehouse', label: 'Warehouse', sortable: true },
    { 
      key: 'status', 
      label: 'Status',
      render: (v, row) => {
        const isCritical = row.current_qty <= row.min_qty * 0.3;
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${
            isCritical 
              ? 'bg-red-50 text-red-600 border-red-200' 
              : 'bg-amber-50 text-amber-600 border-amber-200'
          }`}>
            <AlertCircle size={10} />
            {isCritical ? 'Critical' : 'Low'}
          </span>
        );
      }
    }
  ];

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100/50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-red-700 to-red-500 bg-clip-text text-transparent">
            Low Stock Report
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <AlertCircle size={12} />
            Products below minimum stock levels
          </p>
        </div>
        <ReportActions
          onPrint={() => window.print()}
          onExportPDF={() => {}}
          onExportExcel={() => {}}
          onExportCSV={() => {}}
        />
      </div>

      <ReportFilters
        searchQuery={filters.search}
        onSearchChange={(value) => setFilters({ ...filters, search: value })}
        filters={[
          { key: 'warehouse', label: 'Warehouse', value: filters.warehouse, options: [] }
        ]}
        onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
        onClearFilters={() => setFilters({ search: '', warehouse: '' })}
      />

      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        <ReportTable columns={columns} data={data} loading={loading} />
      </div>
    </div>
  );
}