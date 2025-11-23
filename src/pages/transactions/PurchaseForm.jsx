import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
// Removed modal ItemSelector; inline autocomplete implemented
// helpers not needed for inventory-only table
import { toast } from 'react-toastify';

export default function PurchaseForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
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

  const supplierOptions = [
    { value: 'SUP001', label: 'PT Supplier Jaya' },
    { value: 'SUP002', label: 'CV Maju Jaya' },
    { value: 'SUP003', label: 'PT Berkah Selalu' },
  ];

  // Dummy items dataset (could be fetched from API)
  const allItems = [
    {
      kode_barang: 'BRG001',
      nama_barang: 'Sparepart A',
      kategori: 'Elektronik',
      satuan: 'pcs',
      stok: 100,
      harga_beli: 50000,
    },
    {
      kode_barang: 'BRG002',
      nama_barang: 'Sparepart B',
      kategori: 'Mekanik',
      satuan: 'pcs',
      stok: 5,
      harga_beli: 120000,
    },
    {
      kode_barang: 'BRG003',
      nama_barang: 'Sparepart C',
      kategori: 'Elektronik',
      satuan: 'box',
      stok: 50,
      harga_beli: 35000,
    },
  ];

  const filteredItems = searchQuery
    ? allItems.filter(
        (item) =>
          item.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.kode_barang.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allItems.slice(0, 10);

  const handleAddItem = (item, qtyOverride) => {
    const existing = items.find((i) => i.kode_barang === item.kode_barang);
    if (existing) {
      toast.warning('Item sudah ditambahkan');
      return;
    }

    setItems([
      ...items,
      {
        ...item,
        jumlah: qtyOverride || 1,
      },
    ]);
    setSearchQuery('');
    setShowSuggestions(false);
    setHighlightIndex(-1);
  };

  const handleUpdateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = parseFloat(value) || 0;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    if (items.length === 0) {
      toast.error('Minimal tambahkan 1 item');
      return;
    }

    const payload = {
      ...data,
      items,
    };

    try {
      // API call
      console.log('Submit:', payload);
      toast.success('Pembelian berhasil disimpan');
      // Reset or redirect
    } catch (error) {
      toast.error('Gagal menyimpan pembelian');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Info Stok Masuk (Compact) */}
        <Card>
          <div className="flex items-start gap-4 flex-nowrap overflow-x-auto pb-1">
            <div className="w-48 flex-shrink-0">
              <Input
                label="No Faktur"
                {...register('no_faktur', { required: 'No faktur wajib' })}
                error={errors.no_faktur?.message}
                placeholder="PO-2025-001"
                required
              />
            </div>
            <div className="w-56 flex-shrink-0">
              <Select
                label="Supplier"
                {...register('kode_supplier', { required: 'Supplier wajib' })}
                options={supplierOptions}
                error={errors.kode_supplier?.message}
                required
              />
            </div>
            <div className="min-w-[220px] flex-1">
              <Input
                label="Catatan"
                {...register('catatan')}
                placeholder="Catatan (opsional)"
              />
            </div>
          </div>
          {/* Row pencarian barang */}
          <div className="mt-4 flex gap-4 flex-nowrap overflow-x-visible relative">
            <div className="flex-1 min-w-[320px]">
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
                <div className="absolute z-30 mt-1 w-full max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg text-sm">
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
                        className={`px-3 py-2 cursor-pointer flex flex-col gap-0.5 border-b last:border-b-0 ${
                          highlightIndex === idx ? 'bg-primary-50' : 'hover:bg-gray-50'
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
            <div className="w-32 flex-shrink-0">
              <Input
                label="Qty"
                type="number"
                min={1}
                value={pendingQty}
                onChange={(e) => setPendingQty(parseInt(e.target.value || '1'))}
              />
            </div>
          </div>
        </Card>

        {/* Items */}
        <Card title="Daftar Barang">
          {items.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              Belum ada item. Ketik pada pencarian di atas untuk menambahkan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-center w-12">No</th>
                    <th className="px-3 py-2 text-left w-40">Kode Barang</th>
                    <th className="px-3 py-2 text-left">Nama Barang</th>
                    <th className="px-3 py-2 text-center w-28">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={item.kode_barang} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-center align-middle">{index + 1}</td>
                      <td className="px-3 py-2 align-middle font-medium text-gray-900 whitespace-nowrap">{item.kode_barang}</td>
                      <td className="px-3 py-2 align-middle text-gray-900">{item.nama_barang}</td>
                      <td className="px-3 py-2 text-center align-middle">
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
