import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'react-toastify';

export default function PurchaseForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
  } = useForm({
    defaultValues: {
      no_faktur: '',
      kode_supplier: '',
      catatan: '',
    },
  });

  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [pendingQty, setPendingQty] = useState(1);
  const [supplierQuery, setSupplierQuery] = useState('');
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);
  const [supplierHighlightIndex, setSupplierHighlightIndex] = useState(-1);

  // Dummy suppliers (replace with API later)
  const supplierOptions = [
    { value: 'SUP001', label: 'PT Supplier Jaya' },
    { value: 'SUP002', label: 'CV Maju Jaya' },
    { value: 'SUP003', label: 'PT Berkah Selalu' },
  ];

  // Dummy items dataset (replace with API later)
  const allItems = [
    { kode_barang: 'BRG001', nama_barang: 'Sparepart A', kategori: 'Elektronik', satuan: 'pcs', stok: 100 },
    { kode_barang: 'BRG002', nama_barang: 'Sparepart B', kategori: 'Mekanik', satuan: 'pcs', stok: 5 },
    { kode_barang: 'BRG003', nama_barang: 'Sparepart C', kategori: 'Elektronik', satuan: 'box', stok: 50 },
  ];

  const filteredItems = searchQuery
    ? allItems.filter(
      (it) =>
        it.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.kode_barang.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : allItems.slice(0, 10);

  const filteredSuppliers = supplierQuery
    ? supplierOptions.filter(
      (s) =>
        s.label.toLowerCase().includes(supplierQuery.toLowerCase()) ||
        s.value.toLowerCase().includes(supplierQuery.toLowerCase())
    )
    : supplierOptions;

  const handleAddItem = (item, qtyOverride) => {
    const exists = items.find((i) => i.kode_barang === item.kode_barang);
    if (exists) {
      toast.warning('Item sudah ditambahkan');
      return;
    }
    const jumlah = Math.max(1, parseInt(qtyOverride || pendingQty || 1, 10));
    setItems((prev) => [...prev, { ...item, jumlah }]);
    setSearchQuery('');
    setShowSuggestions(false);
    setHighlightIndex(-1);
  };

  const handleUpdateItem = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      const v = field === 'jumlah' ? Math.max(1, parseInt(value || '1', 10)) : value;
      next[index] = { ...next[index], [field]: v };
      return next;
    });
  };

  const onSubmit = (data) => {
    if (!data.no_faktur) {
      toast.error('No faktur wajib');
      return;
    }
    if (!data.kode_supplier) {
      toast.error('Supplier wajib dipilih');
      return;
    }
    if (items.length === 0) {
      toast.error('Tambahkan minimal satu item');
      return;
    }
    const payload = {
      ...data,
      items: items.map(({ kode_barang, jumlah }) => ({ kode_barang, jumlah })),
    };
    console.log('Submit pembelian (inventory only):', payload);
    toast.success('Pembelian tersimpan');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Info Stok Masuk (Compact) */}
        <Card>
          {/* Baris 1: No Faktur, Supplier, Kode/Nama Barang, Qty */}
          <div className="relative z-30 flex items-start gap-4 flex-nowrap overflow-visible pb-1">
            <div className="w-48 flex-shrink-0">
              <Input
                label="No Faktur"
                {...register('no_faktur', { required: 'No faktur wajib' })}
                error={errors.no_faktur?.message}
                placeholder="PO-2025-001"
                required
              />
            </div>
            <div className={`w-64 flex-shrink-0 relative ${showSupplierSuggestions ? 'z-[60]' : 'z-10'}`}>
              {/* Hidden field to store selected supplier code */}
              <input
                type="hidden"
                {...register('kode_supplier', { required: 'Supplier wajib' })}
              />
              <Input
                label="Supplier"
                placeholder="Cari supplier..."
                value={supplierQuery}
                error={errors.kode_supplier?.message}
                onChange={(e) => {
                  setSupplierQuery(e.target.value);
                  setShowSupplierSuggestions(true);
                }}
                onFocus={() => setShowSupplierSuggestions(true)}
                onKeyDown={(e) => {
                  if (!showSupplierSuggestions) return;
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSupplierHighlightIndex((prev) => Math.min(prev + 1, filteredSuppliers.length - 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSupplierHighlightIndex((prev) => Math.max(prev - 1, 0));
                  } else if (e.key === 'Enter') {
                    if (supplierHighlightIndex >= 0 && filteredSuppliers[supplierHighlightIndex]) {
                      e.preventDefault();
                      const sup = filteredSuppliers[supplierHighlightIndex];
                      setValue('kode_supplier', sup.value, { shouldValidate: true });
                      setSupplierQuery(sup.label);
                      setShowSupplierSuggestions(false);
                    }
                  } else if (e.key === 'Escape') {
                    setShowSupplierSuggestions(false);
                  }
                }}
              />
              {showSupplierSuggestions && (
                <div className="absolute z-[70] mt-1 w-full max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg text-sm">
                  {filteredSuppliers.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500">Supplier tidak ditemukan</div>
                  ) : (
                    filteredSuppliers.map((s, idx) => (
                      <div
                        key={s.value}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setValue('kode_supplier', s.value, { shouldValidate: true });
                          setSupplierQuery(s.label);
                          setShowSupplierSuggestions(false);
                          setSupplierHighlightIndex(-1);
                        }}
                        className={`px-3 py-2 cursor-pointer border-b last:border-b-0 ${supplierHighlightIndex === idx ? 'bg-primary-50' : 'hover:bg-gray-50'
                          }`}
                        onMouseEnter={() => setSupplierHighlightIndex(idx)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{s.label}</span>
                          <span className="text-xs text-gray-500">{s.value}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className={`flex-1 min-w-[320px] relative ${showSuggestions ? 'z-20' : ''}`}>
              <Input
                label="Kode Barang / Nama Barang"
                placeholder="Ketik kode atau nama barang..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (!showSuggestions) return;
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setHighlightIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setHighlightIndex((prev) => Math.max(prev - 1, 0));
                  } else if (e.key === 'Enter') {
                    if (highlightIndex >= 0 && filteredItems[highlightIndex]) {
                      e.preventDefault();
                      handleAddItem(filteredItems[highlightIndex], pendingQty);
                    }
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                }}
              />
              {showSuggestions && searchQuery && (
                <div className="absolute z-[60] mt-1 w-full max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg text-sm">
                  {filteredItems.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500">Tidak ada barang</div>
                  ) : (
                    filteredItems.map((item, idx) => (
                      <div
                        key={item.kode_barang}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleAddItem(item, pendingQty);
                        }}
                        className={`px-3 py-2 cursor-pointer flex flex-col gap-0.5 border-b last:border-b-0 ${highlightIndex === idx ? 'bg-primary-50' : 'hover:bg-gray-50'
                          }`}
                        onMouseEnter={() => setHighlightIndex(idx)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{item.nama_barang}</span>
                          <span className="text-xs text-gray-500">{item.kode_barang}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Stok: {item.stok} {item.satuan}</span>
                          <span className="uppercase">{item.kategori}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="w-28 flex-shrink-0">
              <Input
                label="Qty"
                type="number"
                min={1}
                value={pendingQty}
                onChange={(e) => setPendingQty(parseInt(e.target.value || '1'))}
              />
            </div>
          </div>

          {/* Baris 2: Catatan full */}
          <div className="mt-4 relative z-0">
            <Input
              label="Catatan"
              {...register('catatan')}
              placeholder="Catatan (opsional)"
            />
          </div>
        </Card>

        {/* Items */}
        <Card>
          {items.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              Belum ada item. Ketik pada pencarian di atas untuk menambahkan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="p-0 text-center w-12">No</th>
                    <th className="p-0 text-left w-40">Kode Barang</th>
                    <th className="p-0 text-left">Nama Barang</th>
                    <th className="p-0 text-center w-28">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={item.kode_barang} className="hover:bg-gray-50">
                      <td className="p-0 text-center align-middle">{index + 1}</td>
                      <td className="p-0 align-middle font-medium text-gray-900 whitespace-nowrap">{item.kode_barang}</td>
                      <td className="p-0 align-middle text-gray-900">{item.nama_barang}</td>
                      <td className="p-0 text-center align-middle">
                        <input
                          type="number"
                          min="1"
                          value={item.jumlah}
                          onChange={(e) => handleUpdateItem(index, 'jumlah', e.target.value)}
                          className="input w-20 text-center px-2 py-1 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed border-gray-300"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Actions */}
        <Card>
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline">
              Batal
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Simpan Pembelian
            </Button>
          </div>
        </Card>
      </form>

      {/* Inline suggestions replaces modal selector */}
    </div>
  );
}
