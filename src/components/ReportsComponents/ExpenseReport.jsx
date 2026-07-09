// src/pages/Reports/ExpenseReport.jsx
import React, { useState, useEffect } from 'react';
import {
  CreditCard, DollarSign, TrendingUp, Calendar,
  PieChart, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, Legend,
  CartesianGrid
} from 'recharts';
import { ReportFilters } from './ReportFilters';

const COLORS = ['#059669', '#D97706', '#4F46E5', '#E11D48', '#0891B2', '#7C3AED', '#DC2626', '#8B5CF6', '#EC4899'];

export default function ExpenseReport() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ summary: {}, chartData: [], breakdown: [] });
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await api.getExpenseReport(filters);
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error loading expense report:', error);
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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-rose-700 to-rose-500 bg-clip-text text-transparent">
            Expense Report
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <CreditCard size={12} />
            Expense breakdown by category and time
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <SummaryCard icon={DollarSign} label="Today's Expenses" value={`₨${(summary.today || 0).toFixed(2)}`} color="text-rose-600" bgColor="bg-rose-50" />
        <SummaryCard icon={Calendar} label="Monthly Expenses" value={`₨${(summary.monthly || 0).toFixed(2)}`} color="text-amber-600" bgColor="bg-amber-50" />
        <SummaryCard icon={TrendingUp} label="Yearly Expenses" value={`₨${(summary.yearly || 0).toFixed(2)}`} color="text-purple-600" bgColor="bg-purple-50" />
      </div>

      <ReportFilters
        dateRange={{ start: filters.startDate, end: filters.endDate }}
        onDateRangeChange={(range) => setFilters({ startDate: range.start, endDate: range.end })}
        onClearFilters={() => setFilters({ startDate: '', endDate: '' })}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Expense Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip formatter={(v) => [`₨${v.toFixed(2)}`, 'Expenses']} />
                <Bar dataKey="amount" fill="#E11D48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Expense by Category</h3>
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