'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const demoTransactions = [
  { id: 1, type: 'sale', party: 'Singh Manufacturing', grandTotal: 2950, paidAmount: 2000, paymentStatus: 'partial', paymentMethod: 'upi', date: '2026-05-03', items: '10x Oxygen Cylinder' },
  { id: 2, type: 'sale', party: 'Kaur Welding Works', grandTotal: 4500, paidAmount: 4500, paymentStatus: 'paid', paymentMethod: 'cash', date: '2026-05-02', items: '5x CO2 + Welding Rods' },
  { id: 3, type: 'purchase', party: 'National Gas Suppliers', grandTotal: 15000, paidAmount: 0, paymentStatus: 'unpaid', paymentMethod: 'credit', date: '2026-05-02', items: '20x Oxygen, 10x Argon' },
  { id: 4, type: 'sale', party: 'Gupta Engineering', grandTotal: 8400, paidAmount: 5000, paymentStatus: 'partial', paymentMethod: 'bank_transfer', date: '2026-05-01', items: '3x Argon + Regulator' },
  { id: 5, type: 'return', party: 'Punjab Steel Fabricators', grandTotal: 0, paidAmount: 0, paymentStatus: 'paid', paymentMethod: null, date: '2026-04-30', items: '2x Empty O2 cylinders returned' },
  { id: 6, type: 'sale', party: 'Sharma Gas Agency', grandTotal: 12500, paidAmount: 12500, paymentStatus: 'paid', paymentMethod: 'upi', date: '2026-04-29', items: '25x Nitrogen' },
];

