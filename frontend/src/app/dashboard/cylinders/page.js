'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const demoCylinders = [
  { id: 1, serialNumber: 'DG-O2-001', gasType: { name: 'Oxygen', formula: 'O₂' }, status: 'full', size: 'medium', currentHolder: null, color: '#3b82f6', depositAmount: 5000 },
  { id: 2, serialNumber: 'DG-O2-002', gasType: { name: 'Oxygen', formula: 'O₂' }, status: 'with_customer', size: 'large', currentHolder: { name: 'Singh Manufacturing' }, color: '#3b82f6', depositAmount: 8000 },
  { id: 3, serialNumber: 'DG-O2-003', gasType: { name: 'Oxygen', formula: 'O₂' }, status: 'empty', size: 'medium', currentHolder: null, color: '#3b82f6', depositAmount: 5000 },
  { id: 4, serialNumber: 'DG-CO2-001', gasType: { name: 'CO2', formula: 'CO₂' }, status: 'full', size: 'medium', currentHolder: null, color: '#8b5cf6', depositAmount: 6000 },
  { id: 5, serialNumber: 'DG-CO2-002', gasType: { name: 'CO2', formula: 'CO₂' }, status: 'in_refill', size: 'medium', currentHolder: null, color: '#8b5cf6', depositAmount: 6000 },
  { id: 6, serialNumber: 'DG-AR-001', gasType: { name: 'Argon', formula: 'Ar' }, status: 'full', size: 'large', currentHolder: null, color: '#06b6d4', depositAmount: 10000 },
  { id: 7, serialNumber: 'DG-N2-001', gasType: { name: 'Nitrogen', formula: 'N₂' }, status: 'with_customer', size: 'medium', currentHolder: { name: 'Punjab Steel Fabricators' }, color: '#10b981', depositAmount: 4000 },
  { id: 8, serialNumber: 'DG-C2H2-001', gasType: { name: 'Acetylene', formula: 'C₂H₂' }, status: 'damaged', size: 'small', currentHolder: null, color: '#f59e0b', depositAmount: 12000 },
];

const statusColors = { full: 'badge-full', empty: 'badge-empty', in_refill: 'badge-refill', with_customer: 'badge-customer', damaged: 'badge-damaged' };
const gasColors = { Oxygen: '#3b82f6', 'Carbon Dioxide': '#8b5cf6', CO2: '#8b5cf6', Argon: '#06b6d4', Nitrogen: '#10b981', Acetylene: '#f59e0b' };

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

