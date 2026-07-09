// src/pages/Reports/ProfitLossReport.jsx
import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, Calendar,
  PieChart, ShoppingCart, CreditCard, ArrowLeft,
  Loader2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';
import { ReportFilters } from './ReportFilters';

const api = window.api || {};

const COLORS = ['#059669', '#E11D48', '#D97706', '#4F46E5', '#0891B2', '#7C3AED'];

export default function ProfitLossReport({ setActiveTab }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ 
    summary: { 
      revenue: 0,
      purchaseCost: 0,
      expenses: 0,
      netProfit: 0,
      todayProfit: 0,
      weekProfit: 0,
      monthProfit: 0,
      yearProfit: 0
    }, 
    chartData: [], 
    breakdown: [] 
  });
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await api.getProfitLossReport(filters);
      if (result && result.success) {
        setData(result.data);
      } else {
        setData({ 
          summary: { 
            revenue: 0,
            purchaseCost: 0,
            expenses: 0,
            netProfit: 0,
            todayProfit: 0,
            weekProfit: 0,
            monthProfit: 0,
            yearProfit: 0
          }, 
          chartData: [], 
          breakdown: [] 
        });
      }
    } catch (error) {
      console.error('Error loading profit & loss report:', error);
      setData({ 
        summary: { 
          revenue: 0,
          purchaseCost: 0,
          expenses: 0,
          netProfit: 0,
          todayProfit: 0,
          weekProfit: 0,
          monthProfit: 0,
          yearProfit: 0
        }, 
        chartData: [], 
        breakdown: [] 
      });
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
  const chartData = data.chartData || [];
  const breakdown = data.breakdown || [];

  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '₨0.00';
    }
    return `₨${Number(value).toFixed(2)}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100/50 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-sm">Loading profit & loss data...</span>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-purple-700 to-purple-500 bg-clip-text text-transparent">
              Profit & Loss Report
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <PieChart size={12} />
              Revenue, costs, and net profit analysis
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <SummaryCard
          icon={DollarSign}
          label="Revenue"
          value={formatCurrency(summary.revenue)}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <SummaryCard
          icon={ShoppingCart}
          label="Purchase Cost"
          value={formatCurrency(summary.purchaseCost)}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <SummaryCard
          icon={CreditCard}
          label="Expenses"
          value={formatCurrency(summary.expenses)}
          color="text-rose-600"
          bgColor="bg-rose-50"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Net Profit"
          value={formatCurrency(summary.netProfit)}
          color={summary.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}
          bgColor={summary.netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}
        />
      </div>

      {/* Profit Timeline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <TimelineCard 
          label="Today" 
          value={formatCurrency(summary.todayProfit)} 
          trend={summary.todayProfit >= 0 ? 'up' : 'down'}
        />
        <TimelineCard 
          label="This Week" 
          value={formatCurrency(summary.weekProfit)} 
          trend={summary.weekProfit >= 0 ? 'up' : 'down'}
        />
        <TimelineCard 
          label="This Month" 
          value={formatCurrency(summary.monthProfit)} 
          trend={summary.monthProfit >= 0 ? 'up' : 'down'}
        />
        <TimelineCard 
          label="This Year" 
          value={formatCurrency(summary.yearProfit)} 
          trend={summary.yearProfit >= 0 ? 'up' : 'down'}
        />
      </div>

      {/* Filters */}
      <ReportFilters
        dateRange={{ start: filters.startDate, end: filters.endDate }}
        onDateRangeChange={(range) => setFilters({ startDate: range.start, endDate: range.end })}
        searchQuery=""
        onSearchChange={() => {}}
        onClearFilters={() => setFilters({ startDate: '', endDate: '' })}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Monthly Profit Trend</h3>
          <div className="h-64 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip 
                    formatter={(v) => [formatCurrency(v), 'Profit']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="profit" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Expense Breakdown</h3>
          <div className="h-64 w-full">
            {breakdown.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No data available
              </div>
            ) : (
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
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(v) => [formatCurrency(v), 'Amount']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
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

const TimelineCard = ({ label, value, trend }) => (
  <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
    <p className="text-[10px] text-slate-400 font-medium">{label}</p>
    <div className="flex items-center gap-2">
      <p className="text-lg font-bold text-slate-800">{value}</p>
      {trend === 'up' && (
        <TrendingUp size={16} className="text-emerald-500" />
      )}
      {trend === 'down' && (
        <TrendingDown size={16} className="text-red-500" />
      )}
    </div>
  </div>
);