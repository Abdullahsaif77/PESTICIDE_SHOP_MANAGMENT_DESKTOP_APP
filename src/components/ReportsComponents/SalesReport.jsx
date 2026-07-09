// src/pages/Reports/SalesReport.jsx
import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  Users, Percent, Calculator,
  Calendar, CreditCard, Box, ArrowLeft
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart as RechartsPieChart,
  Pie, Cell, Legend, Area, AreaChart
} from 'recharts';
import { ReportFilters } from './ReportFilters';
import { ReportTable } from './ReportTable';

const api = window.api || {};

const COLORS = ['#059669', '#D97706', '#4F46E5', '#E11D48', '#0891B2', '#7C3AED'];

export default function SalesReport({ setActiveTab }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ summary: {}, items: [], chartData: [] });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    search: '',
    warehouse: '',
    customer: '',
    paymentMethod: ''
  });
  const [quickFilter, setQuickFilter] = useState('today');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Quick filter options
  const quickFilters = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' }
  ];

  useEffect(() => {
    loadData();
  }, [filters, quickFilter, pagination.current]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Set date range based on quick filter
      let dateFilters = { ...filters };
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      switch (quickFilter) {
        case 'today':
          dateFilters.startDate = today.toISOString().split('T')[0];
          dateFilters.endDate = today.toISOString().split('T')[0];
          break;
        case 'yesterday':
          dateFilters.startDate = yesterday.toISOString().split('T')[0];
          dateFilters.endDate = yesterday.toISOString().split('T')[0];
          break;
        case 'week':
          dateFilters.startDate = weekStart.toISOString().split('T')[0];
          dateFilters.endDate = today.toISOString().split('T')[0];
          break;
        case 'month':
          dateFilters.startDate = monthStart.toISOString().split('T')[0];
          dateFilters.endDate = today.toISOString().split('T')[0];
          break;
        default:
          break;
      }

      const result = await api.getSalesReport({
        ...dateFilters,
        page: pagination.current,
        pageSize: pagination.pageSize
      });
      
      if (result && result.success) {
        setData(result.data);
        setPagination(prev => ({ ...prev, total: result.data.total || result.data.items?.length || 0 }));
      } else {
        setData({ summary: {}, items: [], chartData: [] });
      }
    } catch (error) {
      console.error('Error loading sales report:', error);
      setData({ summary: {}, items: [], chartData: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (setActiveTab) {
      setActiveTab('reports');
    }
  };

  const summary = data.summary || {};
  const items = data.items || [];
  const chartData = data.chartData || [];

  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '₨0.00';
    }
    return `₨${Number(value).toFixed(2)}`;
  };

  const columns = [
    { key: 'invoice_number', label: 'Invoice No', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'items', label: 'Items', sortable: true },
    { key: 'total', label: 'Total', sortable: true, render: (v) => formatCurrency(v) },
    { key: 'paid', label: 'Paid', sortable: true, render: (v) => formatCurrency(v) },
    { key: 'due', label: 'Due', sortable: true, render: (v) => formatCurrency(v) },
    { key: 'profit', label: 'Profit', sortable: true, render: (v) => formatCurrency(v) }
  ];

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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-emerald-500 bg-clip-text text-transparent">
              Sales Report
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <TrendingUp size={12} />
              Detailed sales analytics and revenue tracking
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <SummaryCard
          icon={DollarSign}
          label="Total Sales"
          value={formatCurrency(summary.totalSales)}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <SummaryCard
          icon={Users}
          label="Cash Sales"
          value={formatCurrency(summary.cashSales)}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <SummaryCard
          icon={CreditCard}
          label="Credit Sales"
          value={formatCurrency(summary.creditSales)}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <SummaryCard
          icon={ShoppingBag}
          label="Invoices"
          value={summary.invoiceCount || 0}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
        <SummaryCard
          icon={Box}
          label="Quantity Sold"
          value={summary.totalQuantity || 0}
          color="text-sky-600"
          bgColor="bg-sky-50"
        />
        <SummaryCard
          icon={Percent}
          label="Discount Given"
          value={formatCurrency(summary.discount)}
          color="text-rose-600"
          bgColor="bg-rose-50"
        />
        <SummaryCard
          icon={Calculator}
          label="Net Sales"
          value={formatCurrency(summary.netSales)}
          color="text-indigo-600"
          bgColor="bg-indigo-50"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Profit"
          value={formatCurrency(summary.profit)}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
      </div>

      {/* Filters */}
      <ReportFilters
        dateRange={{ start: filters.startDate, end: filters.endDate }}
        onDateRangeChange={(range) => setFilters({ ...filters, startDate: range.start, endDate: range.end })}
        searchQuery={filters.search}
        onSearchChange={(value) => setFilters({ ...filters, search: value })}
        quickFilters={quickFilters}
        onQuickFilter={(key) => setQuickFilter(key)}
        filters={[
          {
            key: 'warehouse',
            label: 'Warehouse',
            value: filters.warehouse,
            options: [{ value: '1', label: 'Main Warehouse' }]
          },
          {
            key: 'paymentMethod',
            label: 'Payment Method',
            value: filters.paymentMethod,
            options: [
              { value: 'cash', label: 'Cash' },
              { value: 'credit', label: 'Credit' }
            ]
          }
        ]}
        onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
        onClearFilters={() => setFilters({ startDate: '', endDate: '', search: '', warehouse: '', customer: '', paymentMethod: '' })}
      />

      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Sales Trend</h3>
        <div className="h-64 w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              No sales data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip formatter={(v) => [formatCurrency(v), 'Sales']} />
                <Area type="monotone" dataKey="amount" stroke="#059669" strokeWidth={2} fill="url(#salesGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        <ReportTable
          columns={columns}
          data={items}
          loading={loading}
          pagination={{
            current: pagination.current,
            totalPages: Math.max(1, Math.ceil(pagination.total / pagination.pageSize)),
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