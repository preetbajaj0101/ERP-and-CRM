'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamic import for Three.js (no SSR)
const GasCylinder3D = dynamic(() => import('../components/three/GasCylinder3D'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 z-0 bg-dark-950">
      <div className="absolute inset-0 particles-bg" />
    </div>
  ),
});

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'Something went wrong');
        return;
      }

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <GasCylinder3D />

      {/* Overlay gradient */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-dark-950/80 via-dark-950/40 to-dark-950/80" />

      {/* Grid pattern */}
      <div className="absolute inset-0 z-[1] grid-pattern opacity-30" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-10"
        >
          {/* Logo icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(6,182,212,0.3))',
              border: '1px solid rgba(59,130,246,0.3)',
              boxShadow: '0 0 30px rgba(59,130,246,0.2)',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-400">
              <path d="M12 2C9.24 2 7 4.24 7 7v10c0 2.76 2.24 5 5 5s5-2.24 5-5V7c0-2.76-2.24-5-5-5z" />
              <circle cx="12" cy="5" r="1.5" />
              <path d="M9 12h6M9 15h6" opacity="0.5" />
            </svg>
          </motion.div>

          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-2">
            <span className="brand-glow text-white">DASHMESH</span>
            <br />
            <span className="gradient-text">GASES</span>
          </h1>
          <p className="text-slate-400 text-sm tracking-widest uppercase mt-3 font-medium">
            Industrial Gas Management System
          </p>
        </motion.div>

        {/* Login/Register Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="glass-card p-8"
        >
          {/* Tab Switcher */}
          <div className="flex rounded-xl overflow-hidden mb-8 border border-white/[0.08]" style={{ background: 'rgba(15,15,26,0.8)' }}>
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold transition-all duration-300 ${
                isLogin
                  ? 'text-white bg-gradient-to-r from-blue-600/30 to-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold transition-all duration-300 ${
                !isLogin
                  ? 'text-white bg-gradient-to-r from-blue-600/30 to-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl text-sm text-red-400 border border-red-500/20"
                style={{ background: 'rgba(239,68,68,0.1)' }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    id="register-name"
                    type="text"
                    className="input-glass"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                className="input-glass"
                placeholder="admin@dashmeshgases.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="input-glass"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <motion.button
              id="login-submit"
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </motion.button>
          </form>

          {/* Demo credentials */}
          {isLogin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 p-4 rounded-xl border border-white/[0.06]"
              style={{ background: 'rgba(15,15,26,0.6)' }}
            >
              <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">Demo Credentials</p>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">
                  <span className="text-blue-400">Admin:</span> admin@dashmeshgases.com / admin123
                </p>
                <p className="text-xs text-slate-400">
                  <span className="text-cyan-400">Staff:</span> staff@dashmeshgases.com / staff123
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-xs text-slate-600 mt-8"
        >
          © 2026 Dashmesh Gases. All rights reserved.
        </motion.p>
      </div>
    </div>
  );
}
