'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const demoReports = [
  { id: 1, reportNumber: 'DMG-2026-0001', itemCategory: 'cylinder', itemDescription: 'Oxygen Cylinder DG-O2-003', damageType: 'leak', severity: 'severe', status: 'reported', damageDate: '2026-05-20', estimatedLoss: 5000, customer: { name: 'Singh Mfg' } },
  { id: 2, reportNumber: 'DMG-2026-0002', itemCategory: 'welding_torch', itemDescription: 'Heavy Duty Welding Torch #12', damageType: 'burn_damage', severity: 'moderate', status: 'under_review', damageDate: '2026-05-18', estimatedLoss: 4500, customer: null },
  { id: 3, reportNumber: 'DMG-2026-0003', itemCategory: 'gas_regulator', itemDescription: 'O2 Gas Regulator Unit', damageType: 'valve_damage', severity: 'minor', status: 'repairable', damageDate: '2026-05-15', estimatedLoss: 1200, repairCost: 400, customer: { name: 'Punjab Steel' } },
  { id: 4, reportNumber: 'DMG-2026-0004', itemCategory: 'hose_pipe', itemDescription: 'High Pressure Hose 10m', damageType: 'crack', severity: 'total_loss', status: 'written_off', damageDate: '2026-05-10', estimatedLoss: 3000, customer: null },
  { id: 5, reportNumber: 'DMG-2026-0005', itemCategory: 'cylinder', itemDescription: 'CO2 Cylinder DG-CO2-005', damageType: 'dent', severity: 'minor', status: 'repaired', damageDate: '2026-05-08', estimatedLoss: 800, repairCost: 300, customer: { name: 'Gupta Welding' } },
];

