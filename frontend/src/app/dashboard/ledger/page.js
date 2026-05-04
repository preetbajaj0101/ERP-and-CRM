'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const demoLedger = {
  customer: { name: 'Singh Manufacturing', currentBalance: 950 },
  entries: [
    { id: 1, entryType: 'debit', amount: 2950, runningBalance: 2950, description: 'Sale - 10x Oxygen Cylinders', date: '2026-05-03' },
    { id: 2, entryType: 'credit', amount: 2000, runningBalance: 950, description: 'Payment received (UPI)', date: '2026-05-03' },
    { id: 3, entryType: 'debit', amount: 4500, runningBalance: 5450, description: 'Sale - 5x CO2 + Welding Rods', date: '2026-04-28' },
    { id: 4, entryType: 'credit', amount: 4500, runningBalance: 950, description: 'Payment received (Cash)', date: '2026-04-29' },
    { id: 5, entryType: 'debit', amount: 8000, runningBalance: 8950, description: 'Sale - 10x Nitrogen Cylinders', date: '2026-04-20' },
    { id: 6, entryType: 'credit', amount: 8000, runningBalance: 950, description: 'Payment received (Bank Transfer)', date: '2026-04-22' },
  ],
};

const demoOutstanding = [
  { id: 1, name: 'Gupta Engineering', phone: '9876543214', currentBalance: 28700 },
  { id: 2, name: 'Kaur Welding Works', phone: '9876543211', currentBalance: 12500 },
  { id: 3, name: 'Sharma Gas Agency', phone: '9876543213', currentBalance: 5200 },
  { id: 4, name: 'Singh Manufacturing', phone: '9876543210', currentBalance: 950 },
];

export default function LedgerPage() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [view, setView] = useState('outstanding');

  const totalOutstanding = demoOutstanding.reduce((s, c) => s + c.currentBalance, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Customer Ledger</h1>
        <p className="text-sm text-slate-400 mt-1">Track balances, payments, and outstanding amounts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card glass-card-amber p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Outstanding</p>
          <p className="text-3xl font-display font-bold text-amber-400">₹{totalOutstanding.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">{demoOutstanding.length} customers</p>
        </div>
        <div className="glass-card glass-card-green p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Collected This Month</p>
          <p className="text-3xl font-display font-bold text-emerald-400">₹1,87,500</p>
          <p className="text-xs text-slate-500 mt-1">42 payments</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Overdue (30+ days)</p>
          <p className="text-3xl font-display font-bold text-red-400">₹8,200</p>
          <p className="text-xs text-slate-500 mt-1">2 customers</p>
        </div>
      </div>

      {/* Tab Switch */}
      <div className="flex gap-2">
        <button onClick={() => setView('outstanding')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${view === 'outstanding' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 border border-white/[0.06]'}`}>
          Outstanding Balances
        </button>
        <button onClick={() => setView('ledger')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${view === 'ledger' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 border border-white/[0.06]'}`}>
          Account Ledger
        </button>
      </div>

      {view === 'outstanding' ? (
        <div className="glass-card overflow-hidden">
          <table className="data-table">
            <thead><tr><th>Customer</th><th>Phone</th><th>Outstanding Balance</th><th>Actions</th></tr></thead>
            <tbody>
              {demoOutstanding.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <td>
                    <p className="text-sm font-medium text-white">{c.name}</p>
                  </td>
                  <td className="font-mono text-sm">{c.phone}</td>
                  <td>
                    <span className="text-lg font-mono font-bold text-amber-400">₹{c.currentBalance.toLocaleString()}</span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedCustomer(c); setView('ledger'); }} className="text-xs px-3 py-1.5 rounded-lg bg-blue-600/15 text-blue-400 border border-blue-500/20 hover:bg-blue-600/25 transition-all">
                        View Ledger
                      </button>
                      <button className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/25 transition-all">
                        Record Payment
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">{demoLedger.customer.name}</h3>
              <p className="text-sm text-slate-400">Current Balance: <span className="text-amber-400 font-mono font-bold">₹{demoLedger.customer.currentBalance.toLocaleString()}</span></p>
            </div>
            <button onClick={() => setView('outstanding')} className="text-xs px-3 py-1.5 rounded-lg text-slate-400 border border-white/[0.08] hover:border-white/[0.15] transition-all">
              ← Back
            </button>
          </div>

          <div className="space-y-2">
            {demoLedger.entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06]"
                style={{ background: 'rgba(15,15,26,0.5)' }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    entry.entryType === 'debit' ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
                  }`}>
                    {entry.entryType === 'debit' ? '↑' : '↓'}
                  </div>
                  <div>
                    <p className="text-sm text-white">{entry.description}</p>
                    <p className="text-xs text-slate-500">{entry.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-mono font-semibold ${
                    entry.entryType === 'debit' ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {entry.entryType === 'debit' ? '+' : '-'}₹{entry.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">Bal: ₹{entry.runningBalance.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
