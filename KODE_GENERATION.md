# Dokumentasi Generate Kode Otomatis

## 📋 Overview
Sistem inventory ini menggunakan auto-generate kode untuk semua entitas **kecuali Barang/Produk**. Kode barang tetap diinput manual karena biasanya mengikuti standar katalog supplier atau sistem perusahaan.

---

## ✅ Entitas dengan Auto-Generate Kode

### 1. **Kategori** (`kode_kategori`)
- **Format**: `KTG{increment:3digit}`
- **Contoh**: `KTG001`, `KTG002`, `KTG003`
- **Implementasi**: Generated saat create, read-only di form
- **File**: `src/pages/master/KategoriForm.jsx`

```javascript
// Generate kode kategori
const generateKodeKategori = async () => {
  const lastKode = await getLastKategori(); // KTG003
  const number = parseInt(lastKode.substring(3)) + 1;
  return `KTG${String(number).padStart(3, '0')}`;
};
```

---

### 2. **Supplier** (`kode_supplier`)
- **Format**: `SUP{increment:3digit}`
- **Contoh**: `SUP001`, `SUP002`, `SUP003`
- **Implementasi**: Generated saat create, read-only di form
- **File**: `src/pages/master/SupplierForm.jsx`

```javascript
// Generate kode supplier
const generateKodeSupplier = async () => {
  const lastKode = await getLastSupplier(); // SUP003
  const number = parseInt(lastKode.substring(3)) + 1;
  return `SUP${String(number).padStart(3, '0')}`;
};
```

---

### 3. **Customer** (`kode_customer`)
- **Format**: `CUST{increment:3digit}`
- **Contoh**: `CUST001`, `CUST002`, `CUST003`
- **Implementasi**: Generated saat create, read-only di form
- **File**: `src/pages/master/CustomerForm.jsx`

```javascript
// Generate kode customer
const generateKodeCustomer = async () => {
  const lastKode = await getLastCustomer(); // CUST003
  const number = parseInt(lastKode.substring(4)) + 1;
  return `CUST${String(number).padStart(3, '0')}`;
};
```

---

## 🔢 Transaksi dengan Auto-Generate Nomor

### 1. **Pembelian** (`no_faktur`)
- **Format**: `PB{YYYYMMDD}{random:3digit}`
- **Contoh**: `PB20250115001`, `PB20250115002`
- **Implementasi**: Generated saat buka form
- **File**: `src/pages/transactions/PurchaseForm.jsx`

```javascript
// Generate nomor faktur pembelian
const generateNoFakturPembelian = () => {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `PB${dateStr}${random}`;
};
```

---

### 2. **Penjualan** (`no_faktur`)
- **Format**: `PJ{YYYYMMDD}{random:3digit}`
- **Contoh**: `PJ20250115001`, `PJ20250115002`
- **Implementasi**: Generated saat buka form
- **File**: `src/pages/transactions/SalesForm.jsx`

```javascript
// Generate nomor faktur penjualan
const generateNoFakturPenjualan = () => {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `PJ${dateStr}${random}`;
};
```

---

### 3. **Retur Pembelian** (`no_retur`)
- **Format**: `RP{YYYYMMDD}{random:3digit}`
- **Contoh**: `RP20250115001`, `RP20250115002`
- **Implementasi**: Generated saat buka form
- **File**: `src/pages/transactions/ReturPembelianForm.jsx`

```javascript
// Generate nomor retur pembelian
const generateNoReturPembelian = () => {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `RP${dateStr}${random}`;
};
```

---

### 4. **Retur Penjualan** (`no_retur`)
- **Format**: `RJ{YYYYMMDD}{random:3digit}`
- **Contoh**: `RJ20250115001`, `RJ20250115002`
- **Implementasi**: Generated saat buka form
- **File**: `src/pages/transactions/ReturPenjualanForm.jsx`

```javascript
// Generate nomor retur penjualan
const generateNoReturPenjualan = () => {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `RJ${dateStr}${random}`;
};
```

---

### 5. **Customer Claim** (`no_claim`)
- **Format**: `CL{YYYYMMDD}{random:3digit}`
- **Contoh**: `CL20250115001`, `CL20250115002`
- **Implementasi**: Generated saat buka form
- **File**: `src/pages/transactions/CustomerClaimForm.jsx`

```javascript
// Generate nomor claim
const generateNoClaim = () => {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `CL${dateStr}${random}`;
};
```

---

## ❌ Entitas TANPA Auto-Generate

### **Barang/Produk** (`kode_barang`)
- **Format**: Manual input (bebas sesuai kebutuhan)
- **Contoh**: `BRG001`, `SPR-2024-001`, `BEARING-6205`, `OIL-FILTER-KTM`
- **Alasan**: 
  - Kode barang biasanya mengikuti katalog supplier
  - Setiap perusahaan punya standar penamaan sendiri
  - Kadang menggunakan kode dari sistem lama
  - Perlu fleksibilitas untuk berbagai format kode
