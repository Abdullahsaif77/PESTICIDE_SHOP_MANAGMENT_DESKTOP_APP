// src/pages/Reports/WarehouseReport.jsx
import React, { useState, useEffect } from 'react';
import {
  Warehouse, Package, Box, TrendingUp, TrendingDown, DollarSign
} from 'lucide-react';
import { ReportFilters } from './ReportFilters';
import { ReportTable } from './ReportTable';

export default function WarehouseReport() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ summary: {}, items: [] });
  const [filters, setFilters] = useState({ search: '' });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await api.getWarehouseReport(filters);
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error loading warehouse report:', error);
    } finally {
      setLoading(false);
    }
  };

  const summary = data.summary || {};
  const items = data.items || [];

  const columns = [
    { key: 'warehouse', label: 'Warehouse', sortable: true },
    { key: 'products', label: 'Products Stored', sortable: true },
    { key: 'total_qty', label: 'Total Quantity', sortable: true },
    { key: 'inventory_value', label: 'Inventory Value', sortable: true, render: (v) => `₨${v.toFixed(2)}` },
    { key: 'incoming', label: 'Incoming Stock', sortable: true },
    { key: 'outgoing', label: 'Outgoing Stock', sortable: true }
  ];

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100/50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-cyan-700 to-cyan-500 bg-clip-text text-transparent">
            Warehouse Report
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <Warehouse size={12} />
            Stock distribution across warehouses
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <SummaryCard icon={Warehouse} label="Total Warehouses" value={summary.totalWarehouses || 0} color="text-cyan-600" bgColor="bg-cyan-50" />
        <SummaryCard icon={Package} label="Total Products" value={summary.totalProducts || 0} color="text-sky-600" bgColor="bg-sky-50" />
        <SummaryCard icon={Box} label="Total Quantity" value={summary.totalQuantity || 0} color="text-amber-600" bgColor="bg-amber-50" />
        <SummaryCard icon={DollarSign} label="Inventory Value" value={`₨${(summary.inventoryValue || 0).toFixed(2)}`} color="text-emerald-600" bgColor="bg-emerald-50" />
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