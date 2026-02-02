# 📦 STOIR - Sistem Inventory Management

> Modern, responsive inventory management system built with React, Vite, Tailwind CSS, and Electron

![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)
![React](https://img.shields.io/badge/react-19.1.0-61dafb.svg)
![Vite](https://img.shields.io/badge/vite-7.0.4-646cff.svg)
![Electron](https://img.shields.io/badge/electron-35.0.0-47848F.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## ✨ Features

- 📊 **Dashboard** - Real-time inventory overview with key metrics
- 📦 **Master Data Management** - Manage products (Barang), suppliers, customers, categories, and areas
- 📈 **Stock Tracking** - Record incoming (Stock In) and outgoing (Stock Out) stock movements
- 🔄 **Stock Opname** - Physical stock count and adjustment
- 📝 **Customer Claims** - Handle customer complaints and returns
- 💰 **Ledger Management** - Track financial transactions and balances
- 📋 **Comprehensive Reports** - Stock reports, transaction history, stock alerts, and stock cards
- 👥 **User Management** - Multi-role authentication (Owner, Admin, Staff)
- 💾 **Backup & Restore** - Database backup and restore functionality
- 🖥️ **Desktop App** - Cross-platform desktop application with Electron
- 🎨 **Modern UI/UX** - Clean, intuitive interface with responsive design
- ⚡ **Fast Performance** - Built with Vite for lightning-fast development
- 🔍 **Advanced Search & Filtering** - Quick data discovery

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/stoir-inventory.git
   cd stoir-inventory
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run development server (Web)**

   ```bash
   npm run dev
   ```

4. **Run Electron desktop app**

   ```bash
   npm run electron:dev
   ```

5. **Open browser (Web mode)**
   Navigate to `http://localhost:3000`

---

## 📁 Project Structure

```
stoir-inventory/
├── public/                    # Static assets
├── src/
│   ├── api/                   # API configuration & services
│   │   ├── axios.js           # Axios instance with interceptors
│   │   └── movements.js       # Stock movement API
│   ├── components/            # Reusable components
│   │   ├── auth/              # Auth components (ProtectedRoute)
│   │   ├── layout/            # Layout components (Sidebar, Layout)
│   │   ├── shared/            # Shared components (ItemSelector)
│   │   └── ui/                # UI primitives (Button, Input, Modal, etc.)
│   ├── data/                  # Dummy data & constants
│   │   └── dummy/             # JSON mock data
│   ├── pages/                 # Page components
│   │   ├── Dashboard.jsx      # Dashboard page
│   │   ├── auth/              # Login page
│   │   ├── master/            # Master data pages
│   │   │   ├── AreaList.jsx & AreaForm.jsx
│   │   │   ├── BarangList.jsx & BarangForm.jsx
│   │   │   ├── KategoriList.jsx & KategoriForm.jsx
│   │   │   ├── SupplierList.jsx & SupplierForm.jsx
│   │   │   └── CustomerList.jsx & CustomerForm.jsx
│   │   ├── transactions/      # Transaction pages
│   │   │   ├── PurchaseForm.jsx (Stock In)
│   │   │   ├── SalesForm.jsx (Stock Out)
│   │   │   ├── StokOpnameForm.jsx
│   │   │   └── CustomerClaimForm.jsx
│   │   ├── reports/           # Report pages
│   │   │   ├── StokBarang.jsx
│   │   │   ├── KartuStok.jsx
│   │   │   ├── RiwayatTransaksi.jsx
│   │   │   └── StokAlert.jsx
│   │   └── settings/          # Settings pages
│   │       ├── ManajemenUser.jsx
│   │       ├── BackupRestore.jsx
│   │       └── LogAktivitas.jsx
│   ├── store/                 # State management (Zustand)
│   │   ├── authStore.js       # Authentication state
│   │   └── themeStore.js      # Theme & UI state
│   ├── styles/                # Global styles & theme
│   │   └── theme.js           # Design system constants
│   ├── tests/                 # Test setup
│   │   └── setup.js
│   ├── utils/                 # Utility functions
│   │   ├── helpers.js         # Helper functions
│   │   └── helpers.test.js    # Helper tests
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # App entry point
│   └── index.css              # Global CSS
├── electron/                  # Electron desktop app
│   ├── main.cjs               # Electron main process
│   ├── preload.cjs            # Preload script
│   └── server/                # Backend server
│       ├── app.cjs            # Fastify server setup
│       ├── db.cjs             # SQLite database (sql.js)
│       ├── auth/              # Auth utilities
│       │   └── password.cjs   # Password hashing
│       ├── routes/            # API routes
│       │   ├── areas.cjs
│       │   ├── auth.cjs
│       │   ├── categories.cjs
│       │   ├── customers.cjs
│       │   ├── customer-claims.cjs
│       │   ├── db-tools.cjs
│       │   ├── health.cjs
│       │   ├── items.cjs
│       │   ├── ledger.cjs
│       │   ├── reports.cjs
│       │   ├── stock-in.cjs
│       │   ├── stock-opname.cjs
│       │   ├── stock-out.cjs
│       │   ├── suppliers.cjs
│       │   └── users.cjs
│       └── scripts/           # Smoke test scripts
├── release/                   # Electron build output
├── DESIGN.md                  # Design system documentation
├── Dokum.md                   # System documentation (Indonesian)
├── FOLDER_STRUCTURE.md        # Project structure docs
├── HOW_TO_EXTEND.md           # Extension guide
├── KODE_GENERATION.md         # Code generation docs
├── PROJECT_SUMMARY.md         # Project summary
├── QUICKSTART.md              # Quick start guide
├── index.html                 # HTML entry point
├── package.json               # Dependencies & scripts
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── vite.config.js             # Vite configuration
├── vitest.config.js           # Vitest configuration
└── README.md                  # This file
```

---

## 🛠️ Tech Stack

### Frontend

| Technology          | Version | Description                  |
| ------------------- | ------- | ---------------------------- |
| **React**           | 19.1    | UI library                   |
| **Vite**            | 7.0     | Build tool & dev server      |
| **React Router**    | 7.7     | Client-side routing          |
| **Tailwind CSS**    | 3.4     | Utility-first CSS framework  |
| **Zustand**         | 5.0     | Lightweight state management |
| **React Query**     | 5.85    | Server state management      |
| **React Hook Form** | 7.54    | Form handling                |
| **Axios**           | 1.11    | HTTP client                  |
| **Lucide React**    | 0.447   | Icon library                 |
| **Material-UI**     | 5.16    | UI component library         |
| **React Toastify**  | 11.0    | Toast notifications          |

### Backend (Electron Server)

| Technology          | Version | Description                      |
| ------------------- | ------- | -------------------------------- |
| **Fastify**         | 5.6     | Web framework                    |
| **sql.js**          | 1.13    | SQLite database (in-memory/file) |
| **@fastify/cors**   | 10.1    | CORS support                     |
| **@fastify/static** | 8.3     | Static file serving              |

### Desktop App

| Technology           | Version | Description           |
| -------------------- | ------- | --------------------- |
| **Electron**         | 35.0    | Desktop app framework |
| **electron-builder** | 26.0    | Build & packaging     |

### Data & Export

| Technology   | Version | Description         |
| ------------ | ------- | ------------------- |
| **Chart.js** | 4.5     | Data visualization  |
| **Recharts** | 3.5     | React chart library |
| **jsPDF**    | 3.0     | PDF generation      |
| **XLSX**     | 0.18    | Excel export        |

### Development Tools

| Technology          | Version | Description             |
| ------------------- | ------- | ----------------------- |
| **Vitest**          | 3.2     | Unit testing            |
| **ESLint**          | 9.34    | Code linting            |
| **MSW**             | 2.7     | Mock Service Worker     |
| **Testing Library** | 16.1    | React testing utilities |

---

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server (http://localhost:3000)
npm run electron:dev     # Start Electron app with hot reload

# Build
npm run build            # Build for production (web)
npm run electron:build   # Build Electron app
npm run electron:pack    # Build & pack Electron (unpacked)
npm run electron:dist    # Build & distribute Electron
npm run electron:dist:win # Build for Windows

# Preview
npm run preview          # Preview production build

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Open Vitest UI

# Linting
npm run lint             # Lint code with ESLint
```

---

## 🗄️ Database Schema

Aplikasi menggunakan **SQLite** (via sql.js) dengan tabel-tabel berikut:

### Master Tables

| Table        | Description                         |
| ------------ | ----------------------------------- |
| `m_user`     | User accounts (owner, admin, staff) |
| `m_area`     | Area/region master                  |
| `m_kategori` | Product categories                  |
| `m_supplier` | Supplier master                     |
| `m_customer` | Customer master                     |
| `m_barang`   | Product/item master                 |

### Transaction Tables

| Table                  | Description          |
| ---------------------- | -------------------- |
| `t_stok_masuk`         | Stock in header      |
| `t_stok_masuk_detail`  | Stock in line items  |
| `t_stok_keluar`        | Stock out header     |
| `t_stok_keluar_detail` | Stock out line items |
| `t_stok_opname`        | Stock opname records |
| `t_customer_claim`     | Customer claims      |
| `t_ledger`             | Financial ledger     |

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/login         # User login
POST   /api/auth/logout        # User logout
GET    /api/auth/me            # Get current user
```

### Master Data

```
GET    /api/areas              # List areas
POST   /api/areas              # Create area
GET    /api/categories         # List categories
POST   /api/categories         # Create category
GET    /api/suppliers          # List suppliers
POST   /api/suppliers          # Create supplier
GET    /api/customers          # List customers
POST   /api/customers          # Create customer
GET    /api/items              # List products
POST   /api/items              # Create product
```

### Transactions

```
GET    /api/stock-in           # List stock in
POST   /api/stock-in           # Create stock in
GET    /api/stock-out          # List stock out
POST   /api/stock-out          # Create stock out
POST   /api/stock-opname       # Create stock opname
GET    /api/customer-claims    # List customer claims
POST   /api/customer-claims    # Create claim
GET    /api/ledger             # Get ledger entries
```

### Reports & Tools

```
GET    /api/reports/stock      # Stock report
GET    /api/reports/movement   # Movement report
GET    /api/health             # Health check
POST   /api/db/backup          # Database backup
POST   /api/db/restore         # Database restore
```

---

## 🎨 Design System

### Colors

```js
Primary:   #3B82F6 (Blue)
Success:   #10B981 (Green)
Warning:   #F59E0B (Yellow)
Error:     #EF4444 (Red)
Secondary: #6B7280 (Gray)
```

### Typography

```js
Font Family: Inter, Roboto, Helvetica, Arial
Sizes: 12px - 40px (caption to h1)
Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
```

### Spacing

```js
xs:  4px   | sm: 8px  | md: 16px
lg:  24px  | xl: 32px | 2xl: 48px
```

See [DESIGN.md](./DESIGN.md) for complete design specifications.

---

## 📱 Responsive Breakpoints

```js
xs:  0px     // Mobile portrait
sm:  640px   // Mobile landscape
md:  768px   // Tablet
lg:  1024px  // Desktop
xl:  1280px  // Large desktop
2xl: 1536px  // Extra large
```

---

## � Authentication

The app uses JWT-based authentication with role-based access control.

**User Roles**:

- **Owner** - Full access to all features
- **Admin** - Manage master data and transactions
- **Staff** - Limited access to transactions only

**Login Flow**:

1. User submits credentials (username + password)
2. Server validates and returns JWT token
3. Token stored in auth store (Zustand)
4. Token attached to all API requests via Axios interceptor
5. On 401 error, user is logged out and redirected to login

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# UI mode
npm run test:ui

# Coverage
npm run test -- --coverage
```

Tests are located alongside components:

```
src/
  components/
    ui/
      Button.jsx
      Button.test.jsx
```

---

## 📦 Build & Deployment

### Build for Web (Production)

```bash
npm run build
```

Output: `dist/` folder

### Build Electron Desktop App

```bash
# Windows
npm run electron:dist:win

# All platforms
npm run electron:dist
```

Output: `release/` folder

### Preview Production Build (Web)

```bash
npm run preview
```

---

## 🎯 Key Features Implemented

### ✅ Completed

- [x] Project setup (Vite + React + Tailwind + Electron)
- [x] Design system & theme configuration
- [x] Layout components (Sidebar, Layout)
- [x] Reusable UI components (Button, Input, Modal, DataTable, Badge)
- [x] Dashboard with widgets & stats
- [x] Authentication system (JWT-based)
- [x] Role-based access control (Owner, Admin, Staff)
- [x] **Master Data**
  - [x] Area (List + Form)
  - [x] Kategori/Category (List + Form)
  - [x] Supplier (List + Form)
  - [x] Customer (List + Form)
  - [x] Barang/Product (List + Form)
- [x] **Transactions**
  - [x] Stock In (Purchase)
  - [x] Stock Out (Sales)
  - [x] Stock Opname
  - [x] Customer Claims
- [x] **Reports**
  - [x] Stok Barang (Stock Report)
  - [x] Kartu Stok (Stock Card)
  - [x] Riwayat Transaksi (Transaction History)
  - [x] Stok Alert (Low Stock Alert)
- [x] **Settings**
  - [x] User Management
  - [x] Backup & Restore
  - [x] Activity Log
- [x] SQLite database with sql.js
- [x] RESTful API with Fastify
- [x] Electron desktop app
- [x] Windows build support
- [x] Responsive design
- [x] Form validation
- [x] Export to PDF/Excel

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Design inspiration from modern SaaS dashboards
- Icons by [Lucide](https://lucide.dev/)
- UI components inspired by [Shadcn UI](https://ui.shadcn.com/)
- Documentation structure from best practices

---

**Built with ❤️ by STOIR Development Team**

**Version**: 1.6.0  
**Last Updated**: January 2026
