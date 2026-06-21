'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const demoInventory = [
  { id: 1, itemName: 'Oxygen Cylinder (Medium)', itemType: 'gas_cylinder', gasType: 'Oxygen', quantityFull: 45, quantityEmpty: 12, reorderLevel: 10, unitPrice: 250, color: '#3b82f6' },
  { id: 2, itemName: 'CO2 Cylinder (Medium)', itemType: 'gas_cylinder', gasType: 'Carbon Dioxide', quantityFull: 30, quantityEmpty: 8, reorderLevel: 8, unitPrice: 300, color: '#8b5cf6' },
  { id: 3, itemName: 'Argon Cylinder (Large)', itemType: 'gas_cylinder', gasType: 'Argon', quantityFull: 15, quantityEmpty: 5, reorderLevel: 5, unitPrice: 800, color: '#06b6d4' },
  { id: 4, itemName: 'Nitrogen Cylinder (Medium)', itemType: 'gas_cylinder', gasType: 'Nitrogen', quantityFull: 25, quantityEmpty: 10, reorderLevel: 8, unitPrice: 200, color: '#10b981' },
  { id: 5, itemName: 'Welding Rod (Pack of 50)', itemType: 'welding_accessory', gasType: null, quantityFull: 0, quantityEmpty: 0, quantityTotal: 200, reorderLevel: 30, unitPrice: 450, color: '#f59e0b' },
  { id: 6, itemName: 'Gas Regulator (O2)', itemType: 'equipment', gasType: null, quantityFull: 0, quantityEmpty: 0, quantityTotal: 15, reorderLevel: 3, unitPrice: 2500, color: '#ec4899' },
  { id: 7, itemName: 'Welding Torch Set', itemType: 'equipment', gasType: null, quantityFull: 0, quantityEmpty: 0, quantityTotal: 8, reorderLevel: 2, unitPrice: 4500, color: '#f97316' },
];

const emptyItem = { itemName: '', itemType: 'gas_cylinder', quantityFull: 0, quantityEmpty: 0, quantityTotal: 0, reorderLevel: 5, unitPrice: 0, costPrice: 0 };

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative w-full max-w-lg glass-card p-0 overflow-hidden z-10">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
            <h2 className="text-lg font-display font-bold text-white">{title}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, children, required }) {
  return (<div className="mb-4"><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label} {required && <span className="text-red-400">*</span>}</label>{children}</div>);
}

