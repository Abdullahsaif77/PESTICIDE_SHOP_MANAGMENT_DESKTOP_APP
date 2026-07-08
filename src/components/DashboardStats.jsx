// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  RefreshCw, Loader2, Landmark, Users, ShoppingCart,
  Box, AlertCircle, CircleDollarSign, Package,
  TrendingUp, TrendingDown, Minus, Trophy
} from 'lucide-react';
import CountUp from 'react-countup';
import { format, subMonths, startOfMonth } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Line,
  Area, AreaChart, CartesianGrid, PieChart, Pie, Cell, Legend, LabelList,
  RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';

// NOTE: this file now depends on `framer-motion` in addition to the libraries
// already in use. Install it once with:
//   npm install framer-motion
// Everything else (recharts, react-countup, date-fns, lucide-react) was
// already a dependency.

const api = window.api || {};

// ==================== DESIGN TOKENS ====================
// A small "ledger" palette: deep ink for text, paper-white background, and
// three accent hues that map to the same meaning everywhere in the page
// (emerald = money in, amber = attention/stock, indigo = net position).
const TOKENS = {
  ink: '#0F172A',
  paper: '#F8FAF9',
  emerald: '#059669',
  emeraldSoft: '#10b981',
  amber: '#D97706',
  indigo: '#4F46E5',
  rose: '#E11D48',
};
const CATEGORY_COLORS = ['#059669', '#D97706', '#4F46E5', '#E11D48', '#0891B2', '#7C3AED'];

// --- Custom Icons for Top Cards (To match those svg wave shapes) ---
const GreenWave = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    <path d="M2 12L6 8L10 12L14 8L18 12L22 8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const RedWave = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    <path d="M2 12L6 16L10 12L14 16L18 12L22 16" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ==================== MOTION VARIANTS ====================
const makeVariants = (reduced) => ({
  container: {
    hidden: {},
    visible: { transition: { staggerChildren: reduced ? 0 : 0.07 } },
  },
  item: {
    hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  },
});

// ==================== SMALL SHARED PIECES ====================

