// src/pages/Reports/components/ReportTable.jsx
import React from 'react';
import { ChevronLeft, ChevronRight , FileText } from 'lucide-react';

export const ReportTable = ({
  columns,
  data,
  loading,
  onSort,
  sortField,
  sortDirection,
  pagination,
  onPageChange
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-flex items-center gap-2 text-slate-400">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent" />
          Loading...
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-300 mb-2">
          <FileText size={48} className="mx-auto" />
        </div>
        <p className="text-sm text-slate-500">No data found</p>
        <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => onSort?.(col.key)}
                  className={`px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider ${
                    col.sortable ? 'cursor-pointer hover:text-slate-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortField === col.key && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-xs text-slate-700">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Showing {pagination.start} to {pagination.end} of {pagination.total} entries
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-medium text-slate-700 px-2">
              {pagination.current} / {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange?.(pagination.current + 1)}
              disabled={pagination.current === pagination.totalPages}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};