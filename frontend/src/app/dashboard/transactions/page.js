'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const demoTransactions = [
  { id: 1, type: 'sale', party: 'Singh Manufacturing', grandTotal: 2950, paidAmount: 2000, paymentStatus: 'partial', paymentMethod: 'upi', date: '2026-05-03', items: '10x Oxygen Cylinder' },
  { id: 2, type: 'sale', party: 'Kaur Welding Works', grandTotal: 4500, paidAmount: 4500, paymentStatus: 'paid', paymentMethod: 'cash', date: '2026-05-02', items: '5x CO2 + Welding Rods' },
  { id: 3, type: 'purchase', party: 'National Gas Suppliers', grandTotal: 15000, paidAmount: 0, paymentStatus: 'unpaid', paymentMethod: 'credit', date: '2026-05-02', items: '20x Oxygen, 10x Argon' },
  { id: 4, type: 'sale', party: 'Gupta Engineering', grandTotal: 8400, paidAmount: 5000, paymentStatus: 'partial', paymentMethod: 'bank_transfer', date: '2026-05-01', items: '3x Argon + Regulator' },
  { id: 5, type: 'return', party: 'Punjab Steel Fabricators', grandTotal: 0, paidAmount: 0, paymentStatus: 'paid', paymentMethod: null, date: '2026-04-30', items: '2x Empty O2 cylinders returned' },
  { id: 6, type: 'sale', party: 'Sharma Gas Agency', grandTotal: 12500, paidAmount: 12500, paymentStatus: 'paid', paymentMethod: 'upi', date: '2026-04-29', items: '25x Nitrogen' },
];

const typeColors = { sale: '#10b981', purchase: '#3b82f6', return: '#f59e0b', refill: '#8b5cf6' };

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = demoTransactions.filter(t => typeFilter === 'all' || t.type === typeFilter);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Transactions</h1>
          <p className="text-sm text-slate-400 mt-1">Sales, purchases, returns & refills</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary flex items-center gap-2 text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v12m6-6H6" /></svg>
            New Sale
          </button>
          <button className="px-4 py-3 rounded-xl font-semibold text-sm text-blue-400 border border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/20 transition-all">
            New Purchase
          </button>
        </div>
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'sale', 'purchase', 'return'].map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              typeFilter === t
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 border border-white/[0.06] hover:border-white/[0.15]'
            }`}
          >
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {filtered.map((txn, i) => (
          <motion.div
            key={txn.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${typeColors[txn.type]}20`, border: `1px solid ${typeColors[txn.type]}30` }}
                >
                  {txn.type === 'sale' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={typeColors[txn.type]} strokeWidth="1.5"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                  {txn.type === 'purchase' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={typeColors[txn.type]} strokeWidth="1.5"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4m6 11a1 1 0 100 2 1 1 0 000-2zm7 0a1 1 0 100 2 1 1 0 000-2z" /></svg>}
                  {txn.type === 'return' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={typeColors[txn.type]} strokeWidth="1.5"><path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{txn.party}</p>
                  <p className="text-xs text-slate-500">{txn.items}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-lg font-mono font-bold text-white">₹{txn.grandTotal.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">{txn.date}</p>
                </div>
                <div className="text-right">
                  <span className={`badge badge-${txn.paymentStatus}`}>
                    {txn.paymentStatus}
                  </span>
                  {txn.paymentMethod && (
                    <p className="text-[10px] text-slate-500 mt-1 uppercase">{txn.paymentMethod.replace('_', ' ')}</p>
                  )}
                </div>
                <button className="text-slate-400 hover:text-white transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
