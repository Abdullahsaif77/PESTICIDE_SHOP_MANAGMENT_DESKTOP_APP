// src/pages/Reports/components/ReportFilters.jsx
import React from 'react';
import { Search, Calendar, Filter, X, ChevronDown } from 'lucide-react';

export const ReportFilters = ({
  dateRange,
  onDateRangeChange,
  searchQuery,
  onSearchChange,
  filters = [],
  onFilterChange,
  onClearFilters,
  quickFilters = [],
  onQuickFilter
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 mb-6">
      {/* Quick Filters */}
      {quickFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b border-slate-100">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Quick:</span>
          {quickFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => onQuickFilter?.(filter.key)}
              className="px-3 py-1 text-[10px] font-medium rounded-full border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Date Range */}
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-400" />
          <input
            type="date"
            value={dateRange?.start || ''}
            onChange={(e) => onDateRangeChange?.({ ...dateRange, start: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-slate-50 focus:bg-white transition-all"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={dateRange?.end || ''}
            onChange={(e) => onDateRangeChange?.({ ...dateRange, end: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-slate-50 focus:bg-white transition-all"
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery || ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-slate-50 focus:bg-white transition-all"
          />
        </div>

        {/* Dynamic Filters */}
        {filters.map((filter, index) => (
          <div key={index}>
            <select
              value={filter.value}
              onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-slate-50 focus:bg-white transition-all"
            >
              <option value="">All {filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Clear Filters */}
        <button
          onClick={onClearFilters}
          className="flex items-center justify-center gap-1 px-3 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X size={14} />
          Clear Filters
        </button>
      </div>
    </div>
  );
};