const typeColors = { sale: '#10b981', purchase: '#3b82f6', return: '#f59e0b', refill: '#8b5cf6' };

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className={`relative w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} glass-card p-0 overflow-hidden z-10`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
            <h2 className="text-lg font-display font-bold text-white">{title}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>
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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState(demoTransactions);
  const [typeFilter, setTypeFilter] = useState('all');
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [saving, setSaving] = useState(false);

  const [saleForm, setSaleForm] = useState({ customerId: '', paymentMethod: 'cash', paidAmount: 0, notes: '', items: [{ inventoryId: '', quantity: 1, unitPrice: 0 }] });
  const [purchaseForm, setPurchaseForm] = useState({ vendorId: '', paymentMethod: 'cash', paidAmount: 0, notes: '', items: [{ inventoryId: '', quantity: 1, unitPrice: 0 }] });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [txnRes, custRes, vendRes, invRes] = await Promise.allSettled([
        fetch('/api/transactions', { headers }), fetch('/api/customers', { headers }),
        fetch('/api/vendors', { headers }), fetch('/api/inventory', { headers }),
      ]);
      if (txnRes.status === 'fulfilled') { const d = await txnRes.value.json(); if (d.success && d.data?.length) setTransactions(d.data.map(t => ({ ...t, party: t.customer?.name || t.vendor?.name || 'Unknown', date: t.createdAt?.split('T')[0], items: 'View details' }))); }
      if (custRes.status === 'fulfilled') { const d = await custRes.value.json(); if (d.success) setCustomers(d.data); }
      if (vendRes.status === 'fulfilled') { const d = await vendRes.value.json(); if (d.success) setVendors(d.data); }
      if (invRes.status === 'fulfilled') { const d = await invRes.value.json(); if (d.success) setInventory(d.data); }
    } catch { /* demo */ }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = transactions.filter(t => typeFilter === 'all' || t.type === typeFilter);

  const addSaleItem = () => setSaleForm(p => ({ ...p, items: [...p.items, { inventoryId: '', quantity: 1, unitPrice: 0 }] }));
  const removeSaleItem = (i) => setSaleForm(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));
  const updateSaleItem = (i, field, value) => setSaleForm(p => ({ ...p, items: p.items.map((item, idx) => idx === i ? { ...item, [field]: field === 'inventoryId' ? value : parseFloat(value) || 0 } : item) }));

  const addPurchaseItem = () => setPurchaseForm(p => ({ ...p, items: [...p.items, { inventoryId: '', quantity: 1, unitPrice: 0 }] }));
  const removePurchaseItem = (i) => setPurchaseForm(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));
  const updatePurchaseItem = (i, field, value) => setPurchaseForm(p => ({ ...p, items: p.items.map((item, idx) => idx === i ? { ...item, [field]: field === 'inventoryId' ? value : parseFloat(value) || 0 } : item) }));

  const saleTotal = saleForm.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const purchaseTotal = purchaseForm.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    if (!saleForm.customerId) return toast.error('Select a customer');
    if (saleForm.items.some(i => !i.inventoryId || !i.quantity)) return toast.error('Fill all item fields');
    setSaving(true);
    try {
      const res = await fetch('/api/transactions/sale', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(saleForm),
      });
      const data = await res.json();
      if (data.success) { toast.success('Sale recorded!'); setShowSaleModal(false); setSaleForm({ customerId: '', paymentMethod: 'cash', paidAmount: 0, notes: '', items: [{ inventoryId: '', quantity: 1, unitPrice: 0 }] }); fetchData(); }
      else toast.error(data.message || 'Failed');
    } catch {
      const newTxn = { id: Date.now(), type: 'sale', party: customers.find(c => c.id === saleForm.customerId)?.name || 'Customer', grandTotal: saleTotal, paidAmount: saleForm.paidAmount, paymentStatus: saleForm.paidAmount >= saleTotal ? 'paid' : saleForm.paidAmount > 0 ? 'partial' : 'unpaid', paymentMethod: saleForm.paymentMethod, date: new Date().toISOString().split('T')[0], items: `${saleForm.items.length} items` };
      setTransactions(p => [newTxn, ...p]);
      toast.success('Sale recorded (offline)');
      setShowSaleModal(false);
    }
    setSaving(false);
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    if (!purchaseForm.vendorId) return toast.error('Select a vendor');
    if (purchaseForm.items.some(i => !i.inventoryId || !i.quantity)) return toast.error('Fill all item fields');
    setSaving(true);
    try {
      const res = await fetch('/api/transactions/purchase', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(purchaseForm),
      });
      const data = await res.json();
      if (data.success) { toast.success('Purchase recorded!'); setShowPurchaseModal(false); setPurchaseForm({ vendorId: '', paymentMethod: 'cash', paidAmount: 0, notes: '', items: [{ inventoryId: '', quantity: 1, unitPrice: 0 }] }); fetchData(); }
      else toast.error(data.message || 'Failed');
    } catch {
      const newTxn = { id: Date.now(), type: 'purchase', party: vendors.find(v => v.id === purchaseForm.vendorId)?.name || 'Vendor', grandTotal: purchaseTotal, paidAmount: purchaseForm.paidAmount, paymentStatus: purchaseForm.paidAmount >= purchaseTotal ? 'paid' : purchaseForm.paidAmount > 0 ? 'partial' : 'unpaid', paymentMethod: purchaseForm.paymentMethod, date: new Date().toISOString().split('T')[0], items: `${purchaseForm.items.length} items` };
      setTransactions(p => [newTxn, ...p]);
      toast.success('Purchase recorded (offline)');
      setShowPurchaseModal(false);
    }
    setSaving(false);
  };

  const renderItemRows = (items, updateItem, removeItem, type) => items.map((item, i) => (
    <div key={i} className="flex gap-2 items-end mb-3">
      <div className="flex-1">
        {i === 0 && <label className="block text-[10px] text-slate-500 mb-1">Item</label>}
        <select value={item.inventoryId} onChange={e => { updateItem(i, 'inventoryId', e.target.value); const inv = inventory.find(x => x.id === e.target.value); if (inv) updateItem(i, 'unitPrice', parseFloat(inv.unitPrice)); }} className="input-glass text-sm w-full">
          <option value="">Select item...</option>
          {inventory.map(inv => <option key={inv.id} value={inv.id}>{inv.itemName}</option>)}
        </select>
      </div>
      <div className="w-20">
        {i === 0 && <label className="block text-[10px] text-slate-500 mb-1">Qty</label>}
        <input type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} className="input-glass text-sm" />
      </div>
      <div className="w-28">
        {i === 0 && <label className="block text-[10px] text-slate-500 mb-1">Price (₹)</label>}
        <input type="number" min="0" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)} className="input-glass text-sm" />
      </div>
      <div className="w-24 text-right">
        {i === 0 && <label className="block text-[10px] text-slate-500 mb-1">Total</label>}
        <p className="py-3 font-mono text-sm text-white">₹{(item.quantity * item.unitPrice).toLocaleString()}</p>
      </div>
      {items.length > 1 && (
        <button type="button" onClick={() => removeItem(i)} className="text-slate-500 hover:text-red-400 pb-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      )}
    </div>
  ));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e1e2e', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)' } }} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Transactions</h1>
          <p className="text-sm text-slate-400 mt-1">Sales, purchases, returns & refills</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSaleModal(true)} className="btn-primary flex items-center gap-2 text-sm" id="new-sale-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v12m6-6H6" /></svg>
            New Sale
          </button>
          <button onClick={() => setShowPurchaseModal(true)} className="px-4 py-3 rounded-xl font-semibold text-sm text-blue-400 border border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/20 transition-all" id="new-purchase-btn">
            New Purchase
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'sale', 'purchase', 'return'].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${typeFilter === t ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 border border-white/[0.06] hover:border-white/[0.15]'}`}>
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((txn, i) => (
          <motion.div key={txn.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${typeColors[txn.type]}20`, border: `1px solid ${typeColors[txn.type]}30` }}>
                  {txn.type === 'sale' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={typeColors[txn.type]} strokeWidth="1.5"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                  {txn.type === 'purchase' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={typeColors[txn.type]} strokeWidth="1.5"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4m6 11a1 1 0 100 2 1 1 0 000-2zm7 0a1 1 0 100 2 1 1 0 000-2z" /></svg>}
                  {txn.type === 'return' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={typeColors[txn.type]} strokeWidth="1.5"><path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{txn.party}</p>
                  <p className="text-xs text-slate-500">{txn.items}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-lg font-mono font-bold text-white">₹{(parseFloat(txn.grandTotal) || 0).toLocaleString()}</p>
                  <p className="text-xs text-slate-500">{txn.date}</p>
                </div>
                <div className="text-right">
                  <span className={`badge badge-${txn.paymentStatus}`}>{txn.paymentStatus}</span>
                  {txn.paymentMethod && <p className="text-[10px] text-slate-500 mt-1 uppercase">{txn.paymentMethod.replace('_', ' ')}</p>}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── New Sale Modal ──────────────────────────────── */}
      <Modal open={showSaleModal} onClose={() => setShowSaleModal(false)} title="Record New Sale" wide>
        <form onSubmit={handleSaleSubmit}>
          <Field label="Customer" required>
            <select value={saleForm.customerId} onChange={e => setSaleForm(p => ({ ...p, customerId: e.target.value }))} className="input-glass text-sm">
              <option value="">Select customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <div className="mb-2"><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Line Items</p></div>
          {renderItemRows(saleForm.items, updateSaleItem, removeSaleItem, 'sale')}
          <button type="button" onClick={addSaleItem} className="text-xs text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v12m6-6H6"/></svg> Add Item
          </button>
          <div className="glass-card p-4 mb-4">
            <div className="flex justify-between text-sm"><span className="text-slate-400">Grand Total</span><span className="font-mono font-bold text-white text-lg">₹{saleTotal.toLocaleString()}</span></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Payment Method">
              <select value={saleForm.paymentMethod} onChange={e => setSaleForm(p => ({ ...p, paymentMethod: e.target.value }))} className="input-glass text-sm">
                <option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option><option value="credit">Credit</option>
              </select>
            </Field>
            <Field label="Amount Paid (₹)">
              <input type="number" min="0" value={saleForm.paidAmount} onChange={e => setSaleForm(p => ({ ...p, paidAmount: parseFloat(e.target.value) || 0 }))} className="input-glass text-sm" />
            </Field>
          </div>
          <Field label="Notes">
            <textarea value={saleForm.notes} onChange={e => setSaleForm(p => ({ ...p, notes: e.target.value }))} className="input-glass text-sm min-h-[60px] resize-none" placeholder="Any additional notes..." />
          </Field>
          <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
            <button type="button" onClick={() => setShowSaleModal(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] hover:border-white/[0.15] transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm">{saving ? 'Recording...' : 'Record Sale'}</button>
          </div>
        </form>
      </Modal>

      {/* ─── New Purchase Modal ──────────────────────────── */}
      <Modal open={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} title="Record New Purchase" wide>
        <form onSubmit={handlePurchaseSubmit}>
          <Field label="Vendor" required>
            <select value={purchaseForm.vendorId} onChange={e => setPurchaseForm(p => ({ ...p, vendorId: e.target.value }))} className="input-glass text-sm">
              <option value="">Select vendor...</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </Field>
          <div className="mb-2"><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Line Items</p></div>
          {renderItemRows(purchaseForm.items, updatePurchaseItem, removePurchaseItem, 'purchase')}
          <button type="button" onClick={addPurchaseItem} className="text-xs text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v12m6-6H6"/></svg> Add Item
          </button>
          <div className="glass-card p-4 mb-4">
            <div className="flex justify-between text-sm"><span className="text-slate-400">Grand Total</span><span className="font-mono font-bold text-white text-lg">₹{purchaseTotal.toLocaleString()}</span></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Payment Method">
              <select value={purchaseForm.paymentMethod} onChange={e => setPurchaseForm(p => ({ ...p, paymentMethod: e.target.value }))} className="input-glass text-sm">
                <option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option><option value="credit">Credit</option>
              </select>
            </Field>
            <Field label="Amount Paid (₹)">
              <input type="number" min="0" value={purchaseForm.paidAmount} onChange={e => setPurchaseForm(p => ({ ...p, paidAmount: parseFloat(e.target.value) || 0 }))} className="input-glass text-sm" />
            </Field>
          </div>
          <Field label="Notes">
            <textarea value={purchaseForm.notes} onChange={e => setPurchaseForm(p => ({ ...p, notes: e.target.value }))} className="input-glass text-sm min-h-[60px] resize-none" placeholder="Any additional notes..." />
          </Field>
          <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
            <button type="button" onClick={() => setShowPurchaseModal(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 border border-white/[0.08] hover:border-white/[0.15] transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm">{saving ? 'Recording...' : 'Record Purchase'}</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