export default function InventoryPage() {
  const [items, setItems] = useState(demoInventory);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState(emptyItem);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && data.data?.length) setItems(data.data.map(i => ({ ...i, gasType: i.gasType?.name || i.gasType, color: '#3b82f6' })));
    } catch { /* demo */ }
  }, [token]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = items.filter(item => {
    const matchSearch = item.itemName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || item.itemType === filter;
    return matchSearch && matchFilter;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numFields = ['quantityFull', 'quantityEmpty', 'quantityTotal', 'reorderLevel', 'unitPrice', 'costPrice'];
    setFormData(p => ({ ...p, [name]: numFields.includes(name) ? parseFloat(value) || 0 : value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.itemName || !formData.unitPrice) return toast.error('Name and unit price are required');
    setSaving(true);
    try {
      const res = await fetch('/api/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (data.success) { toast.success('Item added!'); setShowAddModal(false); setFormData(emptyItem); fetchItems(); }
      else toast.error(data.message || 'Failed');
    } catch {
      setItems(p => [{ ...formData, id: Date.now(), color: '#3b82f6' }, ...p]);
      toast.success('Item added (offline)'); setShowAddModal(false); setFormData(emptyItem);
    }
    setSaving(false);
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setFormData({ itemName: item.itemName, itemType: item.itemType, quantityFull: item.quantityFull || 0, quantityEmpty: item.quantityEmpty || 0, quantityTotal: item.quantityTotal || 0, reorderLevel: item.reorderLevel || 5, unitPrice: parseFloat(item.unitPrice) || 0, costPrice: parseFloat(item.costPrice) || 0 });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/inventory/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (data.success) { toast.success('Item updated!'); setShowEditModal(false); fetchItems(); }
      else toast.error(data.message || 'Failed');
    } catch {
      setItems(p => p.map(i => i.id === editId ? { ...i, ...formData } : i));
      toast.success('Item updated (offline)'); setShowEditModal(false);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/inventory/${deleteTarget.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { toast.success('Item deleted'); fetchItems(); }
      else toast.error(data.message || 'Failed');
    } catch {
      setItems(p => p.filter(i => i.id !== deleteTarget.id));
      toast.success('Item removed (offline)');
    }
    setShowDeleteModal(false); setDeleteTarget(null); setSaving(false);
  };

  const renderFormFields = () => (
    <>
      <Field label="Item Name" required>
        <input name="itemName" value={formData.itemName} onChange={handleChange} className="input-glass text-sm" placeholder="e.g. Oxygen Cylinder (Medium)" />
      </Field>
      <Field label="Item Type" required>
        <select name="itemType" value={formData.itemType} onChange={handleChange} className="input-glass text-sm">
          <option value="gas_cylinder">Gas Cylinder</option><option value="welding_accessory">Welding Accessory</option><option value="equipment">Equipment</option><option value="consumable">Consumable</option>
        </select>
      </Field>
      {formData.itemType === 'gas_cylinder' ? (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Quantity Full"><input name="quantityFull" type="number" min="0" value={formData.quantityFull} onChange={handleChange} className="input-glass text-sm" /></Field>
          <Field label="Quantity Empty"><input name="quantityEmpty" type="number" min="0" value={formData.quantityEmpty} onChange={handleChange} className="input-glass text-sm" /></Field>
        </div>
      ) : (
        <Field label="Total Quantity"><input name="quantityTotal" type="number" min="0" value={formData.quantityTotal} onChange={handleChange} className="input-glass text-sm" /></Field>
      )}
      <div className="grid grid-cols-3 gap-4">
        <Field label="Unit Price (₹)" required><input name="unitPrice" type="number" min="0" value={formData.unitPrice} onChange={handleChange} className="input-glass text-sm" /></Field>
        <Field label="Cost Price (₹)"><input name="costPrice" type="number" min="0" value={formData.costPrice} onChange={handleChange} className="input-glass text-sm" /></Field>
        <Field label="Reorder Level"><input name="reorderLevel" type="number" min="0" value={formData.reorderLevel} onChange={handleChange} className="input-glass text-sm" /></Field>
      </div>
    </>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e1e2e', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)' } }} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Inventory Management</h1>
          <p className="text-sm text-slate-400 mt-1">Track gas cylinders, welding accessories & equipment</p>
        </div>
        <button onClick={() => { setFormData(emptyItem); setShowAddModal(true); }} className="btn-primary flex items-center gap-2 text-sm" id="add-inventory-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v12m6-6H6" /></svg>
          Add Item
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input type="text" className="input-glass flex-1 max-w-md text-sm" placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex gap-2">
          {['all', 'gas_cylinder', 'welding_accessory', 'equipment'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${filter === f ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 border border-white/[0.06] hover:border-white/[0.15]'}`}>
              {f === 'all' ? 'All' : f.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Item</th><th>Type</th><th>Full Stock</th><th>Empty</th><th>Unit Price</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((item, i) => {
                const isGas = item.itemType === 'gas_cylinder';
                const stock = isGas ? item.quantityFull : (item.quantityTotal || 0);
                const isLow = stock <= item.reorderLevel;
                return (
                  <motion.tr key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${item.color || '#3b82f6'}20`, border: `1px solid ${item.color || '#3b82f6'}30` }}>
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color || '#3b82f6' }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{item.itemName}</p>
                          {item.gasType && <p className="text-xs text-slate-500">{typeof item.gasType === 'string' ? item.gasType : item.gasType.name}</p>}
                        </div>
                      </div>
                    </td>
                    <td><span className="text-xs px-2 py-1 rounded-lg border border-white/[0.08]" style={{ background: 'rgba(15,15,26,0.6)' }}>{item.itemType.replace(/_/g, ' ')}</span></td>
                    <td className="font-mono text-white font-semibold">{isGas ? item.quantityFull : (item.quantityTotal || 0)}</td>
                    <td className="font-mono text-slate-400">{isGas ? item.quantityEmpty : '-'}</td>
                    <td className="font-mono">₹{parseFloat(item.unitPrice) || 0}</td>
                    <td><span className={isLow ? 'badge badge-damaged' : 'badge badge-full'}>{isLow ? '⚠ Low Stock' : '✓ In Stock'}</span></td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-blue-400 transition-colors" title="Edit">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => { setDeleteTarget(item); setShowDeleteModal(true); }} className="text-slate-400 hover:text-red-400 transition-colors" title="Delete">
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

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Inventory Item">
        <form onSubmit={handleAdd}>{renderFormFields()}
          <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm">{saving ? 'Adding...' : 'Add Item'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Inventory Item">
        <form onSubmit={handleUpdate}>{renderFormFields()}
          <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
            <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm">{saving ? 'Updating...' : 'Update Item'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Item">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <p className="text-white font-medium mb-1">Delete "{deleteTarget?.itemName}"?</p>
          <p className="text-sm text-slate-400">This cannot be undone.</p>
        </div>
        <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
          <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] transition-all">Cancel</button>
          <button onClick={handleDelete} disabled={saving} className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 bg-red-600/15 border border-red-500/30 hover:bg-red-600/25 transition-all">{saving ? 'Deleting...' : 'Delete Item'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}
