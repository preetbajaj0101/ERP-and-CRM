'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const emptyVendor = { name: '', phone: '', email: '', address: '', gstNumber: '' };

const demoVendors = [
  { id: 1, name: 'National Gas Suppliers', phone: '9812345670', email: 'national.gas@email.com', address: 'Gas Plant Road, Chandigarh', gstNumber: '04AABCN1234H1Z2', currentBalance: 15000 },
  { id: 2, name: 'Indo Welding Supplies', phone: '9812345671', email: null, address: 'Industrial Zone, Delhi', gstNumber: null, currentBalance: 0 },
  { id: 3, name: 'Punjab Gas Corporation', phone: '9812345672', email: 'punjab.gas@email.com', address: '56 Phase 2, Mohali', gstNumber: '04AABCP7890J1Z4', currentBalance: 42000 },
];

// ─── Modal Component ────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg glass-card p-0 overflow-hidden z-10">
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
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState(demoVendors);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState(emptyVendor);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchVendors = useCallback(async () => {
    try {
      const res = await fetch('/api/vendors', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && data.data.length > 0) setVendors(data.data);
    } catch { /* use demo */ }
  }, [token]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) || v.phone.includes(search)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return toast.error('Name and Phone are required');
    setSaving(true);
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Vendor added successfully!');
        setShowAddModal(false);
        setFormData(emptyVendor);
        fetchVendors();
      } else {
        toast.error(data.message || 'Failed to add vendor');
      }
    } catch {
      const newVendor = { ...formData, id: Date.now(), currentBalance: 0 };
      setVendors(prev => [newVendor, ...prev]);
      toast.success('Vendor added (offline mode)');
      setShowAddModal(false);
      setFormData(emptyVendor);
    }
    setSaving(false);
  };

  const handleEdit = (vendor) => {
    setEditId(vendor.id);
    setFormData({
      name: vendor.name, phone: vendor.phone,
      email: vendor.email || '', address: vendor.address || '', gstNumber: vendor.gstNumber || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return toast.error('Name and Phone are required');
    setSaving(true);
    try {
      const res = await fetch(`/api/vendors/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Vendor updated!');
        setShowEditModal(false);
        fetchVendors();
      } else {
        toast.error(data.message || 'Failed to update');
      }
    } catch {
      setVendors(prev => prev.map(v => v.id === editId ? { ...v, ...formData } : v));
      toast.success('Vendor updated (offline mode)');
      setShowEditModal(false);
    }
    setSaving(false);
  };

  const handleDeleteConfirm = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/vendors/${deleteTarget.id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Vendor deleted');
        fetchVendors();
      } else toast.error(data.message || 'Failed to delete');
    } catch {
      setVendors(prev => prev.filter(v => v.id !== deleteTarget.id));
      toast.success('Vendor removed (offline mode)');
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
    setSaving(false);
  };

  const renderFormFields = () => (
    <>
      <Field label="Vendor Name" required>
        <input name="name" value={formData.name} onChange={handleChange} className="input-glass text-sm" placeholder="e.g. National Gas Suppliers" />
      </Field>
      <Field label="Phone Number" required>
        <input name="phone" value={formData.phone} onChange={handleChange} className="input-glass text-sm" placeholder="e.g. 9812345670" />
      </Field>
      <Field label="Email">
        <input name="email" value={formData.email} onChange={handleChange} className="input-glass text-sm" placeholder="e.g. vendor@email.com" type="email" />
      </Field>
      <Field label="Address">
        <textarea name="address" value={formData.address} onChange={handleChange} className="input-glass text-sm min-h-[80px] resize-none" placeholder="Full address..." />
      </Field>
      <Field label="GST Number">
        <input name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="input-glass text-sm" placeholder="04AABCN1234H1Z2" />
      </Field>
    </>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e1e2e', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)' } }} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Vendor Management</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your gas and equipment suppliers</p>
        </div>
        <button onClick={() => { setFormData(emptyVendor); setShowAddModal(true); }} className="btn-primary flex items-center gap-2 text-sm" id="add-vendor-btn">
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
                  <span className={`font-mono font-semibold ${(parseFloat(v.currentBalance) || 0) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    ₹{(parseFloat(v.currentBalance) || 0).toLocaleString()}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <a href={`/dashboard/ledger?vendor=${v.id}`} className="text-xs px-3 py-1.5 rounded-lg bg-purple-600/15 text-purple-400 border border-purple-500/20 hover:bg-purple-600/25 transition-all">Ledger</a>
                    <button onClick={() => handleEdit(v)} className="text-slate-400 hover:text-blue-400 transition-colors" title="Edit vendor">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => { setDeleteTarget(v); setShowDeleteModal(true); }} className="text-slate-400 hover:text-red-400 transition-colors" title="Delete vendor">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Vendor">
        <form onSubmit={handleAdd}>
          {renderFormFields()}
          <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] hover:border-white/[0.15] transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm">{saving ? 'Saving...' : 'Add Vendor'}</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Vendor">
        <form onSubmit={handleUpdate}>
          {renderFormFields()}
          <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
            <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] hover:border-white/[0.15] transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm">{saving ? 'Saving...' : 'Update Vendor'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Vendor">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <p className="text-white font-medium mb-1">Delete "{deleteTarget?.name}"?</p>
          <p className="text-sm text-slate-400">This action cannot be undone.</p>
        </div>
        <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
          <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] hover:border-white/[0.15] transition-all">Cancel</button>
          <button onClick={handleDeleteConfirm} disabled={saving} className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 bg-red-600/15 border border-red-500/30 hover:bg-red-600/25 transition-all">{saving ? 'Deleting...' : 'Delete Vendor'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}
