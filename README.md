# 🔵 Dashmesh Gases ERP System

> Enterprise Resource Planning system for industrial gas management — Oxygen, CO2, Argon, Nitrogen, Acetylene & Welding Accessories.

![Stack](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Stack](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![Stack](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Stack](https://img.shields.io/badge/Three.js-3D-black?logo=three.js)

## ✨ Features

- **3D Login Page** — Rotating gas cylinders & floating molecules using React Three Fiber
- **Real-time Dashboard** — Sales trends, stock levels, cylinder status charts
- **Cylinder Tracking** — Serial number-based tracking with assign/return workflow
- **Inventory Management** — Full vs empty stock differentiation for gas cylinders
- **Customer Ledger** — Credit/debit tracking with running balance
- **Security Deposits** — Cylinder deposit management with refund workflow
- **PDF Invoices** — Auto-generated branded invoices
- **Role-Based Access** — Admin, Purchaser, Vendor roles with RBAC

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend Setup
```bash
cd backend
npm install
# Edit .env with your PostgreSQL credentials
npm run dev
# Seed demo data:
node db/seeds/seed.js
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Demo Login
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dashmeshgases.com | admin123 |
| Staff | staff@dashmeshgases.com | staff123 |

## 🏗️ Architecture

```
Frontend (Next.js 14 + Tailwind + Three.js)
    ↓ API Proxy
Backend (Express + Sequelize)
    ↓
PostgreSQL Database
```

## 📁 Project Structure

- `backend/` — Express API server with Sequelize ORM
- `frontend/` — Next.js 14 App Router with React Three Fiber
- `backend/models/` — 11 database models (Users, Customers, Cylinders, etc.)
- `backend/routes/` — REST API routes with JWT auth & RBAC
- `backend/services/` — Ledger & PDF generation services
- `frontend/src/components/three/` — 3D gas cylinder scene
- `frontend/src/app/dashboard/` — 8 dashboard modules

## 📊 Database Schema

11 tables: `users`, `customers`, `vendors`, `gas_types`, `cylinders`, `inventory`, `transactions`, `transaction_items`, `ledger_entries`, `security_deposits`, `invoices`

## 🎨 Design

- Dark industrial theme with glassmorphism
- Premium typography (Inter, Outfit, JetBrains Mono)
- Glow effects on brand name
- Framer Motion page transitions
- Recharts data visualization
