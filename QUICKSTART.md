# 🚀 STOIR PROJECT - QUICK START GUIDE

## 📦 Installation Steps

### 1. Install Node.js
Download and install Node.js 18+ from https://nodejs.org

### 2. Clone & Setup
```bash
cd c:\Users\joo\Documents\GitHub\Inventory
npm install
```

### 3. Configure Environment
File `.env` sudah tersedia dengan konfigurasi default.

### 4. Run Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di http://localhost:3000

---

## 🎯 Implemented Features

### ✅ Dashboard
- Stat cards (Total SKU, Stock Value, Today's Transactions)
- Low stock alerts
- Recent activity (purchases & sales)
- Quick action buttons

### ✅ Data Barang (Master Data)
- **List Page**: Search, filter, pagination, sort
- **Form**: Create/Edit/View with validation
- **Actions**: View, Edit, Delete with confirmation

### ✅ Stok Masuk (Purchase)
- **Form**: Purchase order with supplier selection
- **Line Items**: Add/remove items with quantity & price
- **Item Selector**: Modal to search and select products
- **Calculation**: Real-time subtotal and total

### ✅ UI Components
- Button (7 variants, 3 sizes, loading state)
- Input (with icons, validation, helper text)
- Select (dropdown with options)
- DataTable (pagination, sort, actions)
- Modal (5 sizes, header, footer)
- Card (with title, actions, padding options)
- Badge (6 variants, 3 sizes)

### ✅ Layout
- Sidebar (collapsible, active states)
- Topbar (search, notifications, user menu)
- Responsive (mobile, tablet, desktop)

---

## 📂 Project Structure

```
src/
├── api/              # Axios configuration
├── components/
│   ├── layout/       # Sidebar, Topbar, Layout
│   ├── shared/       # ItemSelector
│   └── ui/           # Button, Input, Modal, etc.
├── data/dummy/       # JSON mock data
├── pages/
│   ├── Dashboard.jsx
│   ├── master/       # BarangList, BarangForm
│   └── transactions/ # PurchaseForm
├── store/            # Zustand stores
├── styles/           # Theme configuration
└── utils/            # Helper functions
```

---

## 🎨 Design System

**Colors**: Primary (Blue #3B82F6), Success (Green), Warning (Yellow), Error (Red)

**Typography**: Inter font, sizes 12px-40px

**Spacing**: 4px, 8px, 16px, 24px, 32px, 48px

**Components**: Consistent styling across all UI elements

See `DESIGN.md` for complete specifications.

---

## 🔌 API Integration

Update `.env` file:
```env
VITE_API_BASE_URL=http://your-api-url/api
```

API client configured in `src/api/axios.js` with:
- Automatic JWT token attachment
- 401 error handling (auto logout)
- Request/response interceptors

---

## 📝 Next Steps (Extend the App)

1. **Add more Master Data pages**:
   - Copy `src/pages/master/BarangList.jsx` as template
   - Update columns, API endpoints, form fields

2. **Add Sales Transaction**:
   - Similar to Purchase form
   - Add customer selection instead of supplier
   - Include discount calculation

3. **Add Reports**:
   - Use Chart.js for visualizations
   - Export to PDF (jsPDF) and Excel (XLSX)

4. **Implement Authentication**:
   - Create login page
   - Connect to auth API
   - Protect routes with auth guard

5. **Dark Mode**:
   - Toggle already in Topbar
   - Add dark variants in Tailwind config
   - Apply conditional classes

---

## 🐛 Troubleshooting

### Issue: Port 3000 already in use
**Solution**: Change port in `vite.config.js` or kill process on port 3000

### Issue: Module not found
**Solution**: Run `npm install` again

### Issue: Tailwind styles not applied
**Solution**: Check `tailwind.config.js` content paths

---

## 📚 Documentation

- **README.md**: Complete setup and feature documentation
- **DESIGN.md**: Design system and component specifications
- **Dokum.md**: System documentation (Indonesian)

---

## ✅ Acceptance Criteria - ALL MET

✅ Navigasi sidebar berfungsi (collapse/expand, active state)  
✅ Dashboard tampilkan 3+ widget: SKU, stock value, low stock  
✅ Data Barang: search, filter, pagination, CRUD dengan validasi  
✅ Stok Masuk: tambah item, kalkulasi subtotal, preview  
✅ Layout responsif ke mobile (sidebar toggle, stacked content)

---

**Happy Coding! 🚀**
