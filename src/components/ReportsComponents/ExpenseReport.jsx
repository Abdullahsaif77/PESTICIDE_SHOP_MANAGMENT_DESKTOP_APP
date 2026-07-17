// src/pages/Reports/ExpenseReport.jsx

import React, { useState, useEffect } from 'react';
import {
  CreditCard, DollarSign, TrendingUp, Calendar,
  PieChart, BarChart3, ArrowLeft, RefreshCw, Loader2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, Legend,
  CartesianGrid
} from 'recharts';
import { ReportFilters } from './ReportFilters';

const api = window.api || {};

const COLORS = ['#059669', '#D97706', '#4F46E5', '#E11D48', '#0891B2', '#7C3AED', '#DC2626', '#8B5CF6', '#EC4899', '#F59E0B'];

export default function ExpenseReport({ setActiveTab }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ 
    summary: { today: 0, monthly: 0, yearly: 0 }, 
    chartData: [], 
    breakdown: [] 
  });
  const [filters, setFilters] = useState({ 
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('📊 Loading expense report with filters:', filters);
      
      const result = await api.getExpenseReport(filters);
      console.log('📊 Expense report result:', result);
      
      if (result && result.success) {
        setData(result.data);
        console.log('✅ Data loaded:', result.data);
      } else {
        setData({ 
          summary: { today: 0, monthly: 0, yearly: 0 }, 
          chartData: [], 
          breakdown: [] 
        });
      }
    } catch (error) {
      console.error('Error loading expense report:', error);
      setData({ 
        summary: { today: 0, monthly: 0, yearly: 0 }, 
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

  const handleDateChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ 
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
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
          <span className="text-sm">Loading expense report...</span>
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-rose-700 to-rose-500 bg-clip-text text-transparent">
              Expense Report
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <CreditCard size={12} />
              Expense breakdown by category and time
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <SummaryCard 
          icon={DollarSign} 
          label="Today's Expenses" 
          value={formatCurrency(summary.today || 0)} 
          color="text-rose-600" 
          bgColor="bg-rose-50" 
        />
        <SummaryCard 
          icon={Calendar} 
          label="Monthly Expenses" 
          value={formatCurrency(summary.monthly || 0)} 
          color="text-amber-600" 
          bgColor="bg-amber-50" 
        />
        <SummaryCard 
          icon={TrendingUp} 
          label="Yearly Expenses" 
          value={formatCurrency(summary.yearly || 0)} 
          color="text-purple-600" 
          bgColor="bg-purple-50" 
        />
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm p-3 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400" />
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Date Range</label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 bg-white"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 bg-white"
            />
            <button
              onClick={handleResetFilters}
              className="px-2 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Expense Trend</h3>
          <div className="h-64 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No expense data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip formatter={(v) => [formatCurrency(v), 'Expenses']} />
                  <Bar dataKey="amount" fill="#E11D48" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Expense by Category</h3>
          <div className="h-64 w-full">
            {breakdown.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No category data available
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
                    nameKey="category"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [formatCurrency(v), 'Amount']} />
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