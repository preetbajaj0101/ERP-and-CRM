'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const demoCylinders = [
  { id: 1, serialNumber: 'DG-O2-001', gasType: 'Oxygen', formula: 'O₂', status: 'full', size: 'medium', currentHolder: null, color: '#3b82f6', depositAmount: 5000 },
  { id: 2, serialNumber: 'DG-O2-002', gasType: 'Oxygen', formula: 'O₂', status: 'with_customer', size: 'large', currentHolder: 'Singh Manufacturing', color: '#3b82f6', depositAmount: 8000 },
  { id: 3, serialNumber: 'DG-O2-003', gasType: 'Oxygen', formula: 'O₂', status: 'empty', size: 'medium', currentHolder: null, color: '#3b82f6', depositAmount: 5000 },
  { id: 4, serialNumber: 'DG-CO2-001', gasType: 'Carbon Dioxide', formula: 'CO₂', status: 'full', size: 'medium', currentHolder: null, color: '#8b5cf6', depositAmount: 6000 },
  { id: 5, serialNumber: 'DG-CO2-002', gasType: 'Carbon Dioxide', formula: 'CO₂', status: 'in_refill', size: 'medium', currentHolder: null, color: '#8b5cf6', depositAmount: 6000 },
  { id: 6, serialNumber: 'DG-AR-001', gasType: 'Argon', formula: 'Ar', status: 'full', size: 'large', currentHolder: null, color: '#06b6d4', depositAmount: 10000 },
  { id: 7, serialNumber: 'DG-N2-001', gasType: 'Nitrogen', formula: 'N₂', status: 'with_customer', size: 'medium', currentHolder: 'Punjab Steel Fabricators', color: '#10b981', depositAmount: 4000 },
  { id: 8, serialNumber: 'DG-C2H2-001', gasType: 'Acetylene', formula: 'C₂H₂', status: 'damaged', size: 'small', currentHolder: null, color: '#f59e0b', depositAmount: 12000 },
];

const statusColors = {
  full: 'badge-full',
  empty: 'badge-empty',
  in_refill: 'badge-refill',
  with_customer: 'badge-customer',
  damaged: 'badge-damaged',
};

export default function CylindersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = demoCylinders.filter(c => {
    const matchSearch = c.serialNumber.toLowerCase().includes(search.toLowerCase()) || c.gasType.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = demoCylinders.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Cylinder Tracking</h1>
          <p className="text-sm text-slate-400 mt-1">Track every cylinder by serial number</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v12m6-6H6" /></svg>
          Register Cylinder
        </button>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries({ full: 'Full', empty: 'Empty', in_refill: 'In Refill', with_customer: 'With Customer', damaged: 'Damaged' }).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
            className={`glass-card p-4 text-center transition-all ${statusFilter === key ? 'border-blue-500/40' : ''}`}
          >
            <p className="text-2xl font-display font-bold text-white">{statusCounts[key] || 0}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        className="input-glass max-w-md text-sm"
        placeholder="Search by serial number or gas type..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((cyl, i) => (
          <motion.div
            key={cyl.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-mono text-xs font-bold"
                  style={{ background: `${cyl.color}20`, color: cyl.color, border: `1px solid ${cyl.color}30` }}
                >
                  {cyl.formula}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white font-mono">{cyl.serialNumber}</p>
                  <p className="text-xs text-slate-400">{cyl.gasType} • {cyl.size}</p>
                </div>
              </div>
              <span className={`badge ${statusColors[cyl.status]}`}>
                {cyl.status.replace('_', ' ')}
              </span>
            </div>

            {cyl.currentHolder && (
              <div className="mb-3 p-3 rounded-lg border border-white/[0.06]" style={{ background: 'rgba(15,15,26,0.5)' }}>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Current Holder</p>
                <p className="text-sm text-blue-400 font-medium">{cyl.currentHolder}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <p className="text-xs text-slate-500">Deposit: <span className="text-white font-mono">₹{cyl.depositAmount.toLocaleString()}</span></p>
              <div className="flex gap-2">
                {cyl.status === 'full' && (
                  <button className="text-xs px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition-all">
                    Assign
                  </button>
                )}
                {cyl.status === 'with_customer' && (
                  <button className="text-xs px-3 py-1.5 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/30 hover:bg-amber-600/30 transition-all">
                    Return
                  </button>
                )}
                {cyl.status === 'empty' && (
                  <button className="text-xs px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/30 transition-all">
                    Send Refill
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
