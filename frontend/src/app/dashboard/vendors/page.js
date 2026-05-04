'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const demoVendors = [
  { id: 1, name: 'National Gas Suppliers', phone: '9812345670', email: 'national.gas@email.com', address: 'Gas Plant Road, Chandigarh', gstNumber: '04AABCN1234H1Z2', currentBalance: 15000 },
  { id: 2, name: 'Indo Welding Supplies', phone: '9812345671', email: null, address: 'Industrial Zone, Delhi', gstNumber: null, currentBalance: 0 },
  { id: 3, name: 'Punjab Gas Corporation', phone: '9812345672', email: 'punjab.gas@email.com', address: '56 Phase 2, Mohali', gstNumber: '04AABCP7890J1Z4', currentBalance: 42000 },
];

export default function VendorsPage() {
  const [search, setSearch] = useState('');

  const filtered = demoVendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) || v.phone.includes(search)
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Vendor Management</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your gas and equipment suppliers</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v12m6-6H6" /></svg>
          Add Vendor
        </button>
      </div>

      <input type="text" className="input-glass max-w-md text-sm" placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="glass-card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Vendor</th><th>Contact</th><th>GST Number</th><th>We Owe</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((v, i) => (
              <motion.tr key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600/30 to-pink-600/20 flex items-center justify-center text-sm font-bold text-purple-400 border border-purple-500/20">
                      {v.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{v.name}</p>
                      <p className="text-xs text-slate-500">{v.address}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <p className="text-sm">{v.phone}</p>
                  {v.email && <p className="text-xs text-slate-500">{v.email}</p>}
                </td>
                <td className="font-mono text-xs">{v.gstNumber || <span className="text-slate-600">—</span>}</td>
                <td>
                  <span className={`font-mono font-semibold ${v.currentBalance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    ₹{v.currentBalance.toLocaleString()}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button className="text-xs px-3 py-1.5 rounded-lg bg-purple-600/15 text-purple-400 border border-purple-500/20 hover:bg-purple-600/25 transition-all">Ledger</button>
                    <button className="text-slate-400 hover:text-blue-400 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
