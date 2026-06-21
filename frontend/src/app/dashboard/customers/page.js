'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const emptyCustomer = { name: '', phone: '', email: '', address: '', gstNumber: '', creditLimit: 0 };

const demoCustomers = [
  { id: 1, name: 'Singh Manufacturing', phone: '9876543210', email: 'singh.mfg@email.com', address: '123 Industrial Area, Ludhiana', gstNumber: '03AAACS1234F1Z5', currentBalance: 950, creditLimit: 50000 },
  { id: 2, name: 'Kaur Welding Works', phone: '9876543211', email: null, address: '45 Gill Road, Ludhiana', gstNumber: null, currentBalance: 12500, creditLimit: 30000 },
  { id: 3, name: 'Punjab Steel Fabricators', phone: '9876543212', email: 'punjab.steel@email.com', address: '78 Focal Point, Ludhiana', gstNumber: '03AABCP5678G1Z9', currentBalance: 0, creditLimit: 100000 },
  { id: 4, name: 'Sharma Gas Agency', phone: '9876543213', email: 'sharma.gas@email.com', address: '12 Main Market, Jalandhar', gstNumber: null, currentBalance: 5200, creditLimit: 25000 },
  { id: 5, name: 'Gupta Engineering', phone: '9876543214', email: null, address: '90 Industrial Zone, Amritsar', gstNumber: '03AABCG9012H1Z7', currentBalance: 28700, creditLimit: 75000 },
];

// ─── Modal Component ────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg glass-card p-0 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
            <h2 className="text-lg font-display font-bold text-white">{title}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          {/* Content */}
          <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Form Field ─────────────────────────────────────────────
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState(demoCustomers);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState(emptyCustomer);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // ─── Fetch Customers ────────────────────────────────────
  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch('/api/customers', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && data.data.length > 0) setCustomers(data.data);
    } catch { /* use demo */ }
  }, [token]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const totalOutstanding = customers.reduce((s, c) => s + (parseFloat(c.currentBalance) || 0), 0);

  // ─── Handlers ───────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'creditLimit' ? parseFloat(value) || 0 : value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return toast.error('Name and Phone are required');
    setSaving(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Customer added successfully!');
        setShowAddModal(false);
        setFormData(emptyCustomer);
        fetchCustomers();
      } else {
        toast.error(data.message || 'Failed to add customer');
      }
    } catch (err) {
      // Fallback: add to local demo list
      const newCustomer = { ...formData, id: Date.now(), currentBalance: 0 };
      setCustomers(prev => [newCustomer, ...prev]);
      toast.success('Customer added (offline mode)');
      setShowAddModal(false);
      setFormData(emptyCustomer);
    }
    setSaving(false);
  };

  const handleEdit = (customer) => {
    setEditId(customer.id);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      gstNumber: customer.gstNumber || '',
      creditLimit: customer.creditLimit || 0,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return toast.error('Name and Phone are required');
    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Customer updated!');
        setShowEditModal(false);
        fetchCustomers();
      } else {
        toast.error(data.message || 'Failed to update');
      }
    } catch {
      // Fallback offline
      setCustomers(prev => prev.map(c => c.id === editId ? { ...c, ...formData } : c));
      toast.success('Customer updated (offline mode)');
      setShowEditModal(false);
    }
    setSaving(false);
  };

  const handleDeleteConfirm = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Customer deleted');
        fetchCustomers();
      } else {
        toast.error(data.message || 'Failed to delete');
      }
    } catch {
      setCustomers(prev => prev.filter(c => c.id !== deleteTarget.id));
      toast.success('Customer removed (offline mode)');
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
    setSaving(false);
  };

  // ─── Customer Form Fields (reused in add/edit) ──────────
  const renderFormFields = () => (
    <>
      <Field label="Customer Name" required>
        <input name="name" value={formData.name} onChange={handleChange} className="input-glass text-sm" placeholder="e.g. Singh Manufacturing" />
      </Field>
      <Field label="Phone Number" required>
        <input name="phone" value={formData.phone} onChange={handleChange} className="input-glass text-sm" placeholder="e.g. 9876543210" />
      </Field>
      <Field label="Email">
        <input name="email" value={formData.email} onChange={handleChange} className="input-glass text-sm" placeholder="e.g. contact@company.com" type="email" />
      </Field>
      <Field label="Address">
        <textarea name="address" value={formData.address} onChange={handleChange} className="input-glass text-sm min-h-[80px] resize-none" placeholder="Full address..." />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="GST Number">
          <input name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="input-glass text-sm" placeholder="03AAACS1234F1Z5" />
        </Field>
        <Field label="Credit Limit (₹)">
          <input name="creditLimit" type="number" value={formData.creditLimit} onChange={handleChange} className="input-glass text-sm" placeholder="50000" />
        </Field>
      </div>
    </>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e1e2e', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)' } }} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Customer Management</h1>
          <p className="text-sm text-slate-400 mt-1">{customers.length} customers • ₹{totalOutstanding.toLocaleString()} outstanding</p>
        </div>
        <button
          onClick={() => { setFormData(emptyCustomer); setShowAddModal(true); }}
          className="btn-primary flex items-center gap-2 text-sm"
          id="add-customer-btn"
        >
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
              {/* Delete button */}
              <button
                onClick={() => { setDeleteTarget(customer); setShowDeleteModal(true); }}
                className="text-slate-500 hover:text-red-400 transition-colors p-1"
                title="Delete customer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>

            {customer.email && <p className="text-xs text-slate-500 mb-2">📧 {customer.email}</p>}
            <p className="text-xs text-slate-500 mb-4">📍 {customer.address}</p>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Balance</p>
                <p className={`text-lg font-mono font-bold ${(parseFloat(customer.currentBalance) || 0) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  ₹{(parseFloat(customer.currentBalance) || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Credit Limit</p>
                <p className="text-sm font-mono text-slate-300">₹{(parseFloat(customer.creditLimit) || 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <a href={`/dashboard/ledger?customer=${customer.id}`} className="flex-1 text-center text-xs px-3 py-2 rounded-lg bg-blue-600/15 text-blue-400 border border-blue-500/20 hover:bg-blue-600/25 transition-all">
                View Ledger
              </a>
              <button
                onClick={() => handleEdit(customer)}
                className="text-xs px-3 py-2 rounded-lg text-slate-400 border border-white/[0.08] hover:border-white/[0.15] hover:text-blue-400 transition-all"
              >
                Edit
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── Add Customer Modal ──────────────────────────── */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Customer">
        <form onSubmit={handleAdd}>
          {renderFormFields()}
          <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] hover:border-white/[0.15] transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm">
              {saving ? 'Saving...' : 'Add Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Edit Customer Modal ─────────────────────────── */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Customer">
        <form onSubmit={handleUpdate}>
          {renderFormFields()}
          <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
            <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] hover:border-white/[0.15] transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm">
              {saving ? 'Saving...' : 'Update Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── Delete Confirmation Modal ───────────────────── */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Customer">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <p className="text-white font-medium mb-1">Delete "{deleteTarget?.name}"?</p>
          <p className="text-sm text-slate-400">This action cannot be undone. All associated ledger entries will be affected.</p>
        </div>
        <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
          <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] hover:border-white/[0.15] transition-all">
            Cancel
          </button>
          <button onClick={handleDeleteConfirm} disabled={saving} className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 bg-red-600/15 border border-red-500/30 hover:bg-red-600/25 transition-all">
            {saving ? 'Deleting...' : 'Delete Customer'}
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}
