import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-toastify';
import { PackageSearch, RotateCcw } from 'lucide-react';
import api from '@/api/axios';
import { formatCurrency, formatNumber, generateTransactionNumber } from '@/utils/helpers';

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
      tanggal: new Date().toISOString().split('T')[0],
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

  const [supplierOptions, setSupplierOptions] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [kategoriMap, setKategoriMap] = useState({});

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmSnapshot, setConfirmSnapshot] = useState(null);
  const [confirmingSubmit, setConfirmingSubmit] = useState(false);

  useEffect(() => {
    const tanggal = getValues('tanggal');
    const noFaktur = generateTransactionNumber('PO', tanggal);
    setValue('no_faktur', noFaktur, { shouldValidate: true });
  }, [getValues, setValue]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [suppliersRes, itemsRes, categoriesRes] = await Promise.all([
          api.get('/suppliers'),
          api.get('/items'),
          api.get('/categories'),
        ]);

        if (!mounted) return;

        setSupplierOptions(
          (Array.isArray(suppliersRes.data) ? suppliersRes.data : []).map((s) => ({
            value: s.kode_supplier,
            label: s.nama_supplier,
          }))
        );

        setAllItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);

        const map = {};
        for (const c of Array.isArray(categoriesRes.data) ? categoriesRes.data : []) {
          map[c.kode_kategori] = c.nama_kategori;
        }
        setKategoriMap(map);
      } catch (err) {
        toast.error('Gagal memuat data master');
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredItems = searchQuery
    ? allItems
      .filter(
        (it) =>
          it.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
          it.kode_barang.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5)
    : [];

  const filteredSuppliers = supplierQuery
    ? supplierOptions
      .filter(
        (s) =>
          s.label.toLowerCase().includes(supplierQuery.toLowerCase()) ||
          s.value.toLowerCase().includes(supplierQuery.toLowerCase())
      )
      .slice(0, 5)
    : [];

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

  const handleDeleteItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const buildConfirmSnapshot = (data) => {
    const supplierLabel = supplierOptions.find((s) => s.value === data.kode_supplier)?.label || supplierQuery || data.kode_supplier;
    const rows = items.map((it) => ({
      kode_barang: it.kode_barang,
      nama_barang: it.nama_barang,
      satuan: it.satuan,
      stok: it.stok,
      harga_beli: it.harga_beli,
      jumlah: it.jumlah,
      subtotal: (Number(it.harga_beli) || 0) * (Number(it.jumlah) || 0),
    }));

    return {
      header: {
        no_faktur: data.no_faktur,
        tanggal: data.tanggal,
        kode_supplier: data.kode_supplier,
        supplier_label: supplierLabel,
        catatan: data.catatan,
      },
      items: rows,
      totals: {
        totalItem: rows.length,
        totalQty: rows.reduce((sum, r) => sum + (parseInt(r.jumlah, 10) || 0), 0),
        totalNilai: rows.reduce((sum, r) => sum + (Number(r.subtotal) || 0), 0),
      },
    };
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

    setConfirmSnapshot(buildConfirmSnapshot(data));
    setConfirmOpen(true);
  };

  const handleFinalConfirm = async () => {
    if (!confirmSnapshot || confirmingSubmit) return;
    try {
      setConfirmingSubmit(true);
      const data = getValues();
      const payload = {
        no_faktur: data.no_faktur,
        tanggal: data.tanggal,
        kode_supplier: data.kode_supplier,
        catatan: data.catatan,
        items: items.map(({ kode_barang, jumlah }) => ({ kode_barang, jumlah })),
      };

      await api.post('/stock-in', payload);

      // Refresh items (stock changed)
      try {
        const itemsRes = await api.get('/items');
        setAllItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
      } catch (_) {
        // ignore refresh errors
      }

      toast.success('Pembelian tersimpan');
      setConfirmOpen(false);
      setConfirmSnapshot(null);

      // Reset form
      setItems([]);
      setSearchQuery('');
      setSupplierQuery('');
      setPendingQty(1);
      const newTanggal = new Date().toISOString().split('T')[0];
      setValue('tanggal', newTanggal);
      setValue('no_faktur', generateTransactionNumber('PO', newTanggal));
      setValue('kode_supplier', '');
      setValue('catatan', '');
    } catch (err) {
      const data = err?.response?.data;
      toast.error(data?.error || 'Gagal menyimpan pembelian');
    } finally {
      setConfirmingSubmit(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-48px)] overflow-hidden min-h-0">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full gap-4 min-h-0">
        {/* Header Info Stok Masuk (Compact) */}
        <Card className="px-1.5 py-0">
          {/* Baris 1: No Faktur, Tanggal, Supplier, Kode/Nama Barang, Qty */}
          <div className="relative z-30 flex items-start gap-3 flex-nowrap overflow-visible pb-0">
            <div className="w-36 flex-shrink-0">
              <Input
                label="No Faktur"
                {...register('no_faktur')}
                readOnly
              />
            </div>
            <div className="w-36 flex-shrink-0">
              <Input
                label="Tanggal"
                type="date"
                {...register('tanggal')}
              />
            </div>
            <div className={`w-52 flex-shrink-0 relative ${showSupplierSuggestions ? 'z-[60]' : 'z-10'}`}>
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
            <div className={`flex-1 min-w-[240px] relative ${showSuggestions ? 'z-20' : ''}`}>
              <Input
                label="Kode Barang / Nama Barang"
                placeholder="Ketik kode atau nama barang..."
                id="purchase-item-search"
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
                          <span className="uppercase">{kategoriMap[item.kategori_id] || item.kategori_id}</span>
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
          <div className="mt-3 relative z-0">
            <Input
              label="Catatan"
              {...register('catatan')}
              placeholder="Catatan (opsional)"
            />
          </div>
        </Card>

        <Card padding={false} className="flex-1 overflow-hidden min-h-0">
          <div className="h-full min-h-0 overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-primary-50 text-primary-800 sticky top-0 z-10 shadow-sm border-b border-primary-100">
                <tr className="h-10">
                  <th className="px-3 py-2 text-center w-10">No</th>
                  <th className="px-3 py-2 text-left w-32">Kode Barang</th>
                  <th className="px-3 py-2 text-left">Nama Barang</th>
                  <th className="px-3 py-2 text-left w-40">Kategori</th>
                  <th className="px-3 py-2 text-center w-24">Satuan</th>
                  <th className="px-3 py-2 text-right w-28">Stok</th>
                  <th className="px-3 py-2 text-right w-36">Harga</th>
                  <th className="px-3 py-2 text-center w-24">Qty</th>
                  <th className="px-3 py-2 text-right w-40">Subtotal</th>
                  <th className="px-3 py-2 text-center w-16">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/60">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center">
                      <div className="mx-auto max-w-xl px-6">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                          <PackageSearch className="h-6 w-6" />
                        </div>
                        <div className="text-gray-900 font-semibold">Belum ada item pembelian</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={item.kode_barang} className="h-10 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-1.5 text-center align-middle text-gray-600">{index + 1}</td>
                      <td className="px-3 py-1.5 align-middle font-medium text-gray-900 whitespace-nowrap">{item.kode_barang}</td>
                      <td className="px-3 py-1.5 align-middle text-gray-900 truncate max-w-[220px]">{item.nama_barang}</td>
                      <td className="px-3 py-1.5 align-middle text-gray-700 whitespace-nowrap">
                        {kategoriMap[item.kategori_id] || item.kategori_id || '-'}
                      </td>
                      <td className="px-3 py-1.5 text-center align-middle text-gray-700 whitespace-nowrap">{item.satuan || '-'}</td>
                      <td className="px-3 py-1.5 text-right align-middle text-gray-700 whitespace-nowrap">
                        {typeof item.stok === 'number' ? formatNumber(item.stok) : (item.stok ?? '-')}
                      </td>
                      <td className="px-3 py-1.5 text-right align-middle text-gray-700 whitespace-nowrap">
                        {typeof item.harga_beli === 'number' ? formatCurrency(item.harga_beli) : (item.harga_beli ?? '-')}
                      </td>
                      <td className="px-3 py-1.5 text-center align-middle">
                        <input
                          type="number"
                          min="1"
                          id={`qty-${index}`}
                          value={item.jumlah}
                          onChange={(e) => handleUpdateItem(index, 'jumlah', e.target.value)}
                          className="w-14 h-8 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        />
                      </td>
                      <td className="px-3 py-1.5 text-right align-middle text-gray-900 whitespace-nowrap">
                        {formatCurrency((Number(item.harga_beli) || 0) * (Number(item.jumlah) || 0))}
                      </td>
                      <td className="px-3 py-1.5 text-center align-middle">
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
                            {/* Pencil icon */}
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
                            {/* Trash icon */}
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
        </Card>

        {/* Actions - Stick to bottom */}
        <div className="mt-auto px-5 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm flex-shrink-0">
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
              <Button
                type="button"
                variant="outline"
                className="px-4 py-1.5 text-sm h-9"
                onClick={() => {
                  setItems([]);
                  setSearchQuery('');
                  setSupplierQuery('');
                  setPendingQty(1);
                  const newTanggal = new Date().toISOString().split('T')[0];
                  setValue('tanggal', newTanggal);
                  setValue('no_faktur', generateTransactionNumber('PO', newTanggal));
                  setValue('kode_supplier', '');
                  setValue('catatan', '');
                  toast.info('Form telah direset');
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button type="submit" loading={isSubmitting} className="px-4 py-1.5 text-sm h-9">
                Simpan Pembelian
              </Button>
            </div>
          </div>
        </div>
      </form>

      <Modal
        open={confirmOpen}
        onClose={() => {
          if (confirmingSubmit) return;
          setConfirmOpen(false);
          setConfirmSnapshot(null);
        }}
        title="Konfirmasi Pembelian"
        size="lg"
        closeOnOverlay={!confirmingSubmit}
        footer={(
          <>
            <Button
              type="button"
              variant="outline"
              disabled={confirmingSubmit}
              onClick={() => {
                setConfirmOpen(false);
                setConfirmSnapshot(null);
              }}
            >
              Batal
            </Button>
            <Button
              type="button"
              loading={confirmingSubmit}
              onClick={handleFinalConfirm}
            >
              Konfirmasi Simpan
            </Button>
          </>
        )}
      >
        {confirmSnapshot && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
                <div className="text-gray-500">No Faktur</div>
                <div className="font-semibold text-gray-900">{confirmSnapshot.header.no_faktur}</div>
              </div>
              <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
                <div className="text-gray-500">Tanggal</div>
                <div className="font-semibold text-gray-900">{confirmSnapshot.header.tanggal}</div>
              </div>
              <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
                <div className="text-gray-500">Supplier</div>
                <div className="font-semibold text-gray-900">{confirmSnapshot.header.supplier_label}</div>
              </div>
              <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
                <div className="text-gray-500">Catatan</div>
                <div className="font-semibold text-gray-900">{confirmSnapshot.header.catatan || '-'}</div>
              </div>
            </div>

            <div className="overflow-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-primary-50 text-primary-800 sticky top-0 z-10 border-b border-primary-100">
                  <tr className="h-10">
                    <th className="px-3 py-2 text-center w-10">No</th>
                    <th className="px-3 py-2 text-left w-32">Kode</th>
                    <th className="px-3 py-2 text-left">Nama</th>
                    <th className="px-3 py-2 text-center w-20">Satuan</th>
                    <th className="px-3 py-2 text-right w-28">Stok</th>
                    <th className="px-3 py-2 text-right w-36">Harga</th>
                    <th className="px-3 py-2 text-center w-20">Qty</th>
                    <th className="px-3 py-2 text-right w-40">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {confirmSnapshot.items.map((row, idx) => (
                    <tr key={row.kode_barang} className="h-10">
                      <td className="px-3 py-1.5 text-center text-gray-600">{idx + 1}</td>
                      <td className="px-3 py-1.5 font-medium text-gray-900 whitespace-nowrap">{row.kode_barang}</td>
                      <td className="px-3 py-1.5 text-gray-900 truncate max-w-[260px]">{row.nama_barang}</td>
                      <td className="px-3 py-1.5 text-center text-gray-700 whitespace-nowrap">{row.satuan || '-'}</td>
                      <td className="px-3 py-1.5 text-right text-gray-700 whitespace-nowrap">
                        {typeof row.stok === 'number' ? formatNumber(row.stok) : (row.stok ?? '-')}
                      </td>
                      <td className="px-3 py-1.5 text-right text-gray-700 whitespace-nowrap">
                        {typeof row.harga_beli === 'number' ? formatCurrency(row.harga_beli) : (row.harga_beli ?? '-')}
                      </td>
                      <td className="px-3 py-1.5 text-center text-gray-700 whitespace-nowrap">{row.jumlah}</td>
                      <td className="px-3 py-1.5 text-right font-semibold text-gray-900 whitespace-nowrap">
                        {formatCurrency(row.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-sm">
              <div className="text-gray-600">
                Total Item: <span className="font-semibold text-gray-900">{confirmSnapshot.totals.totalItem}</span>
              </div>
              <div className="text-gray-600">
                Total Qty: <span className="font-semibold text-gray-900">{confirmSnapshot.totals.totalQty}</span>
              </div>
              <div className="text-gray-600">
                Total: <span className="font-bold text-primary-700">{formatCurrency(confirmSnapshot.totals.totalNilai)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Inline suggestions replaces modal selector */}
    </div>
  );
}