// Tiny ambient sparkline drawn behind a hero card, using the same 6-month
// series the big charts use, so every number on the page traces back to one
// source of truth.
const MiniSparkline = ({ data, dataKey, gradId }) => (
  <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none opacity-90">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="#ffffff"
          strokeWidth={1.5}
          fill={`url(#${gradId})`}
          isAnimationActive
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// Month-over-month trend badge. `inverse` flips the good/bad color logic for
// metrics where "up" is not actually good (expenses).
const TrendBadge = ({ trend, inverse = false }) => {
  if (!trend || !Number.isFinite(trend.pct)) return null;
  const flat = Math.abs(trend.pct) < 0.5;
  const isUp = trend.direction === 'up';
  const Icon = flat ? Minus : isUp ? TrendingUp : TrendingDown;
  const good = inverse ? !isUp : isUp;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm ${
        flat ? 'bg-white/20 text-white/90' : good ? 'bg-white/30 text-white' : 'bg-black/25 text-white'
      }`}
    >
      <Icon size={11} />
      {Math.abs(trend.pct).toFixed(1)}% vs last month
    </span>
  );
};

const skeletonPulse = 'animate-pulse bg-slate-200/70 rounded-2xl';

export default function DashboardStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });

  const reduced = useReducedMotion();
  const V = useMemo(() => makeVariants(reduced), [reduced]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const result = await api.getDashboardData(dateRange.start, dateRange.end);
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.start, dateRange.end]);

  // ==================== HELPERS ====================
  const getTrend = (curr, prev) => {
    if (prev === undefined || prev === null || prev === 0) return null;
    const diff = (curr || 0) - prev;
    return { pct: (diff / Math.abs(prev)) * 100, direction: diff >= 0 ? 'up' : 'down' };
  };

  // ==================== DATA PROCESSING ====================
  const d = data?.summary || {};
  const inv = data?.inventory || {};
  const fin = data?.finance || {};
  const topProducts = data?.top_performers?.products || [];

  // --- Generate Last 6 Months Data for the Monthly Chart ---
  const sixMonthData = useMemo(() => {
    const months = [];
    const now = new Date();
    const chartMap = {};
    if (data?.chart_data) {
      data.chart_data.forEach((item) => {
        chartMap[item.month] = item; // Expecting backend to return "month" (e.g. "2026-01")
      });
    }

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthKey = format(date, 'yyyy-MM');
      const monthData = chartMap[monthKey];

      months.push({
        name: format(date, 'MMM yyyy'),
        revenue: monthData?.revenue || 0,
        expenses: monthData?.expenses || 0,
        profit: (monthData?.revenue || 0) - (monthData?.cogs || 0) - (monthData?.expenses || 0),
      });
    }
    return months;
  }, [data]);

  const revenueTrend = getTrend(sixMonthData[5]?.revenue, sixMonthData[4]?.revenue);
  const expenseTrend = getTrend(sixMonthData[5]?.expenses, sixMonthData[4]?.expenses);
  const profitTrend = getTrend(sixMonthData[5]?.profit, sixMonthData[4]?.profit);

  // --- Format Category Data for Donut Charts ---
  const categoryData = useMemo(() => {
    const categoryMap = {};
    topProducts.forEach((p) => {
      const name = p.category || p.name;
      if (!categoryMap[name]) categoryMap[name] = 0;
      categoryMap[name] += p.total_revenue;
    });
    return Object.keys(categoryMap).map((key) => ({ name: key, value: categoryMap[key] }));
  }, [topProducts]);

  const purchaseCategoryColors = useMemo(() => [...CATEGORY_COLORS].reverse(), []);

  // --- Stock health gauge (0-100, higher = healthier) ---
  const stockHealthPct = inv.total_products
    ? Math.max(0, Math.min(100, 100 - (inv.low_stock_items / inv.total_products) * 100))
    : 100;
  const gaugeColor = stockHealthPct > 70 ? TOKENS.emerald : stockHealthPct > 40 ? TOKENS.amber : TOKENS.rose;
  const gaugeData = [{ name: 'health', value: stockHealthPct, fill: gaugeColor }];

  const netProfit = d.net_profit;
  const isProfit = netProfit >= 0;

  // ==================== LOADING STATE (skeleton, not just a spinner) ====================
  if (loading && !data) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen font-sans">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <div className={`${skeletonPulse} h-7 w-40`} />
            <div className={`${skeletonPulse} h-4 w-56`} />
          </div>
          <div className={`${skeletonPulse} h-10 w-64`} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`${skeletonPulse} h-32`} />
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`${skeletonPulse} h-24`} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`${skeletonPulse} h-64 lg:col-span-2`} />
          <div className={`${skeletonPulse} h-64`} />
        </div>
        <div className="flex items-center gap-2 justify-center mt-8 text-slate-400 text-xs">
          <Loader2 size={14} className="animate-spin" />
          Crunching the numbers...
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <motion.div
      className="p-6 bg-slate-50 min-h-screen font-sans overflow-x-hidden"
      initial="hidden"
      animate="visible"
      variants={V.container}
    >
      {/* ===== TOP HEADER ===== */}
      <motion.div
        variants={V.item}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-emerald-700">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Overview of your shop performance</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider ml-1">From</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 w-[130px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">To</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 w-[130px]"
            />
          </div>
          <motion.button
            onClick={loadDashboard}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-100"
            title="Refresh Data"
          >
            <motion.span
              animate={loading ? { rotate: 360 } : { rotate: 0 }}
              transition={loading ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : { duration: 0.2 }}
              className="block"
            >
              <RefreshCw size={16} />
            </motion.span>
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div key={dateRange.start + dateRange.end} variants={V.container} initial="hidden" animate="visible">
          {/* ===== TOP 3 CARDS (GRADIENTS + SPARKLINES + TRENDS) ===== */}
          <div className="mb-8">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Profit &amp; Loss Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Sales - Green */}
              <motion.div
                variants={V.item}
                whileHover={reduced ? {} : { y: -4, transition: { duration: 0.2 } }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 p-6 text-white shadow-lg shadow-emerald-200/50 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="absolute right-0 top-0 opacity-10">
                  <GreenWave className="w-32 h-32 translate-x-10 -translate-y-10" />
                </div>
                <MiniSparkline data={sixMonthData} dataKey="revenue" gradId="spark-revenue" />
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-emerald-50/80 text-xs font-medium mb-1">TOTAL SALES</p>
                    <h3 className="text-3xl font-bold font-mono tabular-nums">
                      <CountUp start={0} end={d.total_revenue || 0} duration={1.5} separator="," prefix="Rs " />
                    </h3>
                    <p className="text-emerald-50/70 text-[10px] mt-1">{d.total_sales_count || 0} transactions</p>
                    <div className="mt-2"><TrendBadge trend={revenueTrend} /></div>
                  </div>
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <GreenWave className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>

              {/* Total Expenses - Red */}
              <motion.div
                variants={V.item}
                whileHover={reduced ? {} : { y: -4, transition: { duration: 0.2 } }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 p-6 text-white shadow-lg shadow-rose-200/50 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="absolute right-0 top-0 opacity-10">
                  <RedWave className="w-32 h-32 translate-x-10 -translate-y-10" />
                </div>
                <MiniSparkline data={sixMonthData} dataKey="expenses" gradId="spark-expenses" />
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-rose-50/80 text-xs font-medium mb-1">TOTAL EXPENSES</p>
                    <h3 className="text-3xl font-bold font-mono tabular-nums">
                      <CountUp start={0} end={d.total_expenses || 0} duration={1.5} separator="," prefix="Rs " />
                    </h3>
                    <p className="text-rose-50/70 text-[10px] mt-1">All time</p>
                    <div className="mt-2"><TrendBadge trend={expenseTrend} inverse /></div>
                  </div>
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <RedWave className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>

              {/* Net Profit - Blue/Purple */}
              <motion.div
                variants={V.item}
                whileHover={reduced ? {} : { y: -4, transition: { duration: 0.2 } }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 p-6 text-white shadow-lg shadow-purple-200/50 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="absolute right-0 top-0 opacity-10">
                  <Landmark size={120} className="translate-x-10 -translate-y-10" />
                </div>
                <MiniSparkline data={sixMonthData} dataKey="profit" gradId="spark-profit" />
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-indigo-50/80 text-xs font-medium mb-1">NET PROFIT</p>
                    <h3 className={`text-3xl font-bold font-mono tabular-nums ${!isProfit ? 'text-red-200' : ''}`}>
                      {isProfit ? 'Rs ' : '-Rs '}
                      <CountUp start={0} end={Math.abs(netProfit) || 0} duration={1.5} separator="," />
                    </h3>
                    <p className="text-indigo-50/70 text-[10px] mt-1">
                      {isProfit ? "You're in the green! \ud83d\udfe2" : "You're in the red! \ud83d\udd34"}
                    </p>
                    <div className="mt-2"><TrendBadge trend={profitTrend} /></div>
                  </div>
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Landmark size={20} className="text-white" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ===== OPERATIONS CARDS (WHITE) ===== */}
          <div className="mb-8">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Operations</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'TOTAL PRODUCTS', value: inv.total_products, sub: 'Active products', icon: Package, bg: 'bg-sky-100', fg: 'text-sky-600', prefix: '' },
                { label: 'LOW STOCK ITEMS', value: inv.low_stock_items, sub: 'Needs attention', icon: AlertCircle, bg: 'bg-red-100', fg: 'text-red-500', prefix: '' },
                { label: 'CUSTOMERS', value: fin.receivables, sub: 'Outstanding', icon: Users, bg: 'bg-purple-100', fg: 'text-purple-600', prefix: 'Rs ' },
                { label: "TODAY'S PURCHASES", value: d.total_cogs, sub: 'Cost of goods sold', icon: ShoppingCart, bg: 'bg-amber-100', fg: 'text-amber-600', prefix: 'Rs ' },
                { label: 'SUPPLIER PAYABLES', value: fin.payables, sub: 'Owed to suppliers', icon: CircleDollarSign, bg: 'bg-orange-100', fg: 'text-orange-600', prefix: 'Rs ' },
                { label: 'EXPIRING BATCHES', value: inv.expiring_batches, sub: 'Within 30 days', icon: Box, bg: 'bg-rose-100', fg: 'text-rose-500', prefix: '' },
              ].map((card) => (
                <motion.div
                  key={card.label}
                  variants={V.item}
                  whileHover={reduced ? {} : { y: -3, transition: { duration: 0.15 } }}
                  className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs font-medium text-slate-400">{card.label}</p>
                      <h4 className="text-xl font-bold text-slate-800 mt-1 font-mono tabular-nums">
                        <CountUp start={0} end={card.value || 0} duration={1} separator="," prefix={card.prefix} />
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{card.sub}</p>
                    </div>
                    <motion.div whileHover={reduced ? {} : { scale: 1.1, rotate: 5 }} className={`p-2 rounded-full ${card.bg} ${card.fg}`}>
                      <card.icon size={18} />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ===== CHARTS ROW 1: Overview + Stock Health Gauge ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* 6-Month Overview: bars + profit line combined */}
            <motion.div
              variants={V.item}
              className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200"
            >
              <h3 className="text-sm font-bold text-slate-700 mb-1">6-Month Overview</h3>
              <p className="text-[10px] text-slate-400 mb-4">Sales · Expenses · Net profit trendline</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={sixMonthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={TOKENS.emeraldSoft} stopOpacity={1} />
                        <stop offset="95%" stopColor={TOKENS.emeraldSoft} stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={TOKENS.rose} stopOpacity={1} />
                        <stop offset="95%" stopColor={TOKENS.rose} stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`Rs ${value.toLocaleString()}`, undefined]}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Bar dataKey="revenue" name="Sales" fill="url(#colorRevenue)" radius={[4, 4, 0, 0]} barSize={20} animationDuration={900} />
                    <Bar dataKey="expenses" name="Expenses" fill="url(#colorExpenses)" radius={[4, 4, 0, 0]} barSize={20} animationDuration={900} />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      name="Net Profit"
                      stroke={TOKENS.indigo}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: TOKENS.indigo }}
                      animationDuration={1200}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Stock Health Gauge */}
            <motion.div
              variants={V.item}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200 flex flex-col"
            >
              <h3 className="text-sm font-bold text-slate-700 mb-1">Stock Health</h3>
              <p className="text-[10px] text-slate-400 mb-2">Share of catalog above low-stock threshold</p>
              <div className="flex-1 relative h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="72%"
                    outerRadius="100%"
                    barSize={14}
                    data={gaugeData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={8} isAnimationActive animationDuration={1200} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold font-mono text-slate-800">
                    <CountUp end={stockHealthPct} duration={1.2} decimals={0} suffix="%" />
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">healthy</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 text-center mt-2">
                {inv.low_stock_items || 0} of {inv.total_products || 0} products running low
              </p>
            </motion.div>
          </div>

          {/* ===== CHARTS ROW 2: Profit Trend + Top Products ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Profit Trend Area Chart */}
            <motion.div
              variants={V.item}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200"
            >
              <h3 className="text-sm font-bold text-slate-700 mb-1">Profit Trend</h3>
              <p className="text-[10px] text-slate-400 mb-4">Net profit over 6 months</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sixMonthData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={TOKENS.indigo} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={TOKENS.indigo} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Net Profit']}
                    />
                    <Area type="monotone" dataKey="profit" stroke={TOKENS.indigo} strokeWidth={2} fill="url(#colorProfit)" animationDuration={1200} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Top Products */}
            <motion.div
              variants={V.item}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center gap-2 mb-1">
                <Trophy size={14} className="text-amber-500" />
                <h3 className="text-sm font-bold text-slate-700">Top Products</h3>
              </div>
              <p className="text-[10px] text-slate-400 mb-4">Best sellers by revenue, this period</p>
              <div className="h-64 w-full">
                {topProducts.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-xs text-slate-400">No product sales in this range</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[...topProducts].sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 6)}
                      layout="vertical"
                      margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={100}
                        tick={{ fontSize: 10, fill: '#475569' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Revenue']}
                      />
                      <Bar dataKey="total_revenue" radius={[0, 6, 6, 0]} fill={TOKENS.emeraldSoft} barSize={16} animationDuration={900}>
                        <LabelList
                          dataKey="total_revenue"
                          position="right"
                          formatter={(v) => `Rs ${Number(v).toLocaleString()}`}
                          style={{ fontSize: 10, fill: '#475569' }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          </div>

          {/* ===== BOTTOM CHARTS (Category Distribution) ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sales by Category - Donut Chart */}
            <motion.div
              variants={V.item}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200"
            >
              <h3 className="text-sm font-bold text-slate-700 mb-1">Sales by Category</h3>
              <p className="text-[10px] text-slate-400 mb-4">Revenue distribution across product categories</p>
              <div className="h-56 w-full flex flex-col items-center justify-center">
                {categoryData.length === 0 ? (
                  <p className="text-xs text-slate-400">No sales data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        isAnimationActive
                        animationDuration={900}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Revenue']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '10px', paddingLeft: '20px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>

            {/* Purchases by Category - Donut Chart */}
            <motion.div
              variants={V.item}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200"
            >
              <h3 className="text-sm font-bold text-slate-700 mb-1">Purchases by Category</h3>
              <p className="text-[10px] text-slate-400 mb-4">Purchase spend across product categories</p>
              <div className="h-56 w-full flex flex-col items-center justify-center">
                {categoryData.length === 0 ? (
                  <p className="text-xs text-slate-400">No purchase data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        isAnimationActive
                        animationDuration={900}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={purchaseCategoryColors[index % purchaseCategoryColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Spend']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '10px', paddingLeft: '20px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}