export default function CylindersPage() {
  const [cylinders, setCylinders] = useState(demoCylinders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gasTypes, setGasTypes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [selectedCylinder, setSelectedCylinder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [registerForm, setRegisterForm] = useState({ serialNumber: '', gasTypeId: '', size: 'medium', status: 'full', depositAmount: 0 });
  const [assignCustomerId, setAssignCustomerId] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [cylRes, custRes] = await Promise.allSettled([
        fetch('/api/cylinders', { headers }), fetch('/api/customers', { headers }),
      ]);
      if (cylRes.status === 'fulfilled') {
        const d = await cylRes.value.json();
        if (d.success && d.data?.length) setCylinders(d.data.map(c => ({ ...c, color: gasColors[c.gasType?.name] || '#3b82f6' })));
        // Extract gas types from cylinders or make separate call
        const gtSet = new Map();
        (d.success ? d.data : []).forEach(c => { if (c.gasType) gtSet.set(c.gasType.id || c.gasTypeId, c.gasType); });
        if (gtSet.size > 0) setGasTypes(Array.from(gtSet.values()));
      }
      if (custRes.status === 'fulfilled') { const d = await custRes.value.json(); if (d.success) setCustomers(d.data); }
    } catch { /* demo */ }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = cylinders.filter(c => {
    const matchSearch = c.serialNumber.toLowerCase().includes(search.toLowerCase()) || (c.gasType?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = cylinders.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {});

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerForm.serialNumber || !registerForm.gasTypeId) return toast.error('Serial number and gas type are required');
    setSaving(true);
    try {
      const res = await fetch('/api/cylinders', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      if (data.success) { toast.success('Cylinder registered!'); setShowRegisterModal(false); setRegisterForm({ serialNumber: '', gasTypeId: '', size: 'medium', status: 'full', depositAmount: 0 }); fetchData(); }
      else toast.error(data.message || 'Failed');
    } catch {
      toast.success('Cylinder registered (offline)');
      setCylinders(p => [{ ...registerForm, id: Date.now(), gasType: gasTypes.find(g => g.id === registerForm.gasTypeId) || { name: 'Unknown', formula: '?' }, currentHolder: null, color: '#3b82f6' }, ...p]);
      setShowRegisterModal(false);
    }
    setSaving(false);
  };

  const handleAssign = async () => {
    if (!assignCustomerId) return toast.error('Select a customer');
    setSaving(true);
    try {
      const res = await fetch(`/api/cylinders/${selectedCylinder.id}/assign`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customerId: assignCustomerId }),
      });
      const data = await res.json();
      if (data.success) { toast.success('Cylinder assigned!'); fetchData(); }
      else toast.error(data.message || 'Failed');
    } catch {
      setCylinders(p => p.map(c => c.id === selectedCylinder.id ? { ...c, status: 'with_customer', currentHolder: customers.find(x => x.id === assignCustomerId) } : c));
      toast.success('Cylinder assigned (offline)');
    }
    setShowAssignModal(false); setAssignCustomerId(''); setSaving(false);
  };

  const handleReturn = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/cylinders/${selectedCylinder.id}/return`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) { toast.success('Cylinder returned!'); fetchData(); }
      else toast.error(data.message || 'Failed');
    } catch {
      setCylinders(p => p.map(c => c.id === selectedCylinder.id ? { ...c, status: 'empty', currentHolder: null } : c));
      toast.success('Cylinder returned (offline)');
    }
    setShowReturnModal(false); setSaving(false);
  };

  const handleSendRefill = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/cylinders/${selectedCylinder.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'in_refill' }),
      });
      const data = await res.json();
      if (data.success) { toast.success('Sent for refill!'); fetchData(); }
      else toast.error(data.message || 'Failed');
    } catch {
      setCylinders(p => p.map(c => c.id === selectedCylinder.id ? { ...c, status: 'in_refill' } : c));
      toast.success('Sent for refill (offline)');
    }
    setShowRefillModal(false); setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e1e2e', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)' } }} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Cylinder Tracking</h1>
          <p className="text-sm text-slate-400 mt-1">Track every cylinder by serial number</p>
        </div>
        <button onClick={() => setShowRegisterModal(true)} className="btn-primary flex items-center gap-2 text-sm" id="register-cylinder-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v12m6-6H6" /></svg>
          Register Cylinder
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries({ full: 'Full', empty: 'Empty', in_refill: 'In Refill', with_customer: 'With Customer', damaged: 'Damaged' }).map(([key, label]) => (
          <button key={key} onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)} className={`glass-card p-4 text-center transition-all ${statusFilter === key ? 'border-blue-500/40' : ''}`}>
            <p className="text-2xl font-display font-bold text-white">{statusCounts[key] || 0}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </button>
        ))}
      </div>

      <input type="text" className="input-glass max-w-md text-sm" placeholder="Search by serial number or gas type..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((cyl, i) => (
          <motion.div key={cyl.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-mono text-xs font-bold" style={{ background: `${cyl.color}20`, color: cyl.color, border: `1px solid ${cyl.color}30` }}>
                  {cyl.gasType?.formula || '?'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white font-mono">{cyl.serialNumber}</p>
                  <p className="text-xs text-slate-400">{cyl.gasType?.name || 'Unknown'} • {cyl.size}</p>
                </div>
              </div>
              <span className={`badge ${statusColors[cyl.status]}`}>{cyl.status.replace('_', ' ')}</span>
            </div>
            {cyl.currentHolder && (
              <div className="mb-3 p-3 rounded-lg border border-white/[0.06]" style={{ background: 'rgba(15,15,26,0.5)' }}>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Current Holder</p>
                <p className="text-sm text-blue-400 font-medium">{cyl.currentHolder.name || cyl.currentHolder}</p>
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <p className="text-xs text-slate-500">Deposit: <span className="text-white font-mono">₹{(parseFloat(cyl.depositAmount) || 0).toLocaleString()}</span></p>
              <div className="flex gap-2 flex-wrap">
                {cyl.status === 'full' && (
                  <button onClick={() => { setSelectedCylinder(cyl); setShowAssignModal(true); }} className="text-xs px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition-all">Assign</button>
                )}
                {cyl.status === 'with_customer' && (
                  <button onClick={() => { setSelectedCylinder(cyl); setShowReturnModal(true); }} className="text-xs px-3 py-1.5 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/30 hover:bg-amber-600/30 transition-all">Return</button>
                )}
                {cyl.status === 'empty' && (
                  <button onClick={() => { setSelectedCylinder(cyl); setShowRefillModal(true); }} className="text-xs px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/30 transition-all">Send Refill</button>
                )}
                {cyl.status !== 'damaged' && cyl.status !== 'retired' && (
                  <a href={`/dashboard/damage-reports?cylinder=${cyl.serialNumber}`} className="text-xs px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 transition-all">Report Damage</a>
                )}
                {cyl.status === 'damaged' && (
                  <button onClick={() => { setSelectedCylinder(cyl); setShowRefillModal(true); }} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all">Mark Repaired</button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Register Modal */}
      <Modal open={showRegisterModal} onClose={() => setShowRegisterModal(false)} title="Register New Cylinder">
        <form onSubmit={handleRegister}>
          <Field label="Serial Number" required>
            <input value={registerForm.serialNumber} onChange={e => setRegisterForm(p => ({ ...p, serialNumber: e.target.value }))} className="input-glass text-sm" placeholder="e.g. DG-O2-010" />
          </Field>
          <Field label="Gas Type" required>
            <select value={registerForm.gasTypeId} onChange={e => setRegisterForm(p => ({ ...p, gasTypeId: e.target.value }))} className="input-glass text-sm">
              <option value="">Select gas type...</option>
              {gasTypes.map(g => <option key={g.id} value={g.id}>{g.name} ({g.formula})</option>)}
              {gasTypes.length === 0 && <><option value="oxygen">Oxygen (O₂)</option><option value="co2">CO₂</option><option value="argon">Argon (Ar)</option><option value="nitrogen">Nitrogen (N₂)</option></>}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Size">
              <select value={registerForm.size} onChange={e => setRegisterForm(p => ({ ...p, size: e.target.value }))} className="input-glass text-sm">
                <option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option><option value="jumbo">Jumbo</option>
              </select>
            </Field>
            <Field label="Status">
              <select value={registerForm.status} onChange={e => setRegisterForm(p => ({ ...p, status: e.target.value }))} className="input-glass text-sm">
                <option value="full">Full</option><option value="empty">Empty</option>
              </select>
            </Field>
          </div>
          <Field label="Deposit Amount (₹)">
            <input type="number" min="0" value={registerForm.depositAmount} onChange={e => setRegisterForm(p => ({ ...p, depositAmount: parseFloat(e.target.value) || 0 }))} className="input-glass text-sm" />
          </Field>
          <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
            <button type="button" onClick={() => setShowRegisterModal(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm">{saving ? 'Registering...' : 'Register Cylinder'}</button>
          </div>
        </form>
      </Modal>

      {/* Assign Modal */}
      <Modal open={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Cylinder to Customer">
        <p className="text-sm text-slate-300 mb-4">Assign <span className="font-mono text-blue-400">{selectedCylinder?.serialNumber}</span> to a customer</p>
        <Field label="Customer" required>
          <select value={assignCustomerId} onChange={e => setAssignCustomerId(e.target.value)} className="input-glass text-sm">
            <option value="">Select customer...</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
          <button onClick={() => setShowAssignModal(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] transition-all">Cancel</button>
          <button onClick={handleAssign} disabled={saving} className="flex-1 btn-primary text-sm">{saving ? 'Assigning...' : 'Assign Cylinder'}</button>
        </div>
      </Modal>

      {/* Return Modal */}
      <Modal open={showReturnModal} onClose={() => setShowReturnModal(false)} title="Return Cylinder">
        <div className="text-center py-4">
          <p className="text-white mb-2">Return <span className="font-mono text-blue-400">{selectedCylinder?.serialNumber}</span>?</p>
          <p className="text-sm text-slate-400">Currently with: <span className="text-amber-400">{selectedCylinder?.currentHolder?.name}</span></p>
        </div>
        <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
          <button onClick={() => setShowReturnModal(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] transition-all">Cancel</button>
          <button onClick={handleReturn} disabled={saving} className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-amber-400 bg-amber-600/15 border border-amber-500/30 hover:bg-amber-600/25 transition-all">{saving ? 'Returning...' : 'Confirm Return'}</button>
        </div>
      </Modal>

      {/* Refill Modal */}
      <Modal open={showRefillModal} onClose={() => setShowRefillModal(false)} title="Send for Refill">
        <div className="text-center py-4">
          <p className="text-white mb-2">Send <span className="font-mono text-cyan-400">{selectedCylinder?.serialNumber}</span> for refill?</p>
          <p className="text-sm text-slate-400">Status will change to "In Refill"</p>
        </div>
        <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
          <button onClick={() => setShowRefillModal(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] transition-all">Cancel</button>
          <button onClick={handleSendRefill} disabled={saving} className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-cyan-400 bg-cyan-600/15 border border-cyan-500/30 hover:bg-cyan-600/25 transition-all">{saving ? 'Sending...' : 'Send for Refill'}</button>
        </div>
      </Modal>
    </motion.div>
  );
}
