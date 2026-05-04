'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const demoDeposits = [
  { id: 1, customer: 'Singh Manufacturing', cylinder: 'DG-O2-002', gasType: 'Oxygen', depositAmount: 8000, status: 'active', depositDate: '2026-04-15' },
  { id: 2, customer: 'Punjab Steel Fabricators', cylinder: 'DG-N2-001', gasType: 'Nitrogen', depositAmount: 4000, status: 'active', depositDate: '2026-04-20' },
  { id: 3, customer: 'Kaur Welding Works', cylinder: 'DG-CO2-003', gasType: 'CO2', depositAmount: 6000, status: 'refunded', depositDate: '2026-03-10', refundDate: '2026-04-28' },
  { id: 4, customer: 'Gupta Engineering', cylinder: 'DG-AR-002', gasType: 'Argon', depositAmount: 10000, status: 'active', depositDate: '2026-04-25' },
  { id: 5, customer: 'Sharma Gas Agency', cylinder: 'DG-O2-005', gasType: 'Oxygen', depositAmount: 5000, status: 'forfeited', depositDate: '2026-01-15' },
];

const statusColors = { active: 'badge-full', refunded: 'badge-customer', forfeited: 'badge-damaged' };

export default function DepositsPage() {
  const [filter, setFilter] = useState('all');

  const filtered = demoDeposits.filter(d => filter === 'all' || d.status === filter);
  const totalActive = demoDeposits.filter(d => d.status === 'active').reduce((s, d) => s + d.depositAmount, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Security Deposits</h1>
          <p className="text-sm text-slate-400 mt-1">Manage cylinder security deposits</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v12m6-6H6" /></svg>
          Record Deposit
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card glass-card-green p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Active Deposits</p>
          <p className="text-3xl font-display font-bold text-emerald-400">₹{totalActive.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">{demoDeposits.filter(d => d.status === 'active').length} deposits</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Refunded</p>
          <p className="text-3xl font-display font-bold text-blue-400">{demoDeposits.filter(d => d.status === 'refunded').length}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Forfeited</p>
          <p className="text-3xl font-display font-bold text-red-400">{demoDeposits.filter(d => d.status === 'forfeited').length}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'active', 'refunded', 'forfeited'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${filter === f ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 border border-white/[0.06]'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Deposit Table */}
      <div className="glass-card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Customer</th><th>Cylinder</th><th>Gas Type</th><th>Amount</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((d, i) => (
              <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <td className="text-white font-medium">{d.customer}</td>
                <td className="font-mono text-sm text-blue-400">{d.cylinder}</td>
                <td>{d.gasType}</td>
                <td className="font-mono font-semibold text-white">₹{d.depositAmount.toLocaleString()}</td>
                <td className="text-sm">{d.depositDate}</td>
                <td><span className={`badge ${statusColors[d.status]}`}>{d.status}</span></td>
                <td>
                  {d.status === 'active' && (
                    <button className="text-xs px-3 py-1.5 rounded-lg bg-amber-600/15 text-amber-400 border border-amber-500/20 hover:bg-amber-600/25 transition-all">
                      Refund
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
