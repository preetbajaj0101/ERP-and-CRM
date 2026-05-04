'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const demoCustomers = [
  { id: 1, name: 'Singh Manufacturing', phone: '9876543210', email: 'singh.mfg@email.com', address: '123 Industrial Area, Ludhiana', gstNumber: '03AAACS1234F1Z5', currentBalance: 950, creditLimit: 50000 },
  { id: 2, name: 'Kaur Welding Works', phone: '9876543211', email: null, address: '45 Gill Road, Ludhiana', gstNumber: null, currentBalance: 12500, creditLimit: 30000 },
  { id: 3, name: 'Punjab Steel Fabricators', phone: '9876543212', email: 'punjab.steel@email.com', address: '78 Focal Point, Ludhiana', gstNumber: '03AABCP5678G1Z9', currentBalance: 0, creditLimit: 100000 },
  { id: 4, name: 'Sharma Gas Agency', phone: '9876543213', email: 'sharma.gas@email.com', address: '12 Main Market, Jalandhar', gstNumber: null, currentBalance: 5200, creditLimit: 25000 },
  { id: 5, name: 'Gupta Engineering', phone: '9876543214', email: null, address: '90 Industrial Zone, Amritsar', gstNumber: '03AABCG9012H1Z7', currentBalance: 28700, creditLimit: 75000 },
];

export default function CustomersPage() {
  const [search, setSearch] = useState('');

  const filtered = demoCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const totalOutstanding = demoCustomers.reduce((s, c) => s + c.currentBalance, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Customer Management</h1>
          <p className="text-sm text-slate-400 mt-1">{demoCustomers.length} customers • ₹{totalOutstanding.toLocaleString()} outstanding</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v12m6-6H6" /></svg>
          Add Customer
        </button>
      </div>

      <input
        type="text"
        className="input-glass max-w-md text-sm"
        placeholder="Search by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((customer, i) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600/30 to-cyan-600/20 flex items-center justify-center text-base font-bold text-blue-400 border border-blue-500/20">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{customer.name}</p>
                  <p className="text-xs text-slate-400">{customer.phone}</p>
                </div>
              </div>
            </div>

            {customer.email && <p className="text-xs text-slate-500 mb-2">📧 {customer.email}</p>}
            <p className="text-xs text-slate-500 mb-4">📍 {customer.address}</p>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Balance</p>
                <p className={`text-lg font-mono font-bold ${customer.currentBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  ₹{customer.currentBalance.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Credit Limit</p>
                <p className="text-sm font-mono text-slate-300">₹{customer.creditLimit.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <a href={`/dashboard/ledger?customer=${customer.id}`} className="flex-1 text-center text-xs px-3 py-2 rounded-lg bg-blue-600/15 text-blue-400 border border-blue-500/20 hover:bg-blue-600/25 transition-all">
                View Ledger
              </a>
              <button className="text-xs px-3 py-2 rounded-lg text-slate-400 border border-white/[0.08] hover:border-white/[0.15] transition-all">
                Edit
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
