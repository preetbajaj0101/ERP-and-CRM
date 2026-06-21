'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const demoDeposits = [
  { id: 1, customer: { name: 'Singh Manufacturing' }, cylinder: { serialNumber: 'DG-O2-002' }, gasType: 'Oxygen', depositAmount: 8000, status: 'active', depositDate: '2026-04-15' },
  { id: 2, customer: { name: 'Punjab Steel Fabricators' }, cylinder: { serialNumber: 'DG-N2-001' }, gasType: 'Nitrogen', depositAmount: 4000, status: 'active', depositDate: '2026-04-20' },
  { id: 3, customer: { name: 'Kaur Welding Works' }, cylinder: { serialNumber: 'DG-CO2-003' }, gasType: 'CO2', depositAmount: 6000, status: 'refunded', depositDate: '2026-03-10', refundDate: '2026-04-28' },
  { id: 4, customer: { name: 'Gupta Engineering' }, cylinder: { serialNumber: 'DG-AR-002' }, gasType: 'Argon', depositAmount: 10000, status: 'active', depositDate: '2026-04-25' },
  { id: 5, customer: { name: 'Sharma Gas Agency' }, cylinder: { serialNumber: 'DG-O2-005' }, gasType: 'Oxygen', depositAmount: 5000, status: 'forfeited', depositDate: '2026-01-15' },
];

const statusColors = { active: 'badge-full', refunded: 'badge-customer', forfeited: 'badge-damaged' };

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