- **Implementasi**: Input manual, wajib unik
- **File**: `src/pages/master/BarangForm.jsx`

```javascript
// Kode barang input manual
<Input
  label="Kode Barang"
  {...register('kode_barang', { 
    required: 'Kode barang wajib diisi',
    pattern: {
      value: /^[A-Z0-9-]+$/,
      message: 'Hanya huruf besar, angka, dan strip (-)'
    }
  })}
  placeholder="Contoh: BRG001 atau BEARING-6205"
  required
/>
```

---

## 🔧 Implementasi Best Practices

### 1. **Field Properties untuk Auto-Generate**
```javascript
<Input
  label="Kode Kategori"
  value={generatedKode}
  readOnly
  className="bg-gray-50 cursor-not-allowed"
  disabled
/>
```

### 2. **Generate On Mount**
```javascript
useEffect(() => {
  const initForm = async () => {
    const newKode = await generateKode();
    setValue('kode', newKode);
  };
  
  if (mode === 'create') {
    initForm();
  }
}, [mode]);
```

### 3. **Backend Validation**
```javascript
// API: POST /api/kategori
app.post('/api/kategori', async (req, res) => {
  // Jika kode tidak dikirim, generate
  if (!req.body.kode_kategori) {
    req.body.kode_kategori = await generateKodeKategori();
  }
  
  // Validasi uniqueness
  const exists = await checkKodeExists(req.body.kode_kategori);
  if (exists) {
    return res.status(400).json({ error: 'Kode sudah digunakan' });
  }
  
  // Save to database
  await saveKategori(req.body);
});
```

### 4. **Retry Logic untuk Duplicate**
```javascript
const generateUniqueKode = async (prefix, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    const kode = await generateKode(prefix);
    const exists = await checkExists(kode);
    
    if (!exists) return kode;
  }
  
  throw new Error('Gagal generate kode unik');
};
```

---

## 📊 Summary Table

| Entitas | Format Kode | Auto-Generate | File |
|---------|-------------|---------------|------|
| **Kategori** | `KTG{3digit}` | ✅ Yes | `KategoriForm.jsx` |
| **Supplier** | `SUP{3digit}` | ✅ Yes | `SupplierForm.jsx` |
| **Customer** | `CUST{3digit}` | ✅ Yes | `CustomerForm.jsx` |
| **Barang** | `Manual Input` | ❌ No | `BarangForm.jsx` |
| **Pembelian** | `PB{YYYYMMDD}{3digit}` | ✅ Yes | `PurchaseForm.jsx` |
| **Penjualan** | `PJ{YYYYMMDD}{3digit}` | ✅ Yes | `SalesForm.jsx` |
| **Retur Pembelian** | `RP{YYYYMMDD}{3digit}` | ✅ Yes | `ReturPembelianForm.jsx` |
| **Retur Penjualan** | `RJ{YYYYMMDD}{3digit}` | ✅ Yes | `ReturPenjualanForm.jsx` |
| **Customer Claim** | `CL{YYYYMMDD}{3digit}` | ✅ Yes | `CustomerClaimForm.jsx` |
| **Stok Opname** | `SO{YYYYMMDD}{3digit}` | ✅ Yes | `StokOpnameForm.jsx` |

---

## 🎯 Action Items untuk Backend

1. **Create API endpoint untuk generate kode**
   ```
   GET /api/generate/kode-kategori
   GET /api/generate/kode-supplier
   GET /api/generate/kode-customer
   GET /api/generate/no-faktur-pembelian
   GET /api/generate/no-faktur-penjualan
   GET /api/generate/no-retur-pembelian
   GET /api/generate/no-retur-penjualan
   GET /api/generate/no-claim
   ```

2. **Add unique constraint di database**
   ```sql
   ALTER TABLE kategori ADD CONSTRAINT uk_kode_kategori UNIQUE (kode_kategori);
   ALTER TABLE supplier ADD CONSTRAINT uk_kode_supplier UNIQUE (kode_supplier);
   ALTER TABLE customer ADD CONSTRAINT uk_kode_customer UNIQUE (kode_customer);
   ALTER TABLE barang ADD CONSTRAINT uk_kode_barang UNIQUE (kode_barang);
   ```

3. **Implement transaction-safe increment**
   ```javascript
   // Use database sequence atau atomic increment
   // Hindari race condition saat concurrent request
   ```

---

## 📝 Notes

- ✅ **Kode master data** (kategori, supplier, customer) menggunakan **sequential increment**
- ✅ **Nomor transaksi** menggunakan **tanggal + random** untuk menghindari konflik di multi-user environment
- ❌ **Kode barang** tetap **manual** untuk fleksibilitas
- 🔒 **Backend harus validate uniqueness** sebelum save
- 🔄 **Frontend sudah implement auto-generate** di semua form yang diperlukan
- 📅 **Format tanggal** di nomor transaksi: `YYYYMMDD` (8 digit)
- 🎲 **Random number** di nomor transaksi: 3 digit (000-999)

---

**Last Updated**: November 22, 2025
