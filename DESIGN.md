# 🎨 DESIGN SPECIFICATION - STOIR INVENTORY SYSTEM

## 📋 Table of Contents
1. [Design System](#design-system)
2. [Screen Specifications](#screen-specifications)
3. [Component Library](#component-library)
4. [UX Patterns](#ux-patterns)
5. [Responsive Behavior](#responsive-behavior)
6. [Accessibility](#accessibility)

---

## 🎨 DESIGN SYSTEM

### Colors

**Primary Palette**
```
Primary Blue:
- 50:  #EFF6FF
- 100: #DBEAFE
- 500: #3B82F6 (main)
- 600: #2563EB (hover)
- 700: #1D4ED8 (active)
```

**Status Colors**
```
Success (Green):  #10B981
Warning (Yellow): #F59E0B
Error (Red):      #EF4444
Info (Blue):      #3B82F6
```

**Neutral Colors**
```
Gray Scale:
- 50:  #F9FAFB (background)
- 100: #F3F4F6 (input bg)
- 200: #E5E7EB (border)
- 500: #6B7280 (text secondary)
- 900: #111827 (text primary)
```

### Typography

**Font Family**: Inter, Roboto, Helvetica, Arial, sans-serif

**Font Sizes**
```
H1: 2.5rem (40px) - Bold
H2: 2rem (32px) - Semibold
H3: 1.75rem (28px) - Semibold
H4: 1.5rem (24px) - Semibold
H5: 1.25rem (20px) - Medium
H6: 1rem (16px) - Medium
Body: 0.875rem (14px) - Regular
Caption: 0.75rem (12px) - Regular
```

### Spacing

```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
```

### Shadows

```
Soft:   0 2px 8px rgba(0, 0, 0, 0.06)
Medium: 0 4px 16px rgba(0, 0, 0, 0.1)
Strong: 0 8px 24px rgba(0, 0, 0, 0.15)
```

### Border Radius

```
sm: 4px
md: 6px
lg: 8px
xl: 12px
```

### Icons

**Library**: Lucide React
**Size**: 16px (sm), 20px (md), 24px (lg)

---

## 📱 SCREEN SPECIFICATIONS

### 1. Dashboard

**Layout**: Full width with 4-column grid

**Widgets**:
- **Stat Cards** (4 columns on desktop, 2 on tablet, 1 on mobile)
  - Total SKU
  - Nilai Stok Total
  - Pembelian Hari Ini
  - Penjualan Hari Ini
  
- **Low Stock Alert** (Full width)
  - Red alert banner
  - List of items with stock below minimum
  
- **Recent Activity** (2 columns on desktop, 1 on mobile)
  - Latest Purchases
  - Latest Sales
  
- **Quick Actions** (4 columns grid)
  - Stok Masuk
  - Stok Keluar
  - Data Barang
  - Stok Opname

**Color Scheme**:
- Background: #F8FAFC
- Cards: White with soft shadow
- Alert: Red (#FEF2F2) background with red border

**Interactions**:
- Stat cards are static (display only)
- Alert items clickable → navigate to item detail
- Quick action cards → navigate to respective pages

---

### 2. Data Barang (List)

**Layout**: Single column with filters + table

**Header Section**:
- Title + subtitle
- Primary action button (Tambah Barang)

**Filter Section**:
- Search input (left)
- Category dropdown (center)
- Additional filters button (right)

**Table Section**:
- 8 columns: Kode, Nama, Kategori, Stok, Harga Beli, Harga Jual, Lokasi, Aksi
- Pagination at bottom
- Sortable columns (Kode, Nama, Kategori, Stok)
- Action buttons: View, Edit, Delete

**Responsive Behavior**:
- Desktop: Full table
- Tablet: Horizontal scroll
- Mobile: Card layout (stack rows)

**Interactions**:
- Search: debounced 300ms
- Sort: click column header
- Pagination: page size 10
- Actions: 
  - View → open modal (read-only)
  - Edit → open modal (editable)
  - Delete → confirm dialog

---

### 3. Data Barang (Form)

**Modal Layout**: Large (max-w-2xl)

**Form Sections**:

**Row 1** (2 columns):
- Kode Barang (disabled in edit mode)
- Nama Barang

**Row 2** (2 columns):
- Kategori (dropdown)
- Satuan (dropdown)

**Row 3** (2 columns):
- Stok (number)
- Stok Minimal (number)

**Row 4** (2 columns):
- Harga Beli (number)
- Harga Jual (number)

**Row 5** (full width):
- Lokasi Rak (text)

**Footer Actions**:
- Cancel button (outline)
- Save button (primary)

**Validation**:
- Required fields: Kode, Nama, Kategori, Satuan, Stok, Stok Minimal, Harga Beli, Harga Jual
- Min value: 0 for numeric fields
- Real-time validation on blur
- Error messages below fields

**Visual States**:
- Default: gray border
- Focus: blue border + ring
- Error: red border + error text
- Disabled: gray background

---

### 4. Stok Masuk (Purchase Form)

**Layout**: Three card sections

**Card 1: Informasi Pembelian**
- 2x2 grid
- Fields: No. Faktur, Supplier, Tanggal, Catatan

**Card 2: Daftar Barang**
- Header with "Tambah Item" button
- Empty state message when no items
- Line item rows:
  - Barang info (name + code)
  - Jumlah input
  - Harga Satuan input
  - Subtotal (calculated)
  - Delete button
- Footer: Total Pembelian (bold, large)

**Card 3: Actions**
- Batal (outline)
- Simpan Pembelian (primary)

**Item Selector Modal**:
- Search bar at top
- Scrollable list of items
- Each item shows: name, code, category, stock, prices
- Click item to select

**Interactions**:
- Add Item → open modal
- Select Item → add to list
- Update Jumlah/Harga → recalculate subtotal
- Remove Item → confirm then remove
- Submit → validate (min 1 item) → save

**Calculations**:
- Subtotal = Jumlah × Harga Satuan
- Total = Sum of all subtotals

**Validation**:
- Required: No. Faktur, Supplier, Tanggal
- Min 1 item in list
- Jumlah min: 1
- Harga min: 0

---

## 🧩 COMPONENT LIBRARY

### Card
**Purpose**: Container component with optional header

**Variants**:
- Default: white background, soft shadow
- With title: shows header section
- With actions: shows action buttons in header
- With/without padding

**Props**:
```jsx
<Card
  title="Card Title"
  actions={<Button>Action</Button>}
  padding={true}
  className="custom-class"
>
  Content
</Card>
```

---

### Button
**Purpose**: Action buttons

**Variants**:
- primary: blue background
- secondary: gray background
- success: green background
- warning: yellow background
- error: red background
- outline: transparent with border
- ghost: transparent, hover gray

**Sizes**: sm, md, lg

**States**: default, hover, focus, disabled, loading

**Props**:
```jsx
<Button
  variant="primary"
  size="md"
  loading={false}
  disabled={false}
  startIcon={<Icon />}
  endIcon={<Icon />}
  onClick={handler}
>
  Button Text
</Button>
```

---

### Input
**Purpose**: Text input fields

**Features**:
- Label (optional)
- Error message
- Helper text
- Start/end icons
- Required indicator

**States**: default, focus, error, disabled

**Props**:
```jsx
<Input
  label="Field Label"
  error="Error message"
  helperText="Helper text"
  startIcon={<Icon />}
  required
  disabled={false}
  {...register('field')}
/>
```

---

### Select
**Purpose**: Dropdown selection

**Features**:
- Label (optional)
- Placeholder
- Options array
- Error message

**Props**:
```jsx
<Select
  label="Select Label"
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ]}
  placeholder="Choose..."
  error="Error message"
  {...register('field')}
/>
```

---

### DataTable
**Purpose**: Data grid with pagination and sorting

**Features**:
- Column definitions
- Sortable columns
- Pagination controls
- Loading state
- Empty state
- Custom cell renderers
- Row selection (optional)
- Bulk actions (optional)

**Props**:
```jsx
<DataTable
  columns={[
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      align: 'center',
      render: (value, row) => <span>{value}</span>
    }
  ]}
  data={items}
  loading={false}
  pagination={true}
  currentPage={1}
  pageSize={10}
  totalItems={100}
  onPageChange={handler}
  onSort={handler}
  selectable={false}
  onSelectionChange={handler}
/>
```

---

### Modal
**Purpose**: Overlay dialog

**Sizes**: sm (max-w-md), md (max-w-2xl), lg (max-w-4xl), xl (max-w-6xl), full

**Features**:
- Header with title and close button
- Scrollable body
- Footer with actions

**Props**:
```jsx
<Modal
  open={true}
  onClose={handler}
  title="Modal Title"
  size="md"
  footer={<Button>Action</Button>}
  closeOnOverlay={true}
>
  Content
</Modal>
```

---

### Badge
**Purpose**: Status indicators

**Variants**: default, primary, success, warning, error, info

**Sizes**: sm, md, lg

**Props**:
```jsx
<Badge variant="success" size="sm">
  Active
</Badge>
```

---

### ItemSelector
**Purpose**: Search and select items from inventory

**Features**:
- Search input with debounce
- Scrollable item list
- Item preview (name, code, category, stock, prices)
- Click to select

**Props**:
```jsx
<ItemSelector
  onSelect={(item) => console.log(item)}
  onClose={() => setOpen(false)}
/>
```

---

## 🔄 UX PATTERNS

### Loading States

**Data Loading**:
- Show spinner in center
- Disable interactions
- Maintain layout (no shift)

**Button Loading**:
- Show spinner icon
- Disable button
- Keep button text

**Table Loading**:
- Show spinner in table center
- Fade out previous data (optional)

---

### Error Handling

**Form Errors**:
- Red border on input
- Error message below input
- Focus first error field

**API Errors**:
- Toast notification (top-right)
- Error message in error color
- Auto-dismiss after 5s

**Network Errors**:
- Retry button
- Helpful message
- Maintain form state

---

### Success Feedback

**Actions**:
- Toast notification (green)
- "Success" message
- Auto-dismiss after 3s
- Refresh data

**Forms**:
- Close modal
- Show success toast
- Refresh list

---

### Confirmations

**Delete Actions**:
- Browser confirm dialog
- Clear message: "Hapus {item_name}?"
- Two buttons: Cancel, Delete

**Destructive Actions**:
- Modal confirmation
- Explain consequences
- Two buttons: Cancel, Confirm

---

### Empty States

**No Data**:
- Icon (optional)
- Message: "Tidak ada data"
- Helpful action (Add button)

**No Search Results**:
- Message: "Tidak ditemukan"
- Suggest: "Coba kata kunci lain"
- Clear search button

---

## 📐 RESPONSIVE BEHAVIOR

### Breakpoints

```
xs:  0px    (Mobile portrait)
sm:  640px  (Mobile landscape)
md:  768px  (Tablet)
lg:  1024px (Desktop)
xl:  1280px (Large desktop)
2xl: 1536px (Extra large)
```

### Layout Adaptations

**Mobile (< 768px)**:
- Sidebar: Hidden, toggle with hamburger
- Content: Full width, single column
- Forms: Stacked fields (1 column)
- Tables: Horizontal scroll or card view
- Stats: 1 column grid

**Tablet (768px - 1024px)**:
- Sidebar: Collapsible
- Content: Adjust margins
- Forms: 2 columns where applicable
- Tables: Horizontal scroll
- Stats: 2 column grid

**Desktop (> 1024px)**:
- Sidebar: Always visible
- Content: Full layout with proper spacing
- Forms: Multi-column layouts
- Tables: Full view
- Stats: 4 column grid

---

## ♿ ACCESSIBILITY

### Keyboard Navigation

- Tab through interactive elements
- Enter to submit forms
- Escape to close modals
- Arrow keys in selects

### Focus Management

- Visible focus ring (blue)
- Trap focus in modals
- Return focus on close
- Skip navigation link

### ARIA Labels

- Button labels
- Input labels
- Error messages
- Loading indicators
- Status messages

### Color Contrast

- Text: minimum 4.5:1 ratio
- Interactive: minimum 3:1 ratio
- Status colors: distinguishable

### Screen Readers

- Semantic HTML
- Alt text for images
- ARIA labels where needed
- Status announcements

---

## 🚀 PERFORMANCE

### Optimization Strategies

**Code Splitting**:
- Route-based splitting
- Lazy load modals
- Dynamic imports

**Image Optimization**:
- Appropriate formats (WebP)
- Lazy loading
- Responsive images

**Debouncing**:
- Search inputs: 300ms
- Auto-save: 1000ms
- Resize handlers: 150ms

**Caching**:
- React Query for API
- localStorage for preferences
- Service worker (optional)

---

## 📝 NOTES

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Known Limitations

- Table horizontal scroll on mobile
- Complex forms may need scrolling
- Large datasets need virtual scrolling (future)

### Future Enhancements

- Dark mode toggle
- Custom themes
- Advanced filters
- Bulk operations
- Export features
- Offline mode
- PWA support

---

**Version**: 1.0.0  
**Last Updated**: November 2024  
**Maintainer**: STOIR Development Team