export default function DepositsPage() {
  const [deposits, setDeposits] = useState(demoDeposits);
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundTarget, setRefundTarget] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [cylinders, setCylinders] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customerId: '', cylinderId: '', depositAmount: 0, depositDate: new Date().toISOString().split('T')[0], notes: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [depRes, custRes, cylRes] = await Promise.allSettled([
        fetch('/api/deposits', { headers }), fetch('/api/customers', { headers }), fetch('/api/cylinders', { headers }),
      ]);
      if (depRes.status === 'fulfilled') { const d = await depRes.value.json(); if (d.success && d.data?.length) setDeposits(d.data.map(dep => ({ ...dep, gasType: dep.cylinder?.gasType?.name || 'Unknown' }))); }
      if (custRes.status === 'fulfilled') { const d = await custRes.value.json(); if (d.success) setCustomers(d.data); }
      if (cylRes.status === 'fulfilled') { const d = await cylRes.value.json(); if (d.success) setCylinders(d.data); }
    } catch { /* demo */ }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = deposits.filter(d => filter === 'all' || d.status === filter);
  const totalActive = deposits.filter(d => d.status === 'active').reduce((s, d) => s + (parseFloat(d.depositAmount) || 0), 0);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.customerId || !form.cylinderId || !form.depositAmount) return toast.error('Fill all required fields');
    setSaving(true);
    try {
      const res = await fetch('/api/deposits', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { toast.success('Deposit recorded!'); setShowAddModal(false); setForm({ customerId: '', cylinderId: '', depositAmount: 0, depositDate: new Date().toISOString().split('T')[0], notes: '' }); fetchData(); }
      else toast.error(data.message || 'Failed');
    } catch {
      const cust = customers.find(c => c.id === form.customerId);
      const cyl = cylinders.find(c => c.id === form.cylinderId);
      setDeposits(p => [{ ...form, id: Date.now(), customer: { name: cust?.name || 'Unknown' }, cylinder: { serialNumber: cyl?.serialNumber || '—' }, gasType: cyl?.gasType?.name || '—', status: 'active' }, ...p]);
      toast.success('Deposit recorded (offline)'); setShowAddModal(false);
    }
    setSaving(false);
  };

  const handleRefund = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/deposits/${refundTarget.id}/refund`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { toast.success('Deposit refunded!'); fetchData(); }
      else toast.error(data.message || 'Failed');
    } catch {
      setDeposits(p => p.map(d => d.id === refundTarget.id ? { ...d, status: 'refunded', refundDate: new Date().toISOString().split('T')[0] } : d));
      toast.success('Deposit refunded (offline)');
    }
    setShowRefundModal(false); setRefundTarget(null); setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e1e2e', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)' } }} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Security Deposits</h1>
          <p className="text-sm text-slate-400 mt-1">Manage cylinder security deposits</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 text-sm" id="record-deposit-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v12m6-6H6" /></svg>
          Record Deposit
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card glass-card-green p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Active Deposits</p>
          <p className="text-3xl font-display font-bold text-emerald-400">₹{totalActive.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">{deposits.filter(d => d.status === 'active').length} deposits</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Refunded</p>
          <p className="text-3xl font-display font-bold text-blue-400">{deposits.filter(d => d.status === 'refunded').length}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Forfeited</p>
          <p className="text-3xl font-display font-bold text-red-400">{deposits.filter(d => d.status === 'forfeited').length}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {['all', 'active', 'refunded', 'forfeited'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${filter === f ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 border border-white/[0.06]'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Customer</th><th>Cylinder</th><th>Gas Type</th><th>Amount</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((d, i) => (
              <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <td className="text-white font-medium">{d.customer?.name || 'Unknown'}</td>
                <td className="font-mono text-sm text-blue-400">{d.cylinder?.serialNumber || '—'}</td>
                <td>{d.gasType}</td>
                <td className="font-mono font-semibold text-white">₹{(parseFloat(d.depositAmount) || 0).toLocaleString()}</td>
                <td className="text-sm">{d.depositDate}</td>
                <td><span className={`badge ${statusColors[d.status]}`}>{d.status}</span></td>
                <td>
                  {d.status === 'active' && (
                    <button onClick={() => { setRefundTarget(d); setShowRefundModal(true); }} className="text-xs px-3 py-1.5 rounded-lg bg-amber-600/15 text-amber-400 border border-amber-500/20 hover:bg-amber-600/25 transition-all">Refund</button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Deposit Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Record Security Deposit">
        <form onSubmit={handleAdd}>
          <Field label="Customer" required>
            <select value={form.customerId} onChange={e => setForm(p => ({ ...p, customerId: e.target.value }))} className="input-glass text-sm">
              <option value="">Select customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Cylinder" required>
            <select value={form.cylinderId} onChange={e => setForm(p => ({ ...p, cylinderId: e.target.value }))} className="input-glass text-sm">
              <option value="">Select cylinder...</option>
              {cylinders.map(c => <option key={c.id} value={c.id}>{c.serialNumber} ({c.gasType?.name || 'Unknown'})</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Deposit Amount (₹)" required>
              <input type="number" min="0" value={form.depositAmount} onChange={e => setForm(p => ({ ...p, depositAmount: parseFloat(e.target.value) || 0 }))} className="input-glass text-sm" />
            </Field>
            <Field label="Deposit Date" required>
              <input type="date" value={form.depositDate} onChange={e => setForm(p => ({ ...p, depositDate: e.target.value }))} className="input-glass text-sm" />
            </Field>
          </div>
          <Field label="Notes">
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="input-glass text-sm min-h-[60px] resize-none" placeholder="Optional notes..." />
          </Field>
          <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm">{saving ? 'Recording...' : 'Record Deposit'}</button>
          </div>
        </form>
      </Modal>

      {/* Refund Modal */}
      <Modal open={showRefundModal} onClose={() => setShowRefundModal(false)} title="Refund Deposit">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5"><path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
          </div>
          <p className="text-white font-medium mb-1">Refund ₹{(parseFloat(refundTarget?.depositAmount) || 0).toLocaleString()}?</p>
          <p className="text-sm text-slate-400">Customer: {refundTarget?.customer?.name} • Cylinder: {refundTarget?.cylinder?.serialNumber}</p>
        </div>
        <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
          <button onClick={() => setShowRefundModal(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] transition-all">Cancel</button>
          <button onClick={handleRefund} disabled={saving} className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-amber-400 bg-amber-600/15 border border-amber-500/30 hover:bg-amber-600/25 transition-all">{saving ? 'Refunding...' : 'Confirm Refund'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}
