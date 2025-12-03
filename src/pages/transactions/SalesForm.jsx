import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'react-toastify';

export default function SalesForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
  } = useForm({
    defaultValues: {
      no_faktur: '',
      tanggal: new Date().toISOString().split('T')[0],
      kode_customer: '',
      catatan: '',
    },
  });

  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [pendingQty, setPendingQty] = useState(1);
  const [customerQuery, setCustomerQuery] = useState('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [customerHighlightIndex, setCustomerHighlightIndex] = useState(-1);

  // Dummy customers (replace with API later)
  const customerOptions = [
    { value: 'CUST001', label: 'Toko Makmur' },
    { value: 'CUST002', label: 'CV Jaya Abadi' },
    { value: 'CUST003', label: 'UD Berkah' },
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

  const filteredCustomers = customerQuery
    ? customerOptions.filter(
      (c) =>
        c.label.toLowerCase().includes(customerQuery.toLowerCase()) ||
        c.value.toLowerCase().includes(customerQuery.toLowerCase())
    )
    : customerOptions;

  const handleAddItem = (item, qtyOverride) => {
    const exists = items.find((i) => i.kode_barang === item.kode_barang);
    if (exists) {
      toast.warning('Item sudah ditambahkan');
      return;
    }
    // Check stock availability
    const jumlah = Math.max(1, parseInt(qtyOverride || pendingQty || 1, 10));
    if (jumlah > item.stok) {
      toast.error(`Stok tidak mencukupi. Tersedia: ${item.stok} ${item.satuan}`);
      return;
    }
    setItems((prev) => [...prev, { ...item, jumlah }]);
    setSearchQuery('');
    setShowSuggestions(false);
    setHighlightIndex(-1);
  };

  const handleUpdateItem = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      const v = field === 'jumlah' ? Math.max(1, parseInt(value || '1', 10)) : value;
      // Validate stock when updating quantity
      if (field === 'jumlah' && v > next[index].stok) {
        toast.error(`Stok tidak mencukupi. Tersedia: ${next[index].stok} ${next[index].satuan}`);
        return prev;
      }
      next[index] = { ...next[index], [field]: v };
      return next;
    });
  };

  const handleDeleteItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data) => {
    if (!data.no_faktur) {
      toast.error('No faktur wajib');
      return;
    }
    if (!data.kode_customer) {
      toast.error('Customer wajib dipilih');
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
    console.log('Submit penjualan (inventory only):', payload);
    toast.success('Penjualan tersimpan');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full gap-4">
        {/* Header Info Stok Keluar (Compact) */}
        <Card className="px-1.5 py-0">
          {/* Baris 1: No Faktur, Tanggal, Customer, Kode/Nama Barang, Qty */}
          <div className="relative z-30 flex items-start gap-3 flex-nowrap overflow-visible pb-0">
            <div className="w-36 flex-shrink-0">
              <Input
                label="No Faktur"
                {...register('no_faktur', { required: 'No faktur wajib' })}
                error={errors.no_faktur?.message}
                placeholder="SL-2025-001"
                required
              />
            </div>
            <div className="w-36 flex-shrink-0">
              <Input
                label="Tanggal"
                type="date"
                {...register('tanggal')}
              />
            </div>
            <div className={`w-52 flex-shrink-0 relative ${showCustomerSuggestions ? 'z-[60]' : 'z-10'}`}>
              {/* Hidden field to store selected customer code */}
              <input
                type="hidden"
                {...register('kode_customer', { required: 'Customer wajib' })}
              />
              <Input
                label="Customer"
                placeholder="Cari customer..."
                value={customerQuery}
                error={errors.kode_customer?.message}
                onChange={(e) => {
                  setCustomerQuery(e.target.value);
                  setShowCustomerSuggestions(true);
                }}
                onFocus={() => setShowCustomerSuggestions(true)}
                onKeyDown={(e) => {
                  if (!showCustomerSuggestions) return;
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setCustomerHighlightIndex((prev) => Math.min(prev + 1, filteredCustomers.length - 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setCustomerHighlightIndex((prev) => Math.max(prev - 1, 0));
                  } else if (e.key === 'Enter') {
                    if (customerHighlightIndex >= 0 && filteredCustomers[customerHighlightIndex]) {
                      e.preventDefault();
                      const cust = filteredCustomers[customerHighlightIndex];
                      setValue('kode_customer', cust.value, { shouldValidate: true });
                      setCustomerQuery(cust.label);
                      setShowCustomerSuggestions(false);
                    }
                  } else if (e.key === 'Escape') {
                    setShowCustomerSuggestions(false);
                  }
                }}
              />
              {showCustomerSuggestions && (
                <div className="absolute z-[70] mt-1 w-full max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg text-sm">
                  {filteredCustomers.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500">Customer tidak ditemukan</div>
                  ) : (
                    filteredCustomers.map((c, idx) => (
                      <div
                        key={c.value}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setValue('kode_customer', c.value, { shouldValidate: true });
                          setCustomerQuery(c.label);
                          setShowCustomerSuggestions(false);
                          setCustomerHighlightIndex(-1);
                        }}
                        className={`px-3 py-2 cursor-pointer border-b last:border-b-0 ${customerHighlightIndex === idx ? 'bg-primary-50' : 'hover:bg-gray-50'
                          }`}
                        onMouseEnter={() => setCustomerHighlightIndex(idx)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{c.label}</span>
                          <span className="text-xs text-gray-500">{c.value}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className={`flex-1 min-w-[240px] relative ${showSuggestions ? 'z-20' : ''}`}>
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
          <div className="relative z-0">
            <Input
              label="Catatan"
              {...register('catatan')}
              placeholder="Catatan (opsional)"
            />
          </div>

        </Card>

        <Card padding={false} className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-auto">
            <div className="h-full overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700 sticky top-0 z-10 shadow-sm">
                  <tr className="h-10">
                    <th className="p-0 text-center w-10">No</th>
                    <th className="p-0 text-left w-32">Kode Barang</th>
                    <th className="p-0 text-left">Nama Barang</th>
                    <th className="p-0 text-center w-24">Qty</th>
                    <th className="p-0 text-center w-16">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-0 h-12 text-center text-gray-400">Belum ada item</td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.kode_barang} className="h-10 hover:bg-gray-50 transition-colors">
                        <td className="p-0 text-center align-middle text-gray-600">{index + 1}</td>
                        <td className="p-0 align-middle font-medium text-gray-900 whitespace-nowrap">{item.kode_barang}</td>
                        <td className="p-0 align-middle text-gray-900 truncate max-w-[180px]">{item.nama_barang}</td>
                        <td className="p-0 text-center align-middle">
                          <input
                            id={`qty-${index}`}
                            type="number"
                            min="1"
                            max={item.stok}
                            value={item.jumlah}
                            onChange={(e) => handleUpdateItem(index, 'jumlah', e.target.value)}
                            className="w-14 h-8 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                          />
                        </td>
                        <td className="p-0 text-center align-middle">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              aria-label="Edit Qty"
                              onClick={() => {
                                const el = document.getElementById(`qty-${index}`);
                                if (el) el.focus();
                              }}
                              className="text-gray-400 hover:text-primary-600 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M15.586 2.586a2 2 0 0 0-2.828 0L4.414 10.93a2 2 0 0 0-.586 1.414V15a1 1 0 0 0 1 1h2.657a2 2 0 0 0 1.414-.586l8.344-8.344a2 2 0 0 0 0-2.828l-1.657-1.656Zm-3.172.828 3.172 3.172-1.172 1.172-3.172-3.172 1.172-1.172ZM11 7.414l-5 5V13h.586l5-5L11 7.414Z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              aria-label="Hapus Row"
                              onClick={() => handleDeleteItem(index)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M8.5 3a1 1 0 0 0-.94.658L7.11 5H4a1 1 0 1 0 0 2h.278l.805 8.053A2 2 0 0 0 7.07 17h5.86a2 2 0 0 0 1.988-1.947L15.722 7H16a1 1 0 1 0 0-2h-3.11l-.45-1.342A1 1 0 0 0 11.5 3h-3ZM9 9a1 1 0 0 1 2 0v5a1 1 0 1 1-2 0V9Z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Actions - Always at bottom */}
        <div className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between gap-4 h-12">
            {items.length > 0 ? (
              <div className="flex items-center gap-6 text-sm text-gray-800 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">Total Item:</span>
                  <span className="font-bold text-primary-700">{items.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">Total Qty:</span>
                  <span className="font-bold text-primary-700">{items.reduce((sum, it) => sum + (parseInt(it.jumlah, 10) || 0), 0)}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-400 font-medium">Belum ada item</div>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <Button type="button" variant="outline" className="px-4 py-1.5 text-sm h-9">
                Batal
              </Button>
              <Button type="submit" loading={isSubmitting} className="px-4 py-1.5 text-sm h-9">
                Simpan Penjualan
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
