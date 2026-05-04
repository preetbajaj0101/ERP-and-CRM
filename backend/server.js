require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL, // Vercel production URL
].filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files for invoices
app.use('/invoices', express.static(path.join(__dirname, 'invoices')));

// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/cylinders', require('./routes/cylinders'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/ledger', require('./routes/ledger'));
app.use('/api/deposits', require('./routes/deposits'));
app.use('/api/dashboard', require('./routes/dashboard'));

// ─── Health Check ────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Dashmesh Gases ERP API', version: '1.0.0' });
});

// ─── Error Handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync tables (use migrations in production)
    await db.sequelize.sync({ alter: true });
    console.log('✅ Tables synced');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Dashmesh Gases ERP API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
