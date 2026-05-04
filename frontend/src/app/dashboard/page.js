'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';

// Demo data for when API is not connected
const demoStats = {
  totalCustomers: 48,
  totalVendors: 12,
  totalCylinders: 156,
  cylindersByStatus: { full: 67, empty: 34, in_refill: 18, with_customer: 32, damaged: 5 },
  monthlySales: { total: 287500, count: 142 },
  outstanding: { total: 45200, count: 15 },
  lowStockCount: 3,
  salesTrend: [
    { date: '2026-04-27', total: 35000, count: 18 },
    { date: '2026-04-28', total: 42000, count: 22 },
    { date: '2026-04-29', total: 28000, count: 15 },
    { date: '2026-04-30', total: 51000, count: 28 },
    { date: '2026-05-01', total: 38000, count: 20 },
    { date: '2026-05-02', total: 46000, count: 24 },
    { date: '2026-05-03', total: 47500, count: 15 },
  ],
};

const inventoryData = [
  { name: 'Oxygen', full: 45, empty: 12, color: '#3b82f6' },
  { name: 'CO2', full: 30, empty: 8, color: '#8b5cf6' },
  { name: 'Argon', full: 15, empty: 5, color: '#06b6d4' },
  { name: 'Nitrogen', full: 25, empty: 10, color: '#10b981' },
  { name: 'Acetylene', full: 8, empty: 3, color: '#f59e0b' },
];

const PIE_COLORS = ['#10b981', '#64748b', '#f59e0b', '#3b82f6', '#ef4444'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function StatCard({ title, value, subtitle, icon, color, glowClass }) {
  return (
    <motion.div variants={itemVariants} className={`glass-card ${glowClass} p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-display font-bold text-white">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${color}30, ${color}15)`,
            border: `1px solid ${color}30`,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d={icon} />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs border border-white/10">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' && p.value > 999 ? `₹${(p.value / 1000).toFixed(1)}K` : p.value}
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(demoStats);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch {
        // Use demo data
      }
    };
    fetchStats();
  }, []);

  const cylinderPieData = Object.entries(stats.cylindersByStatus).map(([name, value]) => ({
    name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
  }));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      {/* Welcome Header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
          Welcome to <span className="brand-glow">Dashmesh Gases</span>
        </h1>
        <p className="text-slate-400 text-sm">Here's your business overview for today</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Monthly Sales"
          value={`₹${(stats.monthlySales.total / 1000).toFixed(1)}K`}
          subtitle={`${stats.monthlySales.count} transactions`}
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          color="#10b981"
          glowClass="glass-card-green"
        />
        <StatCard
          title="Cylinders"
          value={stats.totalCylinders}
          subtitle={`${stats.cylindersByStatus.full || 0} full, ${stats.cylindersByStatus.empty || 0} empty`}
          icon="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
          color="#3b82f6"
          glowClass=""
        />
        <StatCard
          title="Outstanding"
          value={`₹${(stats.outstanding.total / 1000).toFixed(1)}K`}
          subtitle={`${stats.outstanding.count} customers`}
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          color="#f59e0b"
          glowClass="glass-card-amber"
        />
        <StatCard
          title="Low Stock Alert"
          value={stats.lowStockCount}
          subtitle="Items below reorder level"
          icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          color="#ef4444"
          glowClass=""
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend */}
        <motion.div variants={itemVariants} className="glass-card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-1">Sales Trend (Last 7 Days)</h3>
          <p className="text-xs text-slate-500 mb-4">Revenue overview</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.salesTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => v.split('-').slice(1).join('/')} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `₹${v/1000}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="url(#salesGrad)" strokeWidth={2} name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Cylinder Status Pie */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-1">Cylinder Status</h3>
          <p className="text-xs text-slate-500 mb-4">Distribution overview</p>
          <div className="h-[280px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cylinderPieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {cylinderPieData.map((entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-slate-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Inventory & Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gas Stock Levels */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-1">Gas Stock Levels</h3>
          <p className="text-xs text-slate-500 mb-4">Full vs Empty cylinders by gas type</p>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="full" fill="#10b981" name="Full" radius={[4,4,0,0]} />
                <Bar dataKey="empty" fill="#64748b" name="Empty" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-1">Quick Actions</h3>
          <p className="text-xs text-slate-500 mb-4">Frequently used operations</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'New Sale', href: '/dashboard/transactions', color: '#10b981', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
              { label: 'New Purchase', href: '/dashboard/transactions', color: '#3b82f6', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z' },
              { label: 'Add Customer', href: '/dashboard/customers', color: '#8b5cf6', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
              { label: 'Check Ledger', href: '/dashboard/ledger', color: '#f59e0b', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
              { label: 'Track Cylinder', href: '/dashboard/cylinders', color: '#06b6d4', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
              { label: 'View Deposits', href: '/dashboard/deposits', color: '#ec4899', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.15] transition-all duration-300 group"
                style={{ background: 'rgba(15,15,26,0.6)' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${action.color}25, ${action.color}10)`,
                    border: `1px solid ${action.color}30`,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={action.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={action.icon} />
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                  {action.label}
                </span>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
