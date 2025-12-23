import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  Search,
  Package,
  RotateCcw,
  MessageSquareWarning,
  Trash2,
  User
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-toastify';

import api from '@/api/axios';

export default function CustomerClaimForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      no_claim: '',
      tanggal_claim: new Date().toISOString().split('T')[0],
      kode_customer: '',
      alasan: '',
    }
  });

  const [searchCustomer, setSearchCustomer] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchBarang, setSearchBarang] = useState('');
  const [showBarangDropdown, setShowBarangDropdown] = useState(false);
  const [claimItems, setClaimItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [allCustomers, setAllCustomers] = useState([]);
  const [allItems, setAllItems] = useState([]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmSnapshot, setConfirmSnapshot] = useState(null);

  // Generate nomor claim
  useEffect(() => {
    const today = new Date();
    const claimNo = `CC-${today.getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    setValue('no_claim', claimNo);
  }, [setValue]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [customersRes, itemsRes] = await Promise.all([api.get('/customers'), api.get('/items')]);
        if (!mounted) return;
        setAllCustomers(Array.isArray(customersRes.data) ? customersRes.data : []);
        setAllItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
      } catch (err) {
        toast.error('Gagal memuat data master');
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Filter customer berdasarkan pencarian
  const filteredCustomer = useMemo(() => {
    if (!searchCustomer) return allCustomers.slice(0, 10);
    const query = searchCustomer.toLowerCase();
    return allCustomers.filter((customer) =>
      String(customer.kode_customer || '').toLowerCase().includes(query) ||
      String(customer.nama_customer || '').toLowerCase().includes(query)
    ).slice(0, 10);
  }, [searchCustomer, allCustomers]);

  // Filter barang berdasarkan pencarian
  const filteredBarang = useMemo(() => {
    if (!searchBarang) return allItems.slice(0, 10);
    const query = searchBarang.toLowerCase();
    return allItems.filter((barang) =>
      String(barang.kode_barang || '').toLowerCase().includes(query) ||
      String(barang.nama_barang || '').toLowerCase().includes(query)
    ).slice(0, 10);
  }, [searchBarang, allItems]);

  // Handle pilih customer
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setValue('kode_customer', customer.kode_customer);
    setSearchCustomer(customer.nama_customer);
    setShowCustomerDropdown(false);
  };

  // Handle pilih barang
  const handleSelectBarang = (barang) => {
    const exists = claimItems.find(item => item.kode_barang === barang.kode_barang);
    if (exists) {
      toast.warning('Barang sudah ada dalam daftar claim');
      setShowBarangDropdown(false);
      setSearchBarang('');
      return;
    }

    setClaimItems([...claimItems, {
      kode_barang: barang.kode_barang,
      nama_barang: barang.nama_barang,
      satuan: barang.satuan,
      jumlah: 1,
      keterangan: ''
    }]);

    setShowBarangDropdown(false);
    setSearchBarang('');
    toast.success('Barang ditambahkan ke daftar claim');
  };

  // Handle hapus item
  const handleRemoveItem = (kode_barang) => {
    setClaimItems(claimItems.filter(item => item.kode_barang !== kode_barang));
  };

  // Handle ubah jumlah
  const handleJumlahChange = (kode_barang, value) => {
    setClaimItems(claimItems.map(item => {
      if (item.kode_barang === kode_barang) {
        return { ...item, jumlah: parseInt(value) || 0 };
      }
      return item;
    }));
  };

  // Handle ubah keterangan
  const handleKeteranganChange = (kode_barang, value) => {
    setClaimItems(claimItems.map(item => {
      if (item.kode_barang === kode_barang) {
        return { ...item, keterangan: value };
      }
      return item;
    }));
  };

  // Hitung total qty
  const totalQty = useMemo(() => {
    return claimItems.reduce((sum, item) => sum + item.jumlah, 0);
  }, [claimItems]);

  // Submit form
  const buildConfirmSnapshot = (data) => {
    const rows = claimItems.map((it) => ({
      kode_barang: it.kode_barang,
      nama_barang: it.nama_barang,
      satuan: it.satuan,
      jumlah: it.jumlah,
      keterangan: it.keterangan,
    }));

    return {
      header: {
        no_claim: data.no_claim,
        tanggal_claim: data.tanggal_claim,
        kode_customer: data.kode_customer,
        customer_label: selectedCustomer?.nama_customer || searchCustomer || data.kode_customer,
        alasan: data.alasan,
      },
      items: rows,
      totals: {
        totalItem: rows.length,
        totalQty: rows.reduce((sum, r) => sum + (parseInt(r.jumlah, 10) || 0), 0),
      },
    };
  };

  const onSubmit = (data) => {
    if (!selectedCustomer) {
      toast.error('Pilih customer terlebih dahulu');
      return;
    }

    if (claimItems.length === 0) {
      toast.error('Tambahkan minimal 1 barang untuk claim');
      return;
    }

    // Validasi jumlah
    const invalidItems = claimItems.filter(item => item.jumlah <= 0);
    if (invalidItems.length > 0) {
      toast.error('Jumlah claim harus lebih dari 0');
      return;
    }

    setConfirmSnapshot(buildConfirmSnapshot(data));
    setConfirmOpen(true);
  };

  const handleFinalConfirm = async () => {
    if (!confirmSnapshot || loading) return;
    const data = watch();

    setLoading(true);
    const payload = {
      no_claim: data.no_claim,
      tanggal: data.tanggal_claim,
      kode_customer: data.kode_customer,
      catatan: data.alasan,
      items: claimItems.map((item) => ({
        kode_barang: item.kode_barang,
        jumlah: item.jumlah,
      })),
    };

    try {
      await api.post('/customer-claims', payload);

      // Refresh items (stock changed)
      try {
        const itemsRes = await api.get('/items');
        setAllItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
      } catch (_) {
        // ignore refresh errors
      }

      toast.success('Customer claim berhasil disimpan!');
      setConfirmOpen(false);
      setConfirmSnapshot(null);
      navigate('/transactions/customer-claim');

      handleReset();
    } catch (error) {
      console.error('Error saving customer claim:', error);
      const status = error?.response?.status;
      const data = error?.response?.data;
      if (status === 409 && data?.meta?.kode_barang) {
        toast.error(
          `Stok tidak mencukupi (${data.meta.kode_barang}). Tersedia: ${data.meta.stok}, diminta: ${data.meta.diminta}`
        );
      } else {
        toast.error(data?.error || 'Gagal menyimpan customer claim');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setSearchCustomer('');
    setSelectedCustomer(null);
    setSearchBarang('');
    setClaimItems([]);
    setValue('kode_customer', '');
    setValue('alasan', '');
    setValue('tanggal_claim', new Date().toISOString().split('T')[0]);
    // Generate nomor claim baru
    const today = new Date();
    const claimNo = `CC-${today.getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    setValue('no_claim', claimNo);
    toast.info('Form telah direset');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-48px)] overflow-hidden min-h-0">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full gap-4 min-h-0">
        {/* Informasi Claim */}
        <Card className="px-1.5 py-0">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* No Claim */}
              <Input
                label="No. Claim"
                {...register('no_claim', { required: 'No. claim wajib diisi' })}
                error={errors.no_claim?.message}
                readOnly
                className="bg-gray-50"
              />

              {/* Tanggal Claim */}
              <Input
                label="Tanggal Claim"
                type="date"
                {...register('tanggal_claim', { required: 'Tanggal wajib diisi' })}
                error={errors.tanggal_claim?.message}
              />

              {/* Pilih Customer */}
              <div className="relative w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    placeholder="Cari customer..."
                    value={searchCustomer}
                    onChange={(e) => {
                      setSearchCustomer(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    startIcon={<User className="w-4 h-4 text-gray-400" />}
                  />
                  <input type="hidden" {...register('kode_customer', { required: 'Customer wajib dipilih' })} />
                </div>
                {errors.kode_customer && (
                  <p className="mt-1 text-sm text-red-500">{errors.kode_customer.message}</p>
                )}

                {/* Dropdown Customer */}
                {showCustomerDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {filteredCustomer.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        Tidak ada customer ditemukan
                      </div>
                    ) : (
                      filteredCustomer.map(customer => (
                        <div
                          key={customer.kode_customer}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => handleSelectCustomer(customer)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-gray-900">{customer.nama_customer}</div>
                              <div className="text-sm text-gray-500">{customer.kode_customer}</div>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              {customer.telepon}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Search Barang & Alasan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tambah Barang */}
              <div className="relative w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tambah Barang
                </label>
                <div className="relative">
                  <Input
                    placeholder="Cari barang berdasarkan kode atau nama..."
                    value={searchBarang}
                    onChange={(e) => {
                      setSearchBarang(e.target.value);
                      setShowBarangDropdown(true);
                    }}
                    onFocus={() => setShowBarangDropdown(true)}
                    startIcon={<Search className="w-4 h-4 text-gray-400" />}
                  />
                </div>

                {/* Dropdown Barang */}
                {showBarangDropdown && searchBarang && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {filteredBarang.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        Tidak ada barang ditemukan
                      </div>
                    ) : (
                      filteredBarang.map(barang => {
                        const isAdded = claimItems.find(item => item.kode_barang === barang.kode_barang);
                        return (
                          <div
                            key={barang.kode_barang}
                            className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${isAdded ? 'bg-green-50' : 'hover:bg-gray-50'
                              }`}
                            onClick={() => !isAdded && handleSelectBarang(barang)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-mono text-sm text-primary-600">{barang.kode_barang}</div>
                                <div className="font-medium text-gray-900">{barang.nama_barang}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-500">{barang.satuan}</div>
                                {isAdded && (
                                  <span className="text-xs text-green-600">✓ Sudah ditambahkan</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Alasan */}
              <Input
                label="Alasan Claim"
                {...register('alasan')}
                placeholder="Jelaskan alasan claim..."
              />
            </div>
          </div>
        </Card>

        {/* Daftar Barang Claim */}
        <Card padding={false} className="flex-1 overflow-hidden min-h-0">
          <div className="h-full min-h-0 overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-primary-50 text-primary-800 sticky top-0 z-10 shadow-sm border-b border-primary-100">
                <tr className="h-10">
                  <th className="px-3 py-2 text-left w-32">Kode</th>
                  <th className="px-3 py-2 text-left">Nama Barang</th>
                  <th className="px-3 py-2 text-center w-24">Satuan</th>
                  <th className="px-3 py-2 text-center w-24">Jumlah</th>
                  <th className="px-3 py-2 text-left w-64">Keterangan</th>
                  <th className="px-3 py-2 text-center w-16">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/60">
                {claimItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="mx-auto max-w-xl px-6">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                          <MessageSquareWarning className="h-6 w-6" />
                        </div>
                        <div className="text-gray-900 font-semibold">Belum ada barang claim</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  claimItems.map((item) => (
                    <tr key={item.kode_barang} className="h-10 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-1.5 align-middle font-mono text-primary-600 whitespace-nowrap">
                        {item.kode_barang}
                      </td>
                      <td className="px-3 py-1.5 align-middle text-gray-900 truncate max-w-[320px]">
                        {item.nama_barang}
                      </td>
                      <td className="px-3 py-1.5 text-center align-middle text-gray-700 whitespace-nowrap">
                        {item.satuan}
                      </td>
                      <td className="px-3 py-1.5 text-center align-middle">
                        <input
                          type="number"
                          min="1"
                          value={item.jumlah}
                          onChange={(e) => handleJumlahChange(item.kode_barang, e.target.value)}
                          className="w-20 h-8 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        />
                      </td>
                      <td className="px-3 py-1.5 align-middle">
                        <input
                          type="text"
                          value={item.keterangan}
                          onChange={(e) => handleKeteranganChange(item.kode_barang, e.target.value)}
                          placeholder="Alasan claim barang ini..."
                          className="w-full h-8 px-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        />
                      </td>
                      <td className="px-3 py-1.5 text-center align-middle">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.kode_barang)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Actions (match Penjualan wrapper sizing) */}
        <div className="mt-auto px-5 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between gap-4 h-12">
            {claimItems.length > 0 ? (
              <div className="flex items-center gap-6 text-sm text-gray-800 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">Total Item:</span>
                  <span className="font-bold text-primary-700">{claimItems.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">Total Qty:</span>
                  <span className="font-bold text-primary-700">{totalQty}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-400 font-medium">Belum ada item</div>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <Button type="button" variant="outline" className="px-4 py-1.5 text-sm h-9" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button
                type="submit"
                className="px-4 py-1.5 text-sm h-9"
                disabled={loading || claimItems.length === 0 || !selectedCustomer}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Menyimpan...' : 'Simpan Claim'}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <Modal
        open={confirmOpen}
        onClose={() => {
          if (loading) return;
          setConfirmOpen(false);
          setConfirmSnapshot(null);
        }}
        title="Konfirmasi Customer Claim"
        size="lg"
        closeOnOverlay={!loading}
        footer={(
          <>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => {
                setConfirmOpen(false);
                setConfirmSnapshot(null);
              }}
            >
              Batal
            </Button>
            <Button type="button" loading={loading} onClick={handleFinalConfirm}>
              Konfirmasi Simpan
            </Button>
          </>
        )}
      >
        {confirmSnapshot && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
                <div className="text-gray-500">No. Claim</div>
                <div className="font-semibold text-gray-900">{confirmSnapshot.header.no_claim}</div>
              </div>
              <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
                <div className="text-gray-500">Tanggal</div>
                <div className="font-semibold text-gray-900">{confirmSnapshot.header.tanggal_claim}</div>
              </div>
              <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
                <div className="text-gray-500">Customer</div>
                <div className="font-semibold text-gray-900">{confirmSnapshot.header.customer_label}</div>
              </div>
              <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
                <div className="text-gray-500">Alasan</div>
                <div className="font-semibold text-gray-900">{confirmSnapshot.header.alasan || '-'}</div>
              </div>
            </div>

            <div className="overflow-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-primary-50 text-primary-800 sticky top-0 z-10 border-b border-primary-100">
                  <tr className="h-10">
                    <th className="px-3 py-2 text-center w-10">No</th>
                    <th className="px-3 py-2 text-left w-32">Kode</th>
                    <th className="px-3 py-2 text-left">Nama</th>
                    <th className="px-3 py-2 text-center w-24">Satuan</th>
                    <th className="px-3 py-2 text-center w-24">Qty</th>
                    <th className="px-3 py-2 text-left w-64">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {confirmSnapshot.items.map((row, idx) => (
                    <tr key={row.kode_barang} className="h-10">
                      <td className="px-3 py-1.5 text-center text-gray-600">{idx + 1}</td>
                      <td className="px-3 py-1.5 font-medium text-gray-900 whitespace-nowrap">{row.kode_barang}</td>
                      <td className="px-3 py-1.5 text-gray-900 truncate max-w-[260px]">{row.nama_barang}</td>
                      <td className="px-3 py-1.5 text-center text-gray-700 whitespace-nowrap">{row.satuan || '-'}</td>
                      <td className="px-3 py-1.5 text-center text-gray-700 whitespace-nowrap">{row.jumlah}</td>
                      <td className="px-3 py-1.5 text-gray-700 truncate max-w-[320px]">{row.keterangan || '-'}</td>
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
            </div>
          </div>
        )}
      </Modal>

      {/* Click outside to close dropdown */}
      {(showCustomerDropdown || showBarangDropdown) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowCustomerDropdown(false);
            setShowBarangDropdown(false);
          }}
        />
      )}
    </div>
  );
}
