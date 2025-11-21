# 📂 FOLDER STRUCTURE - STOIR Inventory

```
stoir-inventory/
│
├── .vscode/                          # VS Code workspace settings
│   ├── extensions.json               # Recommended extensions
│   └── settings.json                 # Editor settings
│
├── public/                           # Static assets (favicon, etc.)
│
├── src/                              # Source code
│   │
│   ├── api/                          # API configuration
│   │   └── axios.js                  # Axios instance with interceptors
│   │
│   ├── components/                   # React components
│   │   │
│   │   ├── layout/                   # Layout components
│   │   │   ├── Layout.jsx            # Main layout wrapper
│   │   │   ├── Sidebar.jsx           # Collapsible sidebar with menu
│   │   │   └── Topbar.jsx            # Top navigation bar
│   │   │
│   │   ├── shared/                   # Shared business components
│   │   │   └── ItemSelector.jsx      # Product selector modal
│   │   │
│   │   └── ui/                       # Reusable UI components
│   │       ├── Badge.jsx             # Status badges
│   │       ├── Badge.test.jsx        # Badge tests
│   │       ├── Button.jsx            # Button component
│   │       ├── Button.test.jsx       # Button tests
│   │       ├── Card.jsx              # Card container
│   │       ├── DataTable.jsx         # Data grid with pagination
│   │       ├── Input.jsx             # Text input
│   │       ├── Modal.jsx             # Modal dialog
│   │       └── Select.jsx            # Dropdown select
│   │
│   ├── data/                         # Data files
│   │   └── dummy/                    # Mock data for development
│   │       ├── m_barang.json         # Product data
│   │       ├── m_customer.json       # Customer data
│   │       ├── m_kategori.json       # Category data
│   │       └── m_supplier.json       # Supplier data
│   │
│   ├── pages/                        # Page components
│   │   │
│   │   ├── master/                   # Master data pages
│   │   │   ├── BarangForm.jsx        # Product form (create/edit)
│   │   │   └── BarangList.jsx        # Product list page
│   │   │
│   │   ├── transactions/             # Transaction pages
│   │   │   └── PurchaseForm.jsx      # Purchase order form
│   │   │
│   │   └── Dashboard.jsx             # Main dashboard
│   │
│   ├── store/                        # State management (Zustand)
│   │   ├── authStore.js              # Authentication state
│   │   └── themeStore.js             # Theme & UI preferences
│   │
│   ├── styles/                       # Style configurations
│   │   └── theme.js                  # Design system constants
│   │
│   ├── tests/                        # Test configuration
│   │   └── setup.js                  # Test setup file
│   │
│   ├── utils/                        # Utility functions
│   │   ├── helpers.js                # Helper functions
│   │   └── helpers.test.js           # Helper tests
│   │
│   ├── App.jsx                       # Main App component
│   ├── main.jsx                      # Application entry point
│   └── index.css                     # Global CSS styles
│
├── .env                              # Environment variables
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
│
├── DESIGN.md                         # Design system documentation
├── Dokum.md                          # System documentation (ID)
├── LICENSE                           # MIT License
├── PROJECT_SUMMARY.md                # Project completion summary
├── QUICKSTART.md                     # Quick start guide
├── README.md                         # Main documentation
│
├── eslint.config.js                  # ESLint configuration
├── index.html                        # HTML entry point
├── package.json                      # Dependencies & scripts
├── postcss.config.js                 # PostCSS configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── vite.config.js                    # Vite configuration
└── vitest.config.js                  # Vitest test configuration
```

## 📊 File Count Summary

### Source Files
- **React Components**: 15 files
  - Layout: 3 files
  - Shared: 1 file
  - UI: 7 files
  - Pages: 4 files

- **Configuration**: 9 files
  - Build tools (Vite, Tailwind, PostCSS)
  - Testing (Vitest, ESLint)
  - Environment (.env)
  - VS Code settings

- **State & Logic**: 6 files
  - Stores: 2 files
  - API: 1 file
  - Utils: 1 file
  - App & Entry: 2 files

- **Data**: 4 JSON files
  - Mock master data

- **Tests**: 3 files
  - Component tests
  - Helper tests

### Documentation
- **4 major docs**:
  - README.md (main)
  - DESIGN.md (design system)
  - QUICKSTART.md (quick ref)
  - PROJECT_SUMMARY.md (completion)

- **1 system doc**:
  - Dokum.md (Indonesian)

### Total: ~50 files

---

## 🎯 Key Directories Explained

### `/src/components/`
All React components organized by purpose:
- **layout**: App-wide layout (sidebar, topbar)
- **shared**: Business logic components (item selector)
- **ui**: Pure, reusable UI primitives

### `/src/pages/`
Route-level page components:
- Each page is self-contained
- Can be lazy-loaded for performance
- Organized by feature area

### `/src/store/`
Global state management:
- Zustand stores
- Persisted to localStorage
- Small, focused stores

### `/src/utils/`
Pure utility functions:
- Formatting (currency, dates)
- Calculations
- Validation helpers

### `/src/data/dummy/`
Development mock data:
- JSON files matching API structure
- Used for offline development
- Easy to swap with real API

---

## 🚀 Import Path Aliases

Configured in `vite.config.js`:

```js
'@' → './src'
'@components' → './src/components'
'@pages' → './src/pages'
'@hooks' → './src/hooks'
'@utils' → './src/utils'
'@data' → './src/data'
'@styles' → './src/styles'
'@api' → './src/api'
```

**Usage Example**:
```js
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/utils/helpers'
import api from '@/api/axios'
```

---

## 📝 Naming Conventions

### Files
- **Components**: PascalCase (Button.jsx, ItemSelector.jsx)
- **Utils**: camelCase (helpers.js, api.js)
- **Stores**: camelCase + Store suffix (authStore.js)
- **Config**: kebab-case (vite.config.js)
- **Docs**: UPPERCASE.md (README.md)

### Folders
- **lowercase**: components, pages, utils
- **/feature**: for grouping (layout, master, transactions)

---

## 🎨 Component Organization

### UI Components (`/components/ui/`)
Pure, presentational components:
- No business logic
- Accept props only
- Fully reusable
- Can be used across any project

### Shared Components (`/components/shared/`)
Business logic components:
- Feature-specific
- May connect to stores/API
- Reusable within this project

### Layout Components (`/components/layout/`)
App structure components:
- Sidebar, Topbar
- Layout wrapper
- Used once per app

---

## 🔄 Data Flow

```
User Action
    ↓
Page Component
    ↓
Shared Component (optional)
    ↓
UI Component
    ↓
Event Handler
    ↓
API Call (via axios) OR Store Update
    ↓
State Change
    ↓
Re-render
```

---

## ✅ Best Practices Applied

1. **Separation of Concerns**
   - UI components separate from business logic
   - Pages compose components
   - Utilities are pure functions

2. **Co-location**
   - Test files next to components
   - Related files grouped in folders

3. **Scalability**
   - Easy to add new pages/features
   - Clear folder structure
   - Consistent patterns

4. **Developer Experience**
   - Path aliases for clean imports
   - VS Code settings included
   - Comprehensive documentation

---

**Note**: This structure is designed to scale. As the app grows, you can:
- Add more pages under `/pages/`
- Create new UI components in `/components/ui/`
- Add custom hooks in `/hooks/`
- Expand stores in `/store/`

All following the same organizational principles!
