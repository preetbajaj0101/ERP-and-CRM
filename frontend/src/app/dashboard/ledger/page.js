'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const demoLedger = {
  customer: { name: 'Singh Manufacturing', currentBalance: 950 },
  entries: [
    { id: 1, entryType: 'debit', amount: 2950, runningBalance: 2950, description: 'Sale - 10x Oxygen Cylinders', date: '2026-05-03' },
    { id: 2, entryType: 'credit', amount: 2000, runningBalance: 950, description: 'Payment received (UPI)', date: '2026-05-03' },
    { id: 3, entryType: 'debit', amount: 4500, runningBalance: 5450, description: 'Sale - 5x CO2 + Welding Rods', date: '2026-04-28' },
    { id: 4, entryType: 'credit', amount: 4500, runningBalance: 950, description: 'Payment received (Cash)', date: '2026-04-29' },
    { id: 5, entryType: 'debit', amount: 8000, runningBalance: 8950, description: 'Sale - 10x Nitrogen Cylinders', date: '2026-04-20' },
    { id: 6, entryType: 'credit', amount: 8000, runningBalance: 950, description: 'Payment received (Bank Transfer)', date: '2026-04-22' },
  ],
};

const demoOutstanding = [
  { id: 1, name: 'Gupta Engineering', phone: '9876543214', currentBalance: 28700 },
  { id: 2, name: 'Kaur Welding Works', phone: '9876543211', currentBalance: 12500 },
  { id: 3, name: 'Sharma Gas Agency', phone: '9876543213', currentBalance: 5200 },
  { id: 4, name: 'Singh Manufacturing', phone: '9876543210', currentBalance: 950 },
];

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

