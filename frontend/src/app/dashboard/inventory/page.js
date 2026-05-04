'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const demoInventory = [
  { id: 1, itemName: 'Oxygen Cylinder (Medium)', itemType: 'gas_cylinder', gasType: 'Oxygen', quantityFull: 45, quantityEmpty: 12, reorderLevel: 10, unitPrice: 250, color: '#3b82f6' },
  { id: 2, itemName: 'CO2 Cylinder (Medium)', itemType: 'gas_cylinder', gasType: 'Carbon Dioxide', quantityFull: 30, quantityEmpty: 8, reorderLevel: 8, unitPrice: 300, color: '#8b5cf6' },
  { id: 3, itemName: 'Argon Cylinder (Large)', itemType: 'gas_cylinder', gasType: 'Argon', quantityFull: 15, quantityEmpty: 5, reorderLevel: 5, unitPrice: 800, color: '#06b6d4' },
  { id: 4, itemName: 'Nitrogen Cylinder (Medium)', itemType: 'gas_cylinder', gasType: 'Nitrogen', quantityFull: 25, quantityEmpty: 10, reorderLevel: 8, unitPrice: 200, color: '#10b981' },
  { id: 5, itemName: 'Welding Rod (Pack of 50)', itemType: 'welding_accessory', gasType: null, quantityFull: 0, quantityEmpty: 0, quantityTotal: 200, reorderLevel: 30, unitPrice: 450, color: '#f59e0b' },
  { id: 6, itemName: 'Gas Regulator (O2)', itemType: 'equipment', gasType: null, quantityFull: 0, quantityEmpty: 0, quantityTotal: 15, reorderLevel: 3, unitPrice: 2500, color: '#ec4899' },
  { id: 7, itemName: 'Welding Torch Set', itemType: 'equipment', gasType: null, quantityFull: 0, quantityEmpty: 0, quantityTotal: 8, reorderLevel: 2, unitPrice: 4500, color: '#f97316' },
];

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const filtered = demoInventory.filter(item => {
    const matchSearch = item.itemName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || item.itemType === filter;
    return matchSearch && matchFilter;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Inventory Management</h1>
          <p className="text-sm text-slate-400 mt-1">Track gas cylinders, welding accessories & equipment</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v12m6-6H6" /></svg>
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          className="input-glass flex-1 max-w-md text-sm"
          placeholder="Search inventory..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {['all', 'gas_cylinder', 'welding_accessory', 'equipment'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 border border-white/[0.06] hover:border-white/[0.15]'
              }`}
            >
              {f === 'all' ? 'All' : f.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th>Full Stock</th>
                <th>Empty</th>
                <th>Unit Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => {
                const isGas = item.itemType === 'gas_cylinder';
                const stock = isGas ? item.quantityFull : item.quantityTotal;
                const isLow = stock <= item.reorderLevel;
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${item.color}20`, border: `1px solid ${item.color}30` }}>
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{item.itemName}</p>
                          {item.gasType && <p className="text-xs text-slate-500">{item.gasType}</p>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs px-2 py-1 rounded-lg border border-white/[0.08]" style={{ background: 'rgba(15,15,26,0.6)' }}>
                        {item.itemType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="font-mono text-white font-semibold">{isGas ? item.quantityFull : item.quantityTotal}</td>
                    <td className="font-mono text-slate-400">{isGas ? item.quantityEmpty : '-'}</td>
                    <td className="font-mono">₹{item.unitPrice}</td>
                    <td>
                      <span className={isLow ? 'badge badge-damaged' : 'badge badge-full'}>
                        {isLow ? '⚠ Low Stock' : '✓ In Stock'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="text-slate-400 hover:text-blue-400 transition-colors">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button className="text-slate-400 hover:text-red-400 transition-colors">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
