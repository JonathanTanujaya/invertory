# 📦 DOKUMENTASI SISTEM INVENTORY - STOIR

## 📋 DAFTAR ISI
1. [Overview Sistem](#overview-sistem)
2. [Struktur Database](#struktur-database)
3. [Fitur Utama](#fitur-utama)
4. [API Endpoints](#api-endpoints)
5. [Komponen React](#komponen-react)
6. [Variabel & Konfigurasi](#variabel--konfigurasi)

---

## 🎯 OVERVIEW SISTEM

Sistem inventory STOIR adalah aplikasi manajemen gudang yang mencakup:
- Manajemen Data Barang (Master Data)
- Pencatatan Stok Masuk (Pembelian)
- Pencatatan Stok Keluar (Penjualan)
- Riwayat Transaksi
- Laporan Stok & Keuangan

---

## 🗄️ STRUKTUR DATABASE

### 1️⃣ MASTER DATA

#### **Table: kategori**
Kategori barang
```sql
- id (PK, AUTO_INCREMENT)
- nama_kategori (VARCHAR)
- deskripsi (TEXT)
- created_at (TIMESTAMP)
```

#### **Table: sparepart/barang**
Data barang utama
```sql
- kode_barang (PK, VARCHAR)
- nama_barang (VARCHAR)
- kategori_id (FK -> kategori)
- satuan (VARCHAR) // pcs, box, kg, dll
- stok (INT) // jumlah stok saat ini
- stok_minimal (INT) // untuk alert
- harga_beli (DECIMAL)
- harga_jual (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### **Table: supplier**
Data pemasok
```sql
- kode_supplier (PK, VARCHAR)
- nama_supplier (VARCHAR)
- alamat (TEXT)
- telepon (VARCHAR)
- email (VARCHAR)
- created_at (TIMESTAMP)
```

#### **Table: customer**
Data pelanggan
```sql
- kode_customer (PK, VARCHAR)
- nama_customer (VARCHAR)
- alamat (TEXT)
- telepon (VARCHAR)
- kode_area (FK -> area)
- kode_sales (FK -> sales)
- created_at (TIMESTAMP)
```

#### **Table: area**
Wilayah customer
```sql
- kode_area (PK, VARCHAR)
- nama_area (VARCHAR)
- created_at (TIMESTAMP)
```

#### **Table: sales**
Data sales/marketing
```sql
- kode_sales (PK, VARCHAR)
- nama_sales (VARCHAR)
- telepon (VARCHAR)
- email (VARCHAR)
- created_at (TIMESTAMP)
```

#### **Table: bank**
Master bank untuk pembayaran
```sql
- id (PK, AUTO_INCREMENT)
- nama_bank (VARCHAR)
- nomor_rekening (VARCHAR)
- atas_nama (VARCHAR)
- cabang (VARCHAR)
- created_at (TIMESTAMP)
```

---

### 2️⃣ TRANSAKSI

#### **Table: pembelian (stok_masuk)**
Header pembelian
```sql
- no_faktur (PK, VARCHAR)
- kode_supplier (FK -> supplier)
- tanggal_pembelian (DATE)
- total_harga (DECIMAL)
- status (ENUM: 'pending', 'selesai', 'batal')
- catatan (TEXT)
- created_by (VARCHAR)
- created_at (TIMESTAMP)
```

#### **Table: detail_pembelian**
Detail item pembelian
```sql
- id (PK, AUTO_INCREMENT)
- no_faktur (FK -> pembelian)
- kode_barang (FK -> barang)
- jumlah (INT)
- harga_satuan (DECIMAL)
- subtotal (DECIMAL)
- created_at (TIMESTAMP)
```

#### **Table: penjualan (stok_keluar)**
Header penjualan
```sql
- no_faktur (PK, VARCHAR)
- kode_customer (FK -> customer)
- tanggal_penjualan (DATE)
- total_harga (DECIMAL)
- status (ENUM: 'pending', 'selesai', 'batal')
- catatan (TEXT)
- created_by (VARCHAR)
- created_at (TIMESTAMP)
```

#### **Table: detail_penjualan**
Detail item penjualan
```sql
- id (PK, AUTO_INCREMENT)
- no_faktur (FK -> penjualan)
- kode_barang (FK -> barang)
- jumlah (INT)
- harga_satuan (DECIMAL)
- diskon (DECIMAL)
- subtotal (DECIMAL)
- created_at (TIMESTAMP)
```

#### **Table: retur_pembelian**
Retur ke supplier
```sql
- no_retur (PK, VARCHAR)
- no_faktur_pembelian (FK -> pembelian)
- tanggal_retur (DATE)
- kode_barang (FK -> barang)
- jumlah (INT)
- alasan (TEXT)
- created_at (TIMESTAMP)
```

#### **Table: retur_penjualan**
Retur dari customer
```sql
- no_retur (PK, VARCHAR)
- no_faktur_penjualan (FK -> penjualan)
- tanggal_retur (DATE)
- kode_barang (FK -> barang)
- jumlah (INT)
- alasan (TEXT)
- created_at (TIMESTAMP)
```

#### **Table: stok_opname**
Pengecekan fisik stok
```sql
- id (PK, AUTO_INCREMENT)
- kode_barang (FK -> barang)
- stok_sistem (INT)
- stok_fisik (INT)
- selisih (INT)
- tanggal_opname (DATE)
- keterangan (TEXT)
- created_by (VARCHAR)
- created_at (TIMESTAMP)
```

#### **Table: pembelian_bonus**
Barang bonus dari supplier
```sql
- id (PK, AUTO_INCREMENT)
- no_faktur_pembelian (FK -> pembelian)
- kode_barang (FK -> barang)
- jumlah_bonus (INT)
- tanggal_bonus (DATE)
- created_at (TIMESTAMP)
```

#### **Table: penjualan_bonus**
Barang bonus ke customer
```sql
- id (PK, AUTO_INCREMENT)
- no_faktur_penjualan (FK -> penjualan)
- kode_barang (FK -> barang)
- jumlah_bonus (INT)
- tanggal_bonus (DATE)
- created_at (TIMESTAMP)
```

#### **Table: customer_claim**
Klaim dari customer
```sql
- no_claim (PK, VARCHAR)
- kode_customer (FK -> customer)
- kode_barang (FK -> barang)
- jumlah (INT)
- tanggal_claim (DATE)
- alasan (TEXT)
- status (ENUM: 'pending', 'diproses', 'selesai')
- created_at (TIMESTAMP)
```

---

### 3️⃣ FINANCE

#### **Table: penerimaan_resi**
Penerimaan pembayaran
```sql
- no_resi (PK, VARCHAR)
- no_faktur (FK -> penjualan)
- tanggal_terima (DATE)
- jumlah_bayar (DECIMAL)
- metode_bayar (ENUM: 'cash', 'transfer', 'giro')
- bank_id (FK -> bank)
- created_at (TIMESTAMP)
```

#### **Table: piutang_resi**
Piutang dari penjualan
```sql
- id (PK, AUTO_INCREMENT)
- no_faktur (FK -> penjualan)
- kode_customer (FK -> customer)
- total_piutang (DECIMAL)
- sisa_piutang (DECIMAL)
- jatuh_tempo (DATE)
- status (ENUM: 'belum_lunas', 'lunas')
- created_at (TIMESTAMP)
```

#### **Table: piutang_retur**
Piutang dari retur penjualan
```sql
- id (PK, AUTO_INCREMENT)
- no_retur (FK -> retur_penjualan)
- kode_customer (FK -> customer)
- total_piutang (DECIMAL)
- sisa_piutang (DECIMAL)
- status (ENUM: 'belum_lunas', 'lunas')
- created_at (TIMESTAMP)
```

#### **Table: penambahan_saldo**
Topup saldo customer
```sql
- id (PK, AUTO_INCREMENT)
- kode_customer (FK -> customer)
- jumlah (DECIMAL)
- tanggal (DATE)
- metode (VARCHAR)
- keterangan (TEXT)
- created_at (TIMESTAMP)
```

#### **Table: pengurangan_saldo**
Penggunaan saldo customer
```sql
- id (PK, AUTO_INCREMENT)
- kode_customer (FK -> customer)
- jumlah (DECIMAL)
- tanggal (DATE)
- keterangan (TEXT)
- created_at (TIMESTAMP)
```

#### **Table: saldo_bank**
Saldo rekening bank
```sql
- id (PK, AUTO_INCREMENT)
- bank_id (FK -> bank)
- saldo (DECIMAL)
- updated_at (TIMESTAMP)
```

---

## 🎯 FITUR UTAMA

### 1. MASTER DATA
```
📂 /master
├── /kategori        - Kelola kategori barang
├── /sparepart       - Kelola data barang
├── /supplier        - Kelola pemasok
├── /customer        - Kelola pelanggan
├── /area            - Kelola wilayah
├── /sales           - Kelola sales
└── /bank            - Kelola rekening bank
```

### 2. TRANSAKSI
```
📂 /transactions
├── /pembelian              - Form pembelian (stok masuk)
├── /penjualan              - Form penjualan (stok keluar)
├── /retur-pembelian        - Retur ke supplier
├── /retur-penjualan        - Retur dari customer
├── /stok-opname            - Stock taking
├── /pembelian-bonus        - Barang bonus dari supplier
├── /penjualan-bonus        - Barang bonus ke customer
├── /customer-claim         - Klaim customer
└── /invoices               - Daftar semua invoice
```

### 3. FINANCE
```
📂 /finance
├── /penerimaan-resi        - Input pembayaran
├── /piutang-resi           - Kelola piutang penjualan
├── /piutang-retur          - Kelola piutang retur
├── /penambahan-saldo       - Topup saldo customer
└── /pengurangan-saldo      - Penggunaan saldo customer
```

### 4. REPORTS
```
📂 /reports
├── /stok-barang            - Laporan stok barang
├── /pembelian              - Laporan pembelian
└── /penjualan              - Laporan penjualan
```

---

## 🔌 API ENDPOINTS

### MASTER DATA

#### Kategori
```
GET    /api/kategori            - List semua kategori
GET    /api/kategori/:id        - Detail kategori
POST   /api/kategori            - Tambah kategori
PUT    /api/kategori/:id        - Update kategori
DELETE /api/kategori/:id        - Hapus kategori
```

#### Barang/Sparepart
```
GET    /api/barang              - List semua barang
GET    /api/barang/:kode        - Detail barang
POST   /api/barang              - Tambah barang
PUT    /api/barang/:kode        - Update barang
DELETE /api/barang/:kode        - Hapus barang
GET    /api/barang/stok/:kode   - Cek stok barang
```

#### Supplier
```
GET    /api/supplier            - List semua supplier
GET    /api/supplier/:kode      - Detail supplier
POST   /api/supplier            - Tambah supplier
PUT    /api/supplier/:kode      - Update supplier
DELETE /api/supplier/:kode      - Hapus supplier
```

#### Customer
```
GET    /api/customer            - List semua customer
GET    /api/customer/:kode      - Detail customer
POST   /api/customer            - Tambah customer
PUT    /api/customer/:kode      - Update customer
DELETE /api/customer/:kode      - Hapus customer
```

#### Area
```
GET    /api/area                - List semua area
GET    /api/area/:kode          - Detail area
POST   /api/area                - Tambah area
PUT    /api/area/:kode          - Update area
DELETE /api/area/:kode          - Hapus area
```

#### Sales
```
GET    /api/sales               - List semua sales
GET    /api/sales/:kode         - Detail sales
POST   /api/sales               - Tambah sales
PUT    /api/sales/:kode         - Update sales
DELETE /api/sales/:kode         - Hapus sales
```

#### Bank
```
GET    /api/bank                - List semua bank
GET    /api/bank/:id            - Detail bank
POST   /api/bank                - Tambah bank
PUT    /api/bank/:id            - Update bank
DELETE /api/bank/:id            - Hapus bank
```

---

### TRANSAKSI

#### Pembelian (Stok Masuk)
```
GET    /api/pembelian                    - List pembelian
GET    /api/pembelian/:no_faktur         - Detail pembelian
POST   /api/pembelian                    - Buat pembelian baru
PUT    /api/pembelian/:no_faktur         - Update pembelian
DELETE /api/pembelian/:no_faktur         - Hapus pembelian
```

#### Penjualan (Stok Keluar)
```
GET    /api/penjualan                    - List penjualan
GET    /api/penjualan/:no_faktur         - Detail penjualan
POST   /api/penjualan                    - Buat penjualan baru
PUT    /api/penjualan/:no_faktur         - Update penjualan
DELETE /api/penjualan/:no_faktur         - Hapus penjualan
```

#### Retur
```
GET    /api/retur/pembelian              - List retur pembelian
POST   /api/retur/pembelian              - Buat retur pembelian
GET    /api/retur/penjualan              - List retur penjualan
POST   /api/retur/penjualan              - Buat retur penjualan
```

#### Stok Opname
```
GET    /api/stok-opname                  - List stok opname
POST   /api/stok-opname                  - Buat stok opname
GET    /api/stok-opname/:id              - Detail stok opname
```

#### Bonus
```
GET    /api/bonus/pembelian              - List bonus pembelian
POST   /api/bonus/pembelian              - Tambah bonus pembelian
GET    /api/bonus/penjualan              - List bonus penjualan
POST   /api/bonus/penjualan              - Tambah bonus penjualan
```

#### Customer Claim
```
GET    /api/customer-claim               - List claim
GET    /api/customer-claim/:no_claim     - Detail claim
POST   /api/customer-claim               - Buat claim baru
PUT    /api/customer-claim/:no_claim     - Update status claim
```

---

### FINANCE

#### Penerimaan Resi
```
GET    /api/penerimaan-resi              - List penerimaan
POST   /api/penerimaan-resi              - Input penerimaan
GET    /api/penerimaan-resi/:no_resi     - Detail penerimaan
```

#### Piutang
```
GET    /api/piutang/resi                 - List piutang resi
GET    /api/piutang/retur                - List piutang retur
POST   /api/piutang/bayar                - Bayar piutang
```

#### Saldo Customer
```
GET    /api/saldo/:kode_customer         - Cek saldo customer
POST   /api/saldo/penambahan             - Topup saldo
POST   /api/saldo/pengurangan            - Kurangi saldo
GET    /api/saldo/history/:kode_customer - History saldo
```

#### Saldo Bank
```
GET    /api/saldo-bank                   - List saldo bank
GET    /api/saldo-bank/:bank_id          - Saldo bank tertentu
```

---

### REPORTS

#### Stok Barang
```
GET    /api/reports/stok                 - Laporan stok semua barang
GET    /api/reports/stok/alert           - Barang stok minimal
GET    /api/reports/stok/:kode_barang    - Laporan stok per barang
```

#### Kartu Stok
```
GET    /api/reports/kartu-stok/:kode_barang  - History stok barang
```

#### Pembelian & Penjualan
```
GET    /api/reports/pembelian            - Laporan pembelian
GET    /api/reports/penjualan            - Laporan penjualan
```

Query Parameters untuk Reports:
```
?start_date=YYYY-MM-DD
?end_date=YYYY-MM-DD
?kode_divisi=XX
?kode_supplier=XXX
?kode_customer=XXX
```

---

## ⚛️ KOMPONEN REACT

### Layout Components
```javascript
- Layout.jsx                  // Layout utama dengan sidebar
- DashboardLayout.jsx         // Layout khusus dashboard
- TopNavbar.jsx               // Navigation bar atas
- ContextualSidebar.jsx       // Sidebar dinamis per kategori
```

### Master Data Components
```javascript
// Customer
- CustomerListPage.jsx
- CustomerFormPage.jsx
- CustomerManager.jsx

// Barang
- BarangManager.jsx
- BarangForm.jsx
- BarangList.jsx
- EnhancedBarangForm.jsx
- MergeBarangForm.jsx
- MergeBarangList.jsx

// Sparepart
- SparepartListPage.jsx
- SparepartFormPage.jsx

// Kategori
- CategoriesPage.jsx
- KategoriForm.jsx
- KategoriList.jsx

// Supplier
- SupplierListPage.jsx
- SupplierFormPage.jsx

// Area
- AreaListPage.jsx
- AreaFormPage.jsx
- AreaForm.jsx
- AreaList.jsx

// Sales
- SalesListPage.jsx
- SalesFormPage.jsx

// Bank
- MasterBank.jsx
- MBankForm.jsx
- MBankList.jsx
```

### Transaction Components
```javascript
// Pembelian
- PurchaseFormPage.jsx
- PurchaseForm.jsx
- PurchaseFormCompact.jsx
- PartPenerimaanForm.jsx
- PartPenerimaanList.jsx
- PartPenerimaanBonusForm.jsx
- PartPenerimaanBonusList.jsx

// Penjualan
- SalesForm.jsx
- InvoiceManager.jsx
- InvoiceForm.jsx
- InvoiceList.jsx

// Retur
- ReturPembelianForm.jsx
- ReturPenjualanForm.jsx

// Stok Opname
- StokOpnamePage.jsx
- OpnameForm.jsx
- OpnameList.jsx

// Bonus
- PembelianBonusForm.jsx
- PenjualanBonusForm.jsx

// Claim
- CustomerClaimForm.jsx
- ClaimPenjualanForm.jsx
- ClaimPenjualanList.jsx
```

### Finance Components
```javascript
// Penerimaan
- PenerimaanResi.jsx
- PenerimaanFinanceForm.jsx
- PenerimaanFinanceList.jsx

// Piutang
- PiutangResiListPage.jsx
- PiutangResiFormPage.jsx
- PiutangResiViewPage.jsx
- PiutangReturListPage.jsx
- PiutangReturFormPage.jsx
- PiutangReturViewPage.jsx

// Saldo
- PenambahanSaldoListPage.jsx
- PenambahanSaldoFormPage.jsx
- PenambahanSaldoViewPage.jsx
- PenguranganSaldo.jsx
```

### Report Components
```javascript
- StokBarangReport.jsx
- PembelianReport.jsx
- PenjualanReport.jsx
- ReportsManager.jsx
```

### Shared Components
```javascript
- Dashboard.jsx
- DataTable.jsx
- ErrorBoundary.jsx
- FormValidation.jsx
- LoadingComponents.jsx
- ProcedureManager.jsx
```

---

## 🔧 VARIABEL & KONFIGURASI

### Environment Variables (.env)
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000

# Default Configuration
VITE_DEFAULT_PAGE_SIZE=10

# Feature Flags
VITE_ENABLE_OFFLINE_MODE=false
```

### localStorage Keys
```javascript
// User & Auth
'user_id'               // ID user login
'auth_token'            // JWT token
'user_role'             // Role user (admin, operator, etc)

// UI State
'sidebar_collapsed'     // Status sidebar
'theme_mode'            // light/dark mode
'language'              // Bahasa aplikasi (id/en)
```

### Variabel Umum dalam Components

#### Master Data
```javascript
// Barang
kodeBarang
namaBarang
kategoriId
satuan
stok
stokMinimal
hargaBeli
hargaJual
lokasiRak

// Supplier
kodeSupplier
namaSupplier
alamat
telepon
email

// Customer
kodeCustomer
namaCustomer
kodeArea
kodeSales
limitKredit
```

#### Transaksi
```javascript
// Header Transaksi
noFaktur
tanggalTransaksi
totalHarga
status
catatan
createdBy

// Detail Transaksi
items: [{
  kodeBarang,
  namaBarang,
  jumlah,
  hargaSatuan,
  diskon,
  subtotal
}]
```

#### Finance
```javascript
// Pembayaran
noResi
jumlahBayar
metodeBayar  // 'cash', 'transfer', 'giro'
bankId
tanggalTerima

// Piutang
totalPiutang
sisaPiutang
jatuhTempo
status       // 'belum_lunas', 'lunas'
```

### Status Enum Values
```javascript
// Transaction Status
STATUS_PENDING = 'pending'
STATUS_SELESAI = 'selesai'
STATUS_BATAL = 'batal'

// Payment Status
STATUS_BELUM_LUNAS = 'belum_lunas'
STATUS_LUNAS = 'lunas'

// Claim Status
STATUS_CLAIM_PENDING = 'pending'
STATUS_CLAIM_DIPROSES = 'diproses'
STATUS_CLAIM_SELESAI = 'selesai'

// Payment Method
METODE_CASH = 'cash'
METODE_TRANSFER = 'transfer'
METODE_GIRO = 'giro'
```

---

## 📊 DATA FLOW

### Alur Stok Masuk (Pembelian)
```
1. User input form pembelian
2. Pilih supplier & tambah item barang
3. Submit form → POST /api/pembelian
4. Backend:
   - Insert ke tabel pembelian (header)
   - Insert ke tabel detail_pembelian
   - Update stok di tabel barang (+jumlah)
5. Response sukses → redirect ke list pembelian
```

### Alur Stok Keluar (Penjualan)
```
1. User input form penjualan
2. Pilih customer & tambah item barang
3. Cek stok tersedia
4. Submit form → POST /api/penjualan
5. Backend:
   - Insert ke tabel penjualan (header)
   - Insert ke tabel detail_penjualan
   - Update stok di tabel barang (-jumlah)
   - Insert ke piutang_resi (jika kredit)
6. Response sukses → redirect ke list penjualan
```

### Alur Pembayaran Piutang
```
1. User buka halaman piutang
2. Pilih faktur yang akan dibayar
3. Input jumlah bayar & metode
4. Submit → POST /api/penerimaan-resi
5. Backend:
   - Insert ke penerimaan_resi
   - Update sisa_piutang di piutang_resi
   - Update saldo_bank (+jumlah)
6. Response sukses → update UI
```

### Alur Stok Opname
```
1. User input stok fisik untuk setiap barang
2. Sistem hitung selisih (fisik - sistem)
3. Submit → POST /api/stok-opname
4. Backend:
   - Insert ke stok_opname (log)
   - Update stok di tabel barang (adjustment)
5. Response sukses → tampilkan hasil opname
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### User Roles
```javascript
ROLE_ADMIN = 'admin'        // Full access
ROLE_MANAGER = 'manager'    // View reports, approve
ROLE_OPERATOR = 'operator'  // Input transaksi
ROLE_VIEWER = 'viewer'      // Read only
```

### Permission Matrix
```
Feature               | Admin | Manager | Operator | Viewer
--------------------- |-------|---------|----------|--------
Master Data (CRUD)    |   ✓   |    ✓    |     -    |    -
Pembelian (Input)     |   ✓   |    ✓    |     ✓    |    -
Penjualan (Input)     |   ✓   |    ✓    |     ✓    |    -
Pembayaran (Input)    |   ✓   |    ✓    |     ✓    |    -
Stok Opname           |   ✓   |    ✓    |     -    |    -
Reports (View)        |   ✓   |    ✓    |     ✓    |    ✓
Delete Transaksi      |   ✓   |    -    |     -    |    -
```

---

## 📱 RESPONSIVE DESIGN

### Breakpoints (Tailwind/MUI)
```javascript
xs: 0px      // Mobile portrait
sm: 640px    // Mobile landscape
md: 768px    // Tablet
lg: 1024px   // Desktop
xl: 1280px   // Large desktop
2xl: 1536px  // Extra large
```

### Layout Behavior
```
Mobile (< 768px):
- Sidebar hidden, toggle button
- Single column forms
- Stacked cards
- Horizontal scroll tables

Tablet (768px - 1024px):
- Collapsible sidebar
- Two column forms (optional)
- Grid layout cards

Desktop (> 1024px):
- Full sidebar visible
- Multi column forms
- Full data tables
- Dashboard widgets
```

---

## 🎨 DESIGN SYSTEM

### Colors (Theme)
```javascript
primary: '#3B82F6'      // Blue
secondary: '#6B7280'    // Gray
success: '#10B981'      // Green
warning: '#F59E0B'      // Yellow
error: '#EF4444'        // Red
info: '#3B82F6'         // Blue

background: '#F8FAFC'   // Light gray
paper: '#FFFFFF'        // White
```

### Typography
```javascript
fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif'

h1: 2.5rem (40px)
h2: 2rem (32px)
h3: 1.75rem (28px)
h4: 1.5rem (24px)
h5: 1.25rem (20px)
h6: 1rem (16px)
body: 0.875rem (14px)
caption: 0.75rem (12px)
```

### Spacing
```javascript
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
```

---

## 🚀 DEPLOYMENT

### Build Command
```bash
npm run build
# atau
yarn build
```

### Vercel Configuration (vercel.json)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "src": "/assets/(.*)", "dest": "/assets/$1" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### Environment Setup
```bash
# Development
npm run dev

# Production Build
npm run build
npm run preview

# Deploy to Vercel
vercel --prod
```

---

## 📝 DUMMY DATA FILES

### JSON Files Location
```
src/data/dummy/
├── m_barang.json           // Data barang
├── m_supplier.json         // Data supplier
├── m_customer.json         // Data customer
├── m_kategori.json         // Data kategori
├── m_area.json             // Data area
├── m_sales.json            // Data sales
└── m_bank.json             // Data bank
```

### Sample Data Structure

#### m_barang.json
```json
[
  {
    "kode_barang": "BRG001",
    "nama_barang": "Sparepart A",
    "kategori_id": "KAT001",
    "satuan": "pcs",
    "stok": 100,
    "stok_minimal": 10,
    "harga_beli": 50000,
    "harga_jual": 75000
  }
]
```

#### m_supplier.json
```json
[
  {
    "kode_supplier": "SUP001",
    "nama_supplier": "PT Supplier Jaya",
    "alamat": "Jl. Supplier No. 123",
    "telepon": "021-1234567",
    "email": "supplier@example.com"
  }
]
```

---

## 🔍 TESTING

### Test Files Location
```
src/tests/
├── components/
│   ├── BarangForm.test.jsx
│   ├── PurchaseForm.test.jsx
│   └── DataTable.test.jsx
├── hooks/
│   └── useApi.test.js
└── utils/
    └── helpers.test.js
```

### Run Tests
```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# UI mode
npm run test:ui
```

---

## 📚 DEPENDENCIES

### Production Dependencies
```json
{
  "@mui/material": "^5.16.4",
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "react-router-dom": "^7.7.1",
  "@tanstack/react-query": "^5.85.5",
  "axios": "^1.11.0",
  "chart.js": "^4.5.0",
  "react-chartjs-2": "^5.3.0",
  "react-toastify": "^11.0.5",
  "date-fns": "^4.1.0",
  "jspdf": "^3.0.1",
  "xlsx": "^0.18.5"
}
```

### Dev Dependencies
```json
{
  "@vitejs/plugin-react": "^4.6.0",
  "vite": "^7.0.4",
  "tailwindcss": "^3.4.17",
  "eslint": "^9.34.0",
  "vitest": "^3.2.4"
}
```

---

## 🎓 BEST PRACTICES

### Code Organization
```javascript
// ✅ Good
- Pisahkan logic & UI
- Gunakan custom hooks
- Component reusable
- Consistent naming

// ❌ Avoid
- God components
- Hardcoded values
- Inline styles
- Duplicate code
```

### State Management
```javascript
// ✅ Good
- React Query untuk server state
- Context untuk global UI state
- Local state untuk form

// ❌ Avoid
- Prop drilling berlebihan
- Unnecessary global state
```

### API Calls
```javascript
// ✅ Good
- Gunakan custom hooks (useApi)
- Error handling proper
- Loading states
- Cache dengan React Query

// ❌ Avoid
- Direct fetch dalam component
- No error handling
- No loading states
```

---

## 📞 SUPPORT & CONTACT

**Project:** STOIR - Sistem Inventory
**Version:** 1.0.0
**Last Updated:** November 2025

---

**END OF DOCUMENTATION**