const categoryLabels = { cylinder: 'Cylinder', welding_torch: 'Welding Torch', gas_regulator: 'Gas Regulator', welding_rod: 'Welding Rod', hose_pipe: 'Hose Pipe', nozzle: 'Nozzle', other_equipment: 'Other Equipment' };
const categoryColors = { cylinder: '#3b82f6', welding_torch: '#f97316', gas_regulator: '#8b5cf6', welding_rod: '#f59e0b', hose_pipe: '#06b6d4', nozzle: '#ec4899', other_equipment: '#64748b' };
const severityColors = { minor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', moderate: 'bg-amber-500/20 text-amber-400 border-amber-500/30', severe: 'bg-red-500/20 text-red-400 border-red-500/30', total_loss: 'bg-red-700/20 text-red-300 border-red-600/30' };
const statusColors = { reported: 'bg-blue-500/20 text-blue-400 border-blue-500/30', under_review: 'bg-amber-500/20 text-amber-400 border-amber-500/30', repairable: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', written_off: 'bg-red-500/20 text-red-400 border-red-500/30', repaired: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', resolved: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
const damageTypes = ['dent','leak','valve_damage','corrosion','crack','thread_damage','burn_damage','electrical_fault','other'];

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

const emptyForm = { itemCategory: 'cylinder', itemDescription: '', damageType: 'dent', severity: 'moderate', damageDate: new Date().toISOString().split('T')[0], damageDescription: '', estimatedLoss: '', cylinderId: '', customerId: '', inventoryId: '' };

export default function DamageReportsPage() {
  const [reports, setReports] = useState(demoReports);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [resolveForm, setResolveForm] = useState({ status: 'resolved', resolution: '', repairCost: '', chargeToCustomer: false, chargedAmount: '' });
  const [saving, setSaving] = useState(false);
  const [cylinders, setCylinders] = useState([]);
  const [customers, setCustomers] = useState([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [repRes, cylRes, custRes] = await Promise.allSettled([
        fetch('/api/damage-reports', { headers }),
        fetch('/api/cylinders', { headers }),
        fetch('/api/customers', { headers }),
      ]);
      if (repRes.status === 'fulfilled') { const d = await repRes.value.json(); if (d.success && d.data?.length) setReports(d.data); }
      if (cylRes.status === 'fulfilled') { const d = await cylRes.value.json(); if (d.success) setCylinders(d.data || []); }
      if (custRes.status === 'fulfilled') { const d = await custRes.value.json(); if (d.success) setCustomers(d.data || []); }
    } catch { /* demo */ }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = reports.filter(r => {
    const matchSearch = (r.reportNumber || '').toLowerCase().includes(search.toLowerCase()) || (r.itemDescription || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = reports.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
  const totalLoss = reports.reduce((sum, r) => sum + (parseFloat(r.estimatedLoss) || 0), 0);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.itemDescription || !form.itemCategory) return toast.error('Item description and category are required');
    setSaving(true);
    try {
      const res = await fetch('/api/damage-reports', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, estimatedLoss: parseFloat(form.estimatedLoss) || 0 }),
      });
      const data = await res.json();
      if (data.success) { toast.success('Damage report filed!'); setShowCreateModal(false); setForm(emptyForm); fetchData(); }
      else toast.error(data.message || 'Failed');
    } catch {
      setReports(p => [{ ...form, id: Date.now(), reportNumber: `DMG-${Date.now()}`, status: 'reported', estimatedLoss: parseFloat(form.estimatedLoss) || 0 }, ...p]);
      toast.success('Report filed (offline)'); setShowCreateModal(false); setForm(emptyForm);
    }
    setSaving(false);
  };

  const handleResolve = async () => {
    if (!resolveForm.resolution) return toast.error('Please add resolution notes');
    setSaving(true);
    try {
      const res = await fetch(`/api/damage-reports/${selectedReport.id}/resolve`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...resolveForm, repairCost: parseFloat(resolveForm.repairCost) || 0, chargedAmount: parseFloat(resolveForm.chargedAmount) || 0 }),
      });
      const data = await res.json();
      if (data.success) { toast.success('Report resolved!'); fetchData(); }
      else toast.error(data.message || 'Failed');
    } catch {
      setReports(p => p.map(r => r.id === selectedReport.id ? { ...r, status: resolveForm.status, resolution: resolveForm.resolution } : r));
      toast.success('Resolved (offline)');
    }
    setShowResolveModal(false); setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e1e2e', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)' } }} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Damage Reports</h1>
          <p className="text-sm text-slate-400 mt-1">Track damaged cylinders, torches, regulators & equipment</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setShowCreateModal(true); }} className="btn-primary flex items-center gap-2 text-sm" id="report-damage-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          Report Damage
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-4 text-center"><p className="text-2xl font-display font-bold text-white">{reports.length}</p><p className="text-xs text-slate-400 mt-1">Total Reports</p></div>
        <div className="glass-card p-4 text-center"><p className="text-2xl font-display font-bold text-amber-400">{(statusCounts.reported || 0) + (statusCounts.under_review || 0)}</p><p className="text-xs text-slate-400 mt-1">Open</p></div>
        <div className="glass-card p-4 text-center"><p className="text-2xl font-display font-bold text-emerald-400">{(statusCounts.repaired || 0) + (statusCounts.resolved || 0)}</p><p className="text-xs text-slate-400 mt-1">Resolved</p></div>
        <div className="glass-card p-4 text-center"><p className="text-2xl font-display font-bold text-red-400">₹{(totalLoss/1000).toFixed(1)}K</p><p className="text-xs text-slate-400 mt-1">Est. Loss</p></div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input type="text" className="input-glass flex-1 max-w-md text-sm" placeholder="Search by report # or description..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          {['all','reported','under_review','repairable','repaired','written_off','resolved'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${statusFilter === s ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 border border-white/[0.06] hover:border-white/[0.15]'}`}>
              {s === 'all' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((r, i) => {
          const catColor = categoryColors[r.itemCategory] || '#64748b';
          return (
            <motion.div key={r.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${catColor}20`, border: `1px solid ${catColor}30` }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={catColor} strokeWidth="1.5"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-slate-500">{r.reportNumber}</p>
                    <p className="text-sm font-semibold text-white">{r.itemDescription}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="badge text-xs px-2 py-0.5 rounded-lg border" style={{ background: `${catColor}15`, color: catColor, borderColor: `${catColor}30` }}>{categoryLabels[r.itemCategory]}</span>
                <span className={`badge text-xs px-2 py-0.5 rounded-lg border ${severityColors[r.severity]}`}>{r.severity?.replace('_',' ')}</span>
                <span className={`badge text-xs px-2 py-0.5 rounded-lg border ${statusColors[r.status]}`}>{r.status?.replace(/_/g,' ')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div><span className="text-slate-500">Damage: </span><span className="text-slate-300">{r.damageType?.replace(/_/g,' ')}</span></div>
                <div><span className="text-slate-500">Date: </span><span className="text-slate-300">{r.damageDate}</span></div>
                <div><span className="text-slate-500">Est. Loss: </span><span className="text-red-400 font-mono">₹{(parseFloat(r.estimatedLoss)||0).toLocaleString()}</span></div>
                {r.customer && <div><span className="text-slate-500">Customer: </span><span className="text-blue-400">{r.customer.name}</span></div>}
              </div>
              <div className="flex gap-2 pt-3 border-t border-white/[0.06]">
                <button onClick={() => { setSelectedReport(r); setShowDetailModal(true); }} className="text-xs px-3 py-1.5 rounded-lg bg-slate-600/20 text-slate-300 border border-slate-500/30 hover:bg-slate-600/30 transition-all flex-1">Details</button>
                {['reported','under_review','repairable'].includes(r.status) && (
                  <button onClick={() => { setSelectedReport(r); setResolveForm({ status: 'resolved', resolution: '', repairCost: '', chargeToCustomer: false, chargedAmount: '' }); setShowResolveModal(true); }} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all flex-1">Resolve</button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      {filtered.length === 0 && <div className="glass-card p-12 text-center"><p className="text-slate-400">No damage reports found</p></div>}

      {/* Create Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Report Damage">
        <form onSubmit={handleCreate}>
          <Field label="Item Category" required>
            <select value={form.itemCategory} onChange={e => setForm(p => ({ ...p, itemCategory: e.target.value }))} className="input-glass text-sm">
              {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="Item Description" required>
            <input value={form.itemDescription} onChange={e => setForm(p => ({ ...p, itemDescription: e.target.value }))} className="input-glass text-sm" placeholder="e.g. Oxygen Cylinder DG-O2-003" />
          </Field>
          {form.itemCategory === 'cylinder' && cylinders.length > 0 && (
            <Field label="Link Cylinder (optional)">
              <select value={form.cylinderId} onChange={e => setForm(p => ({ ...p, cylinderId: e.target.value }))} className="input-glass text-sm">
                <option value="">Select cylinder...</option>
                {cylinders.map(c => <option key={c.id} value={c.id}>{c.serialNumber} - {c.gasType?.name || 'Unknown'}</option>)}
              </select>
            </Field>
          )}
          {customers.length > 0 && (
            <Field label="Customer (if applicable)">
              <select value={form.customerId} onChange={e => setForm(p => ({ ...p, customerId: e.target.value }))} className="input-glass text-sm">
                <option value="">No customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Damage Type" required>
              <select value={form.damageType} onChange={e => setForm(p => ({ ...p, damageType: e.target.value }))} className="input-glass text-sm">
                {damageTypes.map(t => <option key={t} value={t}>{t.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
              </select>
            </Field>
            <Field label="Severity" required>
              <select value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))} className="input-glass text-sm">
                <option value="minor">Minor</option><option value="moderate">Moderate</option><option value="severe">Severe</option><option value="total_loss">Total Loss</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Damage Date"><input type="date" value={form.damageDate} onChange={e => setForm(p => ({ ...p, damageDate: e.target.value }))} className="input-glass text-sm" /></Field>
            <Field label="Estimated Loss (₹)"><input type="number" min="0" value={form.estimatedLoss} onChange={e => setForm(p => ({ ...p, estimatedLoss: e.target.value }))} className="input-glass text-sm" /></Field>
          </div>
          <Field label="Description"><textarea rows={3} value={form.damageDescription} onChange={e => setForm(p => ({ ...p, damageDescription: e.target.value }))} className="input-glass text-sm" placeholder="Detailed notes..." /></Field>
          <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
            <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08]">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm">{saving ? 'Filing...' : 'File Report'}</button>
          </div>
        </form>
      </Modal>

      {/* Resolve Modal */}
      <Modal open={showResolveModal} onClose={() => setShowResolveModal(false)} title="Resolve Damage Report">
        <p className="text-sm text-slate-300 mb-4">Resolve <span className="font-mono text-blue-400">{selectedReport?.reportNumber}</span></p>
        <Field label="Resolution Status" required>
          <select value={resolveForm.status} onChange={e => setResolveForm(p => ({ ...p, status: e.target.value }))} className="input-glass text-sm">
            <option value="repaired">Repaired</option><option value="written_off">Written Off</option><option value="resolved">Resolved</option>
          </select>
        </Field>
        <Field label="Resolution Notes" required><textarea rows={3} value={resolveForm.resolution} onChange={e => setResolveForm(p => ({ ...p, resolution: e.target.value }))} className="input-glass text-sm" placeholder="How was this resolved?" /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Repair Cost (₹)"><input type="number" min="0" value={resolveForm.repairCost} onChange={e => setResolveForm(p => ({ ...p, repairCost: e.target.value }))} className="input-glass text-sm" /></Field>
          <Field label="Charge to Customer (₹)"><input type="number" min="0" value={resolveForm.chargedAmount} onChange={e => setResolveForm(p => ({ ...p, chargedAmount: e.target.value, chargeToCustomer: parseFloat(e.target.value) > 0 }))} className="input-glass text-sm" /></Field>
        </div>
        <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
          <button onClick={() => setShowResolveModal(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08]">Cancel</button>
          <button onClick={handleResolve} disabled={saving} className="flex-1 btn-primary text-sm">{saving ? 'Resolving...' : 'Resolve'}</button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)} title="Damage Report Details">
        {selectedReport && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-slate-500 mb-1">Report #</p><p className="font-mono text-white">{selectedReport.reportNumber}</p></div>
              <div><p className="text-xs text-slate-500 mb-1">Status</p><p><span className={`badge text-xs px-2 py-0.5 rounded-lg border ${statusColors[selectedReport.status]}`}>{selectedReport.status?.replace(/_/g,' ')}</span></p></div>
              <div><p className="text-xs text-slate-500 mb-1">Category</p><p className="text-white">{categoryLabels[selectedReport.itemCategory]}</p></div>
              <div><p className="text-xs text-slate-500 mb-1">Severity</p><p><span className={`badge text-xs px-2 py-0.5 rounded-lg border ${severityColors[selectedReport.severity]}`}>{selectedReport.severity?.replace('_',' ')}</span></p></div>
              <div className="col-span-2"><p className="text-xs text-slate-500 mb-1">Item</p><p className="text-white">{selectedReport.itemDescription}</p></div>
              <div><p className="text-xs text-slate-500 mb-1">Damage Type</p><p className="text-white">{selectedReport.damageType?.replace(/_/g,' ')}</p></div>
              <div><p className="text-xs text-slate-500 mb-1">Date</p><p className="text-white">{selectedReport.damageDate}</p></div>
              <div><p className="text-xs text-slate-500 mb-1">Est. Loss</p><p className="text-red-400 font-mono">₹{(parseFloat(selectedReport.estimatedLoss)||0).toLocaleString()}</p></div>
              {selectedReport.repairCost && <div><p className="text-xs text-slate-500 mb-1">Repair Cost</p><p className="text-amber-400 font-mono">₹{parseFloat(selectedReport.repairCost).toLocaleString()}</p></div>}
              {selectedReport.customer && <div className="col-span-2"><p className="text-xs text-slate-500 mb-1">Customer</p><p className="text-blue-400">{selectedReport.customer.name}</p></div>}
              {selectedReport.resolution && <div className="col-span-2"><p className="text-xs text-slate-500 mb-1">Resolution</p><p className="text-slate-300">{selectedReport.resolution}</p></div>}
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
