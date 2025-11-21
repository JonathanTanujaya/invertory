# 🚀 HOW TO EXTEND - STOIR Inventory

Panduan lengkap untuk menambahkan fitur baru ke project STOIR Inventory.

---

## 📋 Table of Contents
1. [Adding New Master Data Page](#adding-new-master-data-page)
2. [Adding New Transaction Page](#adding-new-transaction-page)
3. [Creating New UI Component](#creating-new-ui-component)
4. [Adding New API Endpoint](#adding-new-api-endpoint)
5. [Implementing Dark Mode](#implementing-dark-mode)
6. [Adding Export Features](#adding-export-features)
7. [Creating Reports](#creating-reports)

---

## 1️⃣ Adding New Master Data Page

**Example**: Adding Supplier page

### Step 1: Create List Page

Copy `src/pages/master/BarangList.jsx` to `src/pages/master/SupplierList.jsx`

**Modify**:
```jsx
// Update columns
const columns = [
  { key: 'kode_supplier', label: 'Kode', sortable: true },
  { key: 'nama_supplier', label: 'Nama Supplier', sortable: true },
  { key: 'telepon', label: 'Telepon' },
  { key: 'email', label: 'Email' },
  // ... add more columns
];

// Update title
<h1>Data Supplier</h1>

// Update API endpoint in fetchData()
const response = await api.get('/supplier');
```

### Step 2: Create Form Component

Copy `src/pages/master/BarangForm.jsx` to `src/pages/master/SupplierForm.jsx`

**Modify**:
```jsx
// Update form fields
<Input
  label="Kode Supplier"
  {...register('kode_supplier', { required: 'Kode supplier wajib diisi' })}
/>
<Input
  label="Nama Supplier"
  {...register('nama_supplier', { required: 'Nama supplier wajib diisi' })}
/>
<Input
  label="Telepon"
  {...register('telepon')}
/>
// ... add more fields
```

### Step 3: Add Route

In `src/App.jsx`:
```jsx
import SupplierList from './pages/master/SupplierList';

// Add route
<Route path="master">
  <Route path="supplier" element={<SupplierList />} />
</Route>
```

### Step 4: Update Sidebar

Menu already configured in `src/components/layout/Sidebar.jsx`. Route will work automatically.

### Step 5: Add Mock Data

Create `src/data/dummy/m_supplier.json` (already exists!)

---

## 2️⃣ Adding New Transaction Page

**Example**: Adding Sales (Penjualan) page

### Step 1: Create Form Page

Copy `src/pages/transactions/PurchaseForm.jsx` to `src/pages/transactions/SalesForm.jsx`

**Key Changes**:
```jsx
// Change title
<h1>Stok Keluar (Penjualan)</h1>

// Change supplier to customer
<Select
  label="Customer"
  {...register('kode_customer', { required: 'Customer wajib dipilih' })}
  options={customerOptions}
/>

// Add discount field to line items
<Input
  label="Diskon (%)"
  type="number"
  value={item.diskon}
  onChange={(e) => handleUpdateItem(index, 'diskon', e.target.value)}
/>

// Update calculation
const calculateSubtotal = (item) => {
  const subtotal = item.jumlah * item.harga_satuan;
  return subtotal - (subtotal * item.diskon / 100);
};

// Update API endpoint
const response = await api.post('/penjualan', payload);
```

### Step 2: Add Route

```jsx
import SalesForm from './pages/transactions/SalesForm';

<Route path="transactions">
  <Route path="penjualan" element={<SalesForm />} />
</Route>
```

### Step 3: Update Item Selector

If needed, modify `src/components/shared/ItemSelector.jsx` to show selling prices instead of buying prices for sales form.

**Optional**: Create separate `ItemSelectorSales.jsx` with different display.

---

## 3️⃣ Creating New UI Component

**Example**: Creating Textarea component

### Step 1: Create Component File

`src/components/ui/Textarea.jsx`:
```jsx
import { clsx } from 'clsx';
import { forwardRef } from 'react';

const Textarea = forwardRef(({
  label,
  error,
  helperText,
  className,
  containerClassName,
  rows = 4,
  ...props
}, ref) => {
  return (
    <div className={clsx('w-full', containerClassName)}>
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        rows={rows}
        className={clsx(
          'w-full px-3 py-2 border rounded-md transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          error ? 'border-error-500' : 'border-gray-300',
          className
        )}
        {...props}
      />
      
      {(error || helperText) && (
        <p className={clsx(
          'mt-1 text-sm',
          error ? 'text-error-500' : 'text-gray-500'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
```

### Step 2: Create Test File (Optional)

`src/components/ui/Textarea.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Textarea from './Textarea';

describe('Textarea Component', () => {
  it('renders textarea with label', () => {
    render(<Textarea label="Description" />);
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Textarea error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });
});
```

### Step 3: Use Component

```jsx
import Textarea from '@/components/ui/Textarea';

<Textarea
  label="Catatan"
  {...register('catatan')}
  rows={4}
  placeholder="Masukkan catatan tambahan..."
/>
```

---

## 4️⃣ Adding New API Endpoint

### Step 1: Create Service File (Optional)

`src/api/supplierService.js`:
```jsx
import api from './axios';

export const supplierService = {
  getAll: (params) => api.get('/supplier', { params }),
  getById: (id) => api.get(`/supplier/${id}`),
  create: (data) => api.post('/supplier', data),
  update: (id, data) => api.put(`/supplier/${id}`, data),
  delete: (id) => api.delete(`/supplier/${id}`),
};
```

### Step 2: Use in Component

```jsx
import { supplierService } from '@/api/supplierService';

const fetchSuppliers = async () => {
  try {
    const response = await supplierService.getAll({ page: 1, limit: 10 });
    setData(response.data);
  } catch (error) {
    toast.error('Gagal memuat data supplier');
  }
};
```

### Step 3: Use React Query (Recommended)

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierService } from '@/api/supplierService';

function SupplierList() {
  const queryClient = useQueryClient();

  // Fetch data
  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', page],
    queryFn: () => supplierService.getAll({ page, limit: 10 }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: supplierService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers']);
      toast.success('Supplier berhasil ditambahkan');
    },
    onError: () => {
      toast.error('Gagal menambahkan supplier');
    },
  });

  // Use mutation
  const handleSubmit = (values) => {
    createMutation.mutate(values);
  };
}
```

---

## 5️⃣ Implementing Dark Mode

### Step 1: Update Tailwind Config

`tailwind.config.js`:
```js
export default {
  darkMode: 'class', // Enable class-based dark mode
  // ... rest of config
}
```

### Step 2: Add Dark Classes

Update components to include dark mode classes:
```jsx
// Example: Card component
<div className={clsx(
  'bg-white dark:bg-gray-800',
  'border border-gray-200 dark:border-gray-700',
  'text-gray-900 dark:text-gray-100'
)}>
```

### Step 3: Toggle Implementation

Already exists in `src/components/layout/Topbar.jsx`:
```jsx
const { mode, toggleTheme } = useThemeStore();

<button onClick={toggleTheme}>
  {mode === 'light' ? <Moon /> : <Sun />}
</button>
```

### Step 4: Apply Dark Class

`src/App.jsx`:
```jsx
import { useThemeStore } from '@/store/themeStore';
import { useEffect } from 'react';

function App() {
  const { mode } = useThemeStore();

  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  // ... rest of component
}
```

---

## 6️⃣ Adding Export Features

### Export to Excel

**Install**: Already included (xlsx)

**Implementation**:
```jsx
import * as XLSX from 'xlsx';

const exportToExcel = (data, filename = 'export.xlsx') => {
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  // Save file
  XLSX.writeFile(workbook, filename);
};

// Usage
<Button onClick={() => exportToExcel(data, 'data-barang.xlsx')}>
  Export Excel
</Button>
```

### Export to PDF

**Install**: Already included (jsPDF)

**Implementation**:
```jsx
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // For tables

const exportToPDF = (data, filename = 'export.pdf') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text('Laporan Data Barang', 14, 20);
  
  // Add table
  doc.autoTable({
    startY: 30,
    head: [['Kode', 'Nama', 'Stok', 'Harga']],
    body: data.map(item => [
      item.kode_barang,
      item.nama_barang,
      item.stok,
      formatCurrency(item.harga_jual)
    ]),
  });
  
  // Save
  doc.save(filename);
};

// Usage
<Button onClick={() => exportToPDF(data, 'data-barang.pdf')}>
  Export PDF
</Button>
```

---

## 7️⃣ Creating Reports

### Step 1: Create Report Page

`src/pages/reports/StokReport.jsx`:
```jsx
import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function StokReport() {
  const [data, setData] = useState([]);

  // Fetch report data
  useEffect(() => {
    fetchReportData();
  }, []);

  const chartData = {
    labels: data.map(item => item.nama_barang),
    datasets: [
      {
        label: 'Stok',
        data: data.map(item => item.stok),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Laporan Stok Barang',
      },
    },
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Laporan Stok</h1>
      
      <Card>
        <Bar data={chartData} options={options} />
      </Card>

      <Card className="mt-6">
        <DataTable columns={columns} data={data} />
      </Card>
    </div>
  );
}
```

### Step 2: Add Route

```jsx
import StokReport from './pages/reports/StokReport';

<Route path="reports">
  <Route path="stok-barang" element={<StokReport />} />
</Route>
```

---

## 📚 Common Patterns

### Loading State
```jsx
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const response = await api.get('/endpoint');
    setData(response.data);
  } finally {
    setLoading(false);
  }
};
```

### Error Handling
```jsx
try {
  await api.post('/endpoint', data);
  toast.success('Berhasil');
} catch (error) {
  const message = error.response?.data?.message || 'Terjadi kesalahan';
  toast.error(message);
}
```

### Form Validation with React Hook Form
```jsx
const { register, handleSubmit, formState: { errors } } = useForm();

<Input
  {...register('field', {
    required: 'Field wajib diisi',
    minLength: { value: 3, message: 'Minimal 3 karakter' },
    pattern: { value: /^[A-Z0-9]+$/, message: 'Hanya huruf kapital dan angka' }
  })}
  error={errors.field?.message}
/>
```

### Confirmation Dialog
```jsx
const handleDelete = async (item) => {
  if (window.confirm(`Hapus ${item.nama}?`)) {
    try {
      await api.delete(`/endpoint/${item.id}`);
      toast.success('Berhasil dihapus');
      fetchData();
    } catch (error) {
      toast.error('Gagal menghapus');
    }
  }
};
```

---

## 🎯 Tips & Best Practices

1. **Keep Components Small**: One component = one responsibility
2. **Use TypeScript** (optional): Add types for better DX
3. **Test Critical Paths**: Focus on business logic
4. **Optimize Performance**: Use React.memo, useMemo, useCallback when needed
5. **Consistent Naming**: Follow existing patterns
6. **Document Complex Logic**: Add comments for future you
7. **Reuse Components**: Before creating new, check if exists
8. **Handle Edge Cases**: Empty states, errors, loading
9. **Mobile First**: Design for mobile, enhance for desktop
10. **Accessibility**: Use semantic HTML, ARIA labels

---

## 🚀 Next Features to Implement

### Priority 1 (High Value)
- [ ] Sales transaction form
- [ ] Supplier & Customer pages
- [ ] User authentication & login
- [ ] Reports with charts

### Priority 2 (Medium Value)
- [ ] Return transactions
- [ ] Stock opname
- [ ] Export features (PDF/Excel)
- [ ] Advanced filtering

### Priority 3 (Nice to Have)
- [ ] Dark mode complete
- [ ] Offline mode
- [ ] Bulk operations
- [ ] User management
- [ ] Activity logs
- [ ] Notifications system

---

## 📞 Need Help?

1. Check existing components for examples
2. Refer to documentation (DESIGN.md, README.md)
3. Look at similar implementations in codebase
4. Review React Query, React Hook Form docs
5. Test in isolation before integrating

---

**Happy Building! 🚀**
