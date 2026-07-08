// src/pages/Reports/components/ReportActions.jsx
import React from 'react';
import { Printer, Download, FileSpreadsheet, FileText } from 'lucide-react';

export const ReportActions = ({ onPrint, onExportPDF, onExportExcel, onExportCSV }) => {
  const buttons = [
    { icon: Printer, label: 'Print', onClick: onPrint, color: 'text-slate-600 hover:bg-slate-100' },
    { icon: FileText, label: 'PDF', onClick: onExportPDF, color: 'text-red-600 hover:bg-red-50' },
    { icon: FileSpreadsheet, label: 'Excel', onClick: onExportExcel, color: 'text-emerald-600 hover:bg-emerald-50' },
    { icon: Download, label: 'CSV', onClick: onExportCSV, color: 'text-blue-600 hover:bg-blue-50' }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {buttons.map((btn, index) => (
        <button
          key={index}
          onClick={btn.onClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:shadow-md ${btn.color}`}
        >
          <btn.icon size={14} />
          {btn.label}
        </button>
      ))}
    </div>
  );
};