// src/pages/Reports/CustomerLedgerReport.jsx

import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, Eye, ArrowLeft, X, 
  RefreshCw, Loader2, Search, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, Wallet
} from 'lucide-react';

const api = window.api || {};

export default function CustomerLedgerReport({ setActiveTab }) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filters, setFilters] = useState({ 
    search: '', 
    startDate: null, 
    endDate: null,
    customerId: '' 
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [summary, setSummary] = useState({ 
    totalCustomers: 0, 
    totalOutstanding: 0, 
    totalBalance: 0,
    totalDebit: 0,
    totalCredit: 0,
    netBalance: 0
  });

  useEffect(() => {
    loadReport();
  }, [filters.startDate, filters.endDate, filters.customerId]);

  const loadReport = async () => {
    setLoading(true);
    try {
      console.log('📊 Loading customer ledger report from ledger table...');
      
      // ✅ Use the report API that queries the ledger table
      const result = await api.getCustomerLedgerReport({
        startDate: filters.startDate,
        endDate: filters.endDate,
        customerId: filters.customerId || undefined
      });
      
      console.log('📊 Report result:', result);
      
      if (result && result.success) {
        const data = result.data || {};
        const items = data.items || [];
        const summaryData = data.summary || {};
        
        setCustomers(items);
        setSummary(summaryData);
        setFilteredCustomers(items);
        setPagination(prev => ({ 
          ...prev, 
          total: items.length 
        }));
      } else {
        console.error('Failed to load report:', result?.error);
        setCustomers([]);
        setFilteredCustomers([]);
      }
    } catch (error) {
      console.error('Error loading customer ledger report:', error);
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search filter
  useEffect(() => {
    if (!filters.search.trim()) {
      setFilteredCustomers(customers);
      setPagination(prev => ({ ...prev, total: customers.length }));
      return;
    }
    
    const query = filters.search.toLowerCase().trim();
    const filtered = customers.filter(c => 
      c.customer_name?.toLowerCase().includes(query) ||
      c.phone?.includes(query) ||
      c.email?.toLowerCase().includes(query)
    );
    setFilteredCustomers(filtered);
    setPagination(prev => ({ ...prev, total: filtered.length }));
  }, [filters.search, customers]);

  const handleBack = () => {
    if (setActiveTab) {
      setActiveTab('reports');
    }
  };

  const handleResetFilters = () => {
    setFilters({ search: '', startDate: null, endDate: null, customerId: '' });
    setPagination({ ...pagination, current: 1 });
    loadReport();
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '₨0.00';
    }
    return `₨${Number(value).toFixed(2)}`;
  };

  const formatNumber = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    return Number(value).toFixed(0);
  };

  const getStatusColor = (amount) => {
    if (amount > 0) return 'text-red-600';
    if (amount < 0) return 'text-emerald-600';
    return 'text-slate-600';
  };

  const getStatusBadgeColor = (amount) => {
    if (amount > 0) return 'bg-red-100 text-red-700 border-red-200';
    if (amount < 0) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  // Loading state
  if (loading && customers.length === 0) {
    return (
      <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100/50 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-sm">Loading customer ledger...</span>
        </div>
      </div>
    );
  }

  // Get paginated data
  const startIndex = (pagination.current - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredCustomers.length / pagination.pageSize);

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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-indigo-700 to-indigo-500 bg-clip-text text-transparent">
              Customer Ledger Report
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Users size={12} />
              Real-time customer balances from ledger
            </p>
          </div>
        </div>
        <button
          onClick={loadReport}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <SummaryCard 
          icon={Users} 
          label="Total Customers" 
          value={formatNumber(summary.totalCustomers || 0)} 
          color="text-indigo-600" 
          bgColor="bg-indigo-50" 
        />
        <SummaryCard 
          icon={Wallet} 
          label="Total Debit" 
          value={formatCurrency(summary.totalDebit || 0)} 
          color="text-red-600" 
          bgColor="bg-red-50" 
        />
        <SummaryCard 
          icon={Wallet} 
          label="Total Credit" 
          value={formatCurrency(summary.totalCredit || 0)} 
          color="text-emerald-600" 
          bgColor="bg-emerald-50" 
        />
        <SummaryCard 
          icon={DollarSign} 
          label="Net Balance" 
          value={formatCurrency(summary.netBalance || 0)} 
          color={getStatusColor(summary.netBalance || 0)} 
          bgColor={(summary.netBalance || 0) > 0 ? 'bg-red-50' : (summary.netBalance || 0) < 0 ? 'bg-emerald-50' : 'bg-slate-50'}
        />
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm p-3 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-slate-400" />
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Search</label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search customers..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white w-40"
            />
            <button
              onClick={handleResetFilters}
              className="px-2 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>
          <div className="flex items-center gap-2 ml-auto text-[10px] text-slate-400">
            <span>Showing {filteredCustomers.length} customers</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gradient-to-r from-slate-50 to-indigo-50/30 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-3 py-2.5 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Debit</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Credit</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Outstanding</th>
                <th className="px-3 py-2.5 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Net Balance</th>
                <th className="px-3 py-2.5 text-center text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center">
                    <Loader2 size={20} className="animate-spin text-indigo-500 mx-auto" />
                    <p className="text-xs text-slate-400 mt-2">Loading...</p>
                  </td>
                </tr>
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    {filters.search ? 'No customers match your search' : 'No customers found'}
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((item, index) => {
                  const outstanding = (item.total_purchases || 0) - (item.total_paid || 0);
                  const netBalance = item.closing_balance || 0;
                  
                  return (
                    <tr key={item.customer_id || index} className="hover:bg-slate-50/70 transition-colors duration-200">
                      <td className="px-3 py-2.5 font-medium text-slate-700">
                        <div>
                          <p className="text-xs font-semibold">{item.customer_name || '-'}</p>
                          {item.email && (
                            <p className="text-[9px] text-slate-400 truncate max-w-[150px]">{item.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">
                        {item.phone || '-'}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium text-red-600">
                        {formatCurrency(item.total_purchases || 0)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium text-emerald-600">
                        {formatCurrency(item.total_paid || 0)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold rounded-full border ${getStatusBadgeColor(outstanding)}`}>
                          {formatCurrency(outstanding)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${getStatusColor(netBalance)}`}>
                          {netBalance > 0 ? <TrendingUp size={12} /> : netBalance < 0 ? <TrendingDown size={12} /> : null}
                          {formatCurrency(netBalance)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          onClick={() => setSelectedCustomer(item)}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
                          title="View Full Ledger"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredCustomers.length > pagination.pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <div className="text-[10px] text-slate-400">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredCustomers.length)} of {filteredCustomers.length} entries
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
                disabled={pagination.current === 1}
                className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-2 py-1 text-[10px] text-slate-600">
                {pagination.current} / {totalPages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
                disabled={pagination.current >= totalPages}
                className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}

// Summary Card Component
const SummaryCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${bgColor}`}>
        <Icon size={16} className={color} />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-medium">{label}</p>
        <p className={`text-sm font-bold ${color || 'text-slate-800'}`}>{value}</p>
      </div>
    </div>
  </div>
);

// Customer Detail Modal - FIXED to use ledger data
const CustomerDetailModal = ({ customer, onClose }) => {
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [ledgerSummary, setLedgerSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLedgerDetails();
  }, [customer]);

  const fetchLedgerDetails = async () => {
    setLoading(true);
    try {
      console.log('📊 Fetching ledger details for customer:', customer.customer_id);
      
      // ✅ Use the same API that the Ledger page uses
      const result = await api.getCustomerLedgerDetails(customer.customer_id);
      console.log('📊 Ledger details result:', result);
      
      if (result && result.success) {
        const data = result.data || {};
        setLedgerEntries(data.entries || []);
        setLedgerSummary(data.summary || {});
      }
    } catch (error) {
      console.error('Error fetching ledger details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '₨0.00';
    }
    return `₨${Number(value).toFixed(2)}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" 
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in relative">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center z-10">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Customer Ledger</h3>
            <p className="text-sm font-medium text-indigo-600">{customer.customer_name}</p>
            {customer.phone && (
              <p className="text-xs text-slate-400">{customer.phone}</p>
            )}
            {ledgerSummary && (
              <div className="flex gap-4 mt-1 text-xs">
                <span className="text-red-600">Debit: {formatCurrency(ledgerSummary.totalDebit || 0)}</span>
                <span className="text-emerald-600">Credit: {formatCurrency(ledgerSummary.totalCredit || 0)}</span>
                <span className={`font-bold ${(ledgerSummary.netBalance || 0) > 0 ? 'text-red-600' : (ledgerSummary.netBalance || 0) < 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                  Balance: {formatCurrency(ledgerSummary.netBalance || 0)}
                </span>
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 size={24} className="animate-spin text-indigo-500" />
            </div>
          ) : ledgerEntries.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No ledger entries found for this customer
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-2 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Reference</th>
                    <th className="px-4 py-2 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-2 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerEntries.map((entry, index) => (
                    <tr key={entry.id || index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2 text-slate-600">
                        {entry.date ? new Date(entry.date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-medium rounded-full border ${
                          entry.type === 'debit' 
                            ? 'bg-red-100 text-red-700 border-red-200' 
                            : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}>
                          {entry.type?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-slate-700">
                        {entry.description || '-'}
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {entry.reference_type ? (
                          <span className="capitalize">{entry.reference_type}</span>
                        ) : '-'}
                      </td>
                      <td className={`px-4 py-2 text-right font-medium ${entry.type === 'debit' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {entry.type === 'debit' ? '+' : '-'}{formatCurrency(entry.amount)}
                      </td>
                      <td className="px-4 py-2 text-right font-bold text-slate-800">
                        {formatCurrency(entry.calculated_balance || entry.balance_after || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};