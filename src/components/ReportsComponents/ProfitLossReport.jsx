// src/pages/Reports/ProfitLossReport.jsx
import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, Calendar,
  Printer, Download, FileText, FileSpreadsheet,
  PieChart, BarChart3,ShoppingCart
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, Legend
} from 'recharts';
import { ReportFilters } from './ReportFilters';
import { ReportActions } from './ReportActions';

const COLORS = ['#059669', '#E11D48', '#D97706', '#4F46E5'];

export default function ProfitLossReport() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ summary: {}, chartData: [], breakdown: [] });
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await api.getProfitLossReport(filters);
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error loading profit & loss report:', error);
    } finally {
      setLoading(false);
    }
  };

  const summary = data.summary || {};
  const chartData = data.chartData || [];
  const breakdown = data.breakdown || [];

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100/50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-purple-700 to-purple-500 bg-clip-text text-transparent">
            Profit & Loss Report
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <PieChart size={12} />
            Revenue, costs, and net profit analysis
          </p>
        </div>
        <ReportActions
          onPrint={() => window.print()}
          onExportPDF={() => {}}
          onExportExcel={() => {}}
          onExportCSV={() => {}}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <SummaryCard
          icon={DollarSign}
          label="Revenue"
          value={`₨${(summary.revenue || 0).toFixed(2)}`}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <SummaryCard
          icon={ShoppingCart}
          label="Purchase Cost"
          value={`₨${(summary.purchaseCost || 0).toFixed(2)}`}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <SummaryCard
          icon={CreditCard}
          label="Expenses"
          value={`₨${(summary.expenses || 0).toFixed(2)}`}
          color="text-rose-600"
          bgColor="bg-rose-50"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Net Profit"
          value={`₨${(summary.netProfit || 0).toFixed(2)}`}
          color={summary.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}
          bgColor={summary.netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}
        />
      </div>

      {/* Profit Timeline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <TimelineCard label="Today" value={`₨${(summary.todayProfit || 0).toFixed(2)}`} />
        <TimelineCard label="This Week" value={`₨${(summary.weekProfit || 0).toFixed(2)}`} />
        <TimelineCard label="This Month" value={`₨${(summary.monthProfit || 0).toFixed(2)}`} />
        <TimelineCard label="This Year" value={`₨${(summary.yearProfit || 0).toFixed(2)}`} />
      </div>

      <ReportFilters
        dateRange={{ start: filters.startDate, end: filters.endDate }}
        onDateRangeChange={(range) => setFilters({ startDate: range.start, endDate: range.end })}
        onClearFilters={() => setFilters({ startDate: '', endDate: '' })}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Monthly Profit Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip formatter={(v) => [`₨${v.toFixed(2)}`, 'Profit']} />
                <Bar dataKey="profit" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Expense Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {breakdown.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`₨${v.toFixed(2)}`, 'Amount']} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
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

const TimelineCard = ({ label, value }) => (
  <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
    <p className="text-[10px] text-slate-400 font-medium">{label}</p>
    <p className="text-lg font-bold text-slate-800">{value}</p>
  </div>
);