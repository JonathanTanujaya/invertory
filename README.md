# 📦 STOIR - Sistem Inventory Management

> Modern, responsive inventory management system built with React, Vite, and Tailwind CSS

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/react-19.1.0-61dafb.svg)
![Vite](https://img.shields.io/badge/vite-7.0.4-646cff.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## ✨ Features

- 📊 **Dashboard** - Real-time inventory overview with key metrics
- 📦 **Master Data Management** - Manage products, suppliers, customers, categories
- 📈 **Stock Tracking** - Record incoming and outgoing stock movements
- 💰 **Financial Management** - Handle payments, receivables, and balances
- 📋 **Comprehensive Reports** - Generate stock, purchase, and sales reports
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
   # or
   yarn install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   VITE_API_TIMEOUT=30000
   VITE_DEFAULT_PAGE_SIZE=10
   VITE_ENABLE_OFFLINE_MODE=false
   VITE_ENABLE_DARK_MODE=true
   ```

4. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open browser**
   Navigate to `http://localhost:3000`

---

## 📁 Project Structure

```
stoir-inventory/
├── public/                 # Static assets
├── src/
│   ├── api/               # API configuration & services
│   │   └── axios.js       # Axios instance with interceptors
│   ├── components/        # Reusable components
│   │   ├── layout/        # Layout components (Sidebar, Topbar)
│   │   ├── shared/        # Shared components (ItemSelector)
│   │   └── ui/            # UI primitives (Button, Input, Modal)
│   ├── data/              # Dummy data & constants
│   │   └── dummy/         # JSON mock data
│   ├── pages/             # Page components
│   │   ├── Dashboard.jsx  # Dashboard page
│   │   ├── master/        # Master data pages
│   │   ├── transactions/  # Transaction pages
│   │   └── reports/       # Report pages
│   ├── store/             # State management (Zustand)
│   │   ├── authStore.js   # Authentication state
│   │   └── themeStore.js  # Theme & UI state
│   ├── styles/            # Global styles & theme
│   │   └── theme.js       # Design system constants
│   ├── utils/             # Utility functions
│   │   └── helpers.js     # Helper functions
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # App entry point
│   └── index.css          # Global CSS
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── DESIGN.md              # Design system documentation
├── Dokum.md               # System documentation (Indonesian)
├── index.html             # HTML entry point
├── package.json           # Dependencies & scripts
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── vite.config.js         # Vite configuration
└── README.md              # This file
```

---

## 🛠️ Tech Stack

### Core
- **React 19.1** - UI library
- **Vite 7** - Build tool
- **React Router 7** - Routing

### Styling
- **Tailwind CSS 3.4** - Utility-first CSS
- **Lucide React** - Icon library
- **clsx** - Class name utility

### State Management
- **Zustand 5** - Lightweight state management
- **React Query 5** - Server state management

### Forms & Validation
- **React Hook Form 7** - Form handling
- **Axios 1** - HTTP client

### UI Components
- **Material-UI 5** - Component library (optional)
- **React Toastify 11** - Toast notifications

### Data & Export
- **Chart.js 4** - Data visualization
- **jsPDF 3** - PDF generation
- **XLSX** - Excel export

---

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)

# Build
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Open Vitest UI

# Linting
npm run lint             # Lint code with ESLint
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

## 🔌 API Integration

The app is configured to connect to a REST API. Update `VITE_API_BASE_URL` in `.env`:

```env
VITE_API_BASE_URL=http://your-api-url.com/api
```

### API Endpoints

See [Dokum.md](./Dokum.md) for complete API documentation.

**Examples**:
```
GET    /api/barang              # List products
POST   /api/barang              # Create product
GET    /api/pembelian           # List purchases
POST   /api/penjualan           # Create sale
GET    /api/reports/stok        # Stock report
```

### Mock Data

For development without API, the app includes mock data in `src/data/dummy/`:
- `m_barang.json` - Products
- `m_kategori.json` - Categories
- `m_supplier.json` - Suppliers
- `m_customer.json` - Customers

---

## 🔐 Authentication

The app uses JWT-based authentication. Authentication state is managed with Zustand and persisted in localStorage.

**Login Flow**:
1. User submits credentials
2. API returns JWT token
3. Token stored in auth store
4. Token attached to all requests via Axios interceptor
5. On 401 error, user is logged out and redirected

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

### Build for Production

```bash
npm run build
```

Output: `dist/` folder

### Preview Production Build

```bash
npm run preview
```

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

### Deploy to Netlify

1. Build the app:
   ```bash
   npm run build
   ```

2. Deploy `dist/` folder via Netlify Dashboard or CLI

### Environment Variables

Set these in your hosting platform:
```
VITE_API_BASE_URL
VITE_API_TIMEOUT
VITE_DEFAULT_PAGE_SIZE
```

---

## 🎯 Key Features Implemented

### ✅ Completed
- [x] Project setup (Vite + React + Tailwind)
- [x] Design system & theme configuration
- [x] Layout components (Sidebar, Topbar)
- [x] Reusable UI components (Button, Input, Modal, DataTable)
- [x] Dashboard with widgets & stats
- [x] Master Data - Barang (list + form)
- [x] Transaction - Purchase form with line items
- [x] Item selector component
- [x] Routing & navigation
- [x] State management (auth, theme)
- [x] Dummy data & mock setup
- [x] Responsive design
- [x] Form validation

### 🚧 Todo (Extend as Needed)
- [ ] Additional master data pages (Supplier, Customer, etc.)
- [ ] Sales transaction form
- [ ] Return transactions
- [ ] Stock opname
- [ ] Finance pages
- [ ] Report pages with charts
- [ ] Export to PDF/Excel
- [ ] Dark mode implementation
- [ ] Advanced filtering
- [ ] Bulk operations
- [ ] User management
- [ ] Settings page

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

- 📧 Email: support@stoir.com
- 📚 Documentation: [Dokum.md](./Dokum.md)
- 🎨 Design Specs: [DESIGN.md](./DESIGN.md)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/stoir-inventory/issues)

---

## 🙏 Acknowledgments

- Design inspiration from modern SaaS dashboards
- Icons by [Lucide](https://lucide.dev/)
- UI components inspired by [Shadcn UI](https://ui.shadcn.com/)
- Documentation structure from best practices

---

**Built with ❤️ by STOIR Development Team**

**Version**: 1.0.0  
**Last Updated**: November 2024