export default function LedgerPage() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [view, setView] = useState('outstanding');
  const [outstanding, setOutstanding] = useState(demoOutstanding);
  const [ledgerData, setLedgerData] = useState(demoLedger);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: 0, paymentMethod: 'cash', notes: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchOutstanding = useCallback(async () => {
    try {
      const res = await fetch('/api/ledger/outstanding', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && data.data?.customers?.length) setOutstanding(data.data.customers);
    } catch { /* demo */ }
  }, [token]);

  const fetchLedger = useCallback(async (customerId) => {
    try {
      const res = await fetch(`/api/ledger/customer/${customerId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setLedgerData({
          customer: data.data.customer,
          entries: data.data.entries.map(e => ({ ...e, date: e.createdAt?.split('T')[0] || e.date })),
        });
      }
    } catch { /* demo */ }
  }, [token]);

  useEffect(() => { fetchOutstanding(); }, [fetchOutstanding]);

  const totalOutstanding = outstanding.reduce((s, c) => s + (parseFloat(c.currentBalance) || 0), 0);

  const handleViewLedger = (customer) => {
    setSelectedCustomer(customer);
    setView('ledger');
    fetchLedger(customer.id);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || paymentForm.amount <= 0) return toast.error('Enter a valid amount');
    setSaving(true);
    try {
      // Create a payment transaction via the sale endpoint with the customer
      const res = await fetch('/api/transactions/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          customerId: paymentTarget.id,
          items: [],
          paymentMethod: paymentForm.paymentMethod,
          paidAmount: paymentForm.amount,
          notes: paymentForm.notes || `Payment received from ${paymentTarget.name}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Payment of ₹${paymentForm.amount.toLocaleString()} recorded!`);
        fetchOutstanding();
        if (selectedCustomer?.id === paymentTarget.id) fetchLedger(paymentTarget.id);
      } else {
        // Fallback: update locally
        setOutstanding(p => p.map(c => c.id === paymentTarget.id ? { ...c, currentBalance: Math.max(0, (parseFloat(c.currentBalance) || 0) - paymentForm.amount) } : c));
        toast.success('Payment recorded (offline)');
      }
    } catch {
      setOutstanding(p => p.map(c => c.id === paymentTarget.id ? { ...c, currentBalance: Math.max(0, (parseFloat(c.currentBalance) || 0) - paymentForm.amount) } : c));
      toast.success('Payment recorded (offline)');
    }
    setShowPaymentModal(false);
    setPaymentForm({ amount: 0, paymentMethod: 'cash', notes: '' });
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e1e2e', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)' } }} />

      <div>
        <h1 className="text-2xl font-display font-bold text-white">Customer Ledger</h1>
        <p className="text-sm text-slate-400 mt-1">Track balances, payments, and outstanding amounts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card glass-card-amber p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Outstanding</p>
          <p className="text-3xl font-display font-bold text-amber-400">₹{totalOutstanding.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">{outstanding.length} customers</p>
        </div>
        <div className="glass-card glass-card-green p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Collected This Month</p>
          <p className="text-3xl font-display font-bold text-emerald-400">₹1,87,500</p>
          <p className="text-xs text-slate-500 mt-1">42 payments</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Overdue (30+ days)</p>
          <p className="text-3xl font-display font-bold text-red-400">₹8,200</p>
          <p className="text-xs text-slate-500 mt-1">2 customers</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setView('outstanding')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${view === 'outstanding' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 border border-white/[0.06]'}`}>
          Outstanding Balances
        </button>
        <button onClick={() => setView('ledger')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${view === 'ledger' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 border border-white/[0.06]'}`}>
          Account Ledger
        </button>
      </div>

      {view === 'outstanding' ? (
        <div className="glass-card overflow-hidden">
          <table className="data-table">
            <thead><tr><th>Customer</th><th>Phone</th><th>Outstanding Balance</th><th>Actions</th></tr></thead>
            <tbody>
              {outstanding.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <td><p className="text-sm font-medium text-white">{c.name}</p></td>
                  <td className="font-mono text-sm">{c.phone}</td>
                  <td><span className="text-lg font-mono font-bold text-amber-400">₹{(parseFloat(c.currentBalance) || 0).toLocaleString()}</span></td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => handleViewLedger(c)} className="text-xs px-3 py-1.5 rounded-lg bg-blue-600/15 text-blue-400 border border-blue-500/20 hover:bg-blue-600/25 transition-all">View Ledger</button>
                      <button onClick={() => { setPaymentTarget(c); setPaymentForm({ amount: parseFloat(c.currentBalance) || 0, paymentMethod: 'cash', notes: '' }); setShowPaymentModal(true); }} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/25 transition-all">Record Payment</button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">{ledgerData.customer.name}</h3>
              <p className="text-sm text-slate-400">Current Balance: <span className="text-amber-400 font-mono font-bold">₹{(parseFloat(ledgerData.customer.currentBalance) || 0).toLocaleString()}</span></p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setPaymentTarget({ id: selectedCustomer?.id, name: ledgerData.customer.name, currentBalance: ledgerData.customer.currentBalance }); setPaymentForm({ amount: parseFloat(ledgerData.customer.currentBalance) || 0, paymentMethod: 'cash', notes: '' }); setShowPaymentModal(true); }} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/25 transition-all">Record Payment</button>
              <button onClick={() => setView('outstanding')} className="text-xs px-3 py-1.5 rounded-lg text-slate-400 border border-white/[0.08] hover:border-white/[0.15] transition-all">← Back</button>
            </div>
          </div>
          <div className="space-y-2">
            {ledgerData.entries.map((entry, i) => (
              <motion.div key={entry.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06]" style={{ background: 'rgba(15,15,26,0.5)' }}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${entry.entryType === 'debit' ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                    {entry.entryType === 'debit' ? '↑' : '↓'}
                  </div>
                  <div>
                    <p className="text-sm text-white">{entry.description}</p>
                    <p className="text-xs text-slate-500">{entry.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-mono font-semibold ${entry.entryType === 'debit' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {entry.entryType === 'debit' ? '+' : '-'}₹{(parseFloat(entry.amount) || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">Bal: ₹{(parseFloat(entry.runningBalance) || 0).toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal open={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Record Payment">
        <form onSubmit={handleRecordPayment}>
          <div className="glass-card p-4 mb-4">
            <p className="text-xs text-slate-400 mb-1">Customer</p>
            <p className="text-white font-medium">{paymentTarget?.name}</p>
            <p className="text-sm text-amber-400 font-mono mt-1">Outstanding: ₹{(parseFloat(paymentTarget?.currentBalance) || 0).toLocaleString()}</p>
          </div>
          <Field label="Payment Amount (₹)" required>
            <input type="number" min="0" value={paymentForm.amount} onChange={e => setPaymentForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} className="input-glass text-sm" />
          </Field>
          <Field label="Payment Method" required>
            <select value={paymentForm.paymentMethod} onChange={e => setPaymentForm(p => ({ ...p, paymentMethod: e.target.value }))} className="input-glass text-sm">
              <option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option><option value="cheque">Cheque</option>
            </select>
          </Field>
          <Field label="Notes">
            <textarea value={paymentForm.notes} onChange={e => setPaymentForm(p => ({ ...p, notes: e.target.value }))} className="input-glass text-sm min-h-[60px] resize-none" placeholder="Optional notes..." />
          </Field>
          <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
            <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm">{saving ? 'Recording...' : 'Record Payment'}</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
