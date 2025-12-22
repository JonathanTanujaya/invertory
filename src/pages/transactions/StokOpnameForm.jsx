import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  Search,
  Package,
  RotateCcw,
  ClipboardCheck,
  Trash2,
  TrendingUp,
  TrendingDown,
  CheckCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-toastify';

// Import data barang
import barangData from '@/data/dummy/m_barang.json';

export default function StokOpnameForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      no_opname: '',
      tanggal_opname: new Date().toISOString().split('T')[0],
      catatan: '',
    }
  });

  const [searchBarang, setSearchBarang] = useState('');
  const [showBarangDropdown, setShowBarangDropdown] = useState(false);
  const [opnameItems, setOpnameItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmSnapshot, setConfirmSnapshot] = useState(null);

  // Generate nomor opname
  useEffect(() => {
    const today = new Date();
    const opnameNo = `SO-${today.getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    setValue('no_opname', opnameNo);
  }, [setValue]);

  // Filter barang berdasarkan pencarian
  const filteredBarang = useMemo(() => {
    if (!searchBarang) return barangData.slice(0, 10);
    const query = searchBarang.toLowerCase();
    return barangData.filter(barang =>
      barang.kode_barang.toLowerCase().includes(query) ||
      barang.nama_barang.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [searchBarang]);

  // Handle pilih barang
  const handleSelectBarang = (barang) => {
    // Cek apakah barang sudah ada di list
    const exists = opnameItems.find(item => item.kode_barang === barang.kode_barang);
    if (exists) {
      toast.warning('Barang sudah ada dalam daftar opname');
      setShowBarangDropdown(false);
      setSearchBarang('');
      return;
    }

    // Tambah ke list opname
    setOpnameItems([...opnameItems, {
      kode_barang: barang.kode_barang,
      nama_barang: barang.nama_barang,
      satuan: barang.satuan,
      stok_sistem: barang.stok,
      stok_fisik: barang.stok, // Default sama dengan stok sistem
      selisih: 0,
      keterangan: ''
    }]);

    setShowBarangDropdown(false);
    setSearchBarang('');
    toast.success('Barang ditambahkan ke daftar opname');
  };

  // Handle hapus item
  const handleRemoveItem = (kode_barang) => {
    setOpnameItems(opnameItems.filter(item => item.kode_barang !== kode_barang));
  };

  // Handle ubah stok fisik
  const handleStokFisikChange = (kode_barang, value) => {
    setOpnameItems(opnameItems.map(item => {
      if (item.kode_barang === kode_barang) {
        const stokFisik = parseInt(value) || 0;
        return {
          ...item,
          stok_fisik: stokFisik,
          selisih: stokFisik - item.stok_sistem
        };
      }
      return item;
    }));
  };

  // Handle ubah keterangan
  const handleKeteranganChange = (kode_barang, value) => {
    setOpnameItems(opnameItems.map(item => {
      if (item.kode_barang === kode_barang) {
        return { ...item, keterangan: value };
      }
      return item;
    }));
  };

  // Hitung total selisih
  const totalSelisih = useMemo(() => {
    const plus = opnameItems.filter(item => item.selisih > 0).reduce((sum, item) => sum + item.selisih, 0);
    const minus = opnameItems.filter(item => item.selisih < 0).reduce((sum, item) => sum + Math.abs(item.selisih), 0);
    return { plus, minus };
  }, [opnameItems]);

  // Get status icon for selisih
  const getSelisihStatus = (selisih) => {
    if (selisih === 0) return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' };
    if (selisih > 0) return { icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' };
    return { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' };
  };

  // Submit form
  const buildConfirmSnapshot = (data) => {
    const rows = opnameItems.map((it) => ({
      kode_barang: it.kode_barang,
      nama_barang: it.nama_barang,
      satuan: it.satuan,
      stok_sistem: it.stok_sistem,
      stok_fisik: it.stok_fisik,
      selisih: it.selisih,
      keterangan: it.keterangan,
    }));

    const plus = rows.filter((r) => r.selisih > 0).reduce((sum, r) => sum + r.selisih, 0);
    const minus = rows.filter((r) => r.selisih < 0).reduce((sum, r) => sum + Math.abs(r.selisih), 0);

    return {
      header: {
        no_opname: data.no_opname,
        tanggal_opname: data.tanggal_opname,
        catatan: data.catatan,
      },
      items: rows,
      totals: {
        totalItem: rows.length,
        plus,
        minus,
      },
    };
  };

  const onSubmit = (data) => {
    if (opnameItems.length === 0) {
      toast.error('Tambahkan minimal 1 barang untuk opname');
      return;
    }

    // Validasi stok fisik
    const invalidItems = opnameItems.filter(item => item.stok_fisik < 0);
    if (invalidItems.length > 0) {
      toast.error('Stok fisik tidak boleh negatif');
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
      ...data,
      detail_items: opnameItems.map((item) => ({
        kode_barang: item.kode_barang,
        nama_barang: item.nama_barang,
        stok_sistem: item.stok_sistem,
        stok_fisik: item.stok_fisik,
        selisih: item.selisih,
        keterangan: item.keterangan,
      })),
      total_item: opnameItems.length,
      total_selisih_plus: totalSelisih.plus,
      total_selisih_minus: totalSelisih.minus,
    };

    try {
      console.log('Submitting stok opname:', payload);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Stok opname berhasil disimpan!');
      setConfirmOpen(false);
      setConfirmSnapshot(null);
      navigate('/transactions/stok-opname');
    } catch (error) {
      console.error('Error saving stok opname:', error);
      toast.error('Gagal menyimpan stok opname');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setSearchBarang('');
    setOpnameItems([]);
    setValue('catatan', '');
    setValue('tanggal_opname', new Date().toISOString().split('T')[0]);
    // Generate nomor opname baru
    const today = new Date();
    const opnameNo = `SO-${today.getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    setValue('no_opname', opnameNo);
    toast.info('Form telah direset');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-48px)] overflow-hidden min-h-0">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full gap-4 min-h-0">
        {/* Informasi Opname */}
        <Card className="px-1.5 py-0">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* No Opname */}
              <Input
                label="No. Opname"
                {...register('no_opname', { required: 'No. opname wajib diisi' })}
                error={errors.no_opname?.message}
                readOnly
                className="bg-gray-50"
              />

              {/* Tanggal Opname */}
              <Input
                label="Tanggal Opname"
                type="date"
                {...register('tanggal_opname', { required: 'Tanggal wajib diisi' })}
                error={errors.tanggal_opname?.message}
              />

              {/* Catatan */}
              <Input
                label="Catatan"
                {...register('catatan')}
                placeholder="Catatan tambahan..."
              />
            </div>

            {/* Search Barang */}
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
                      const isAdded = opnameItems.find(item => item.kode_barang === barang.kode_barang);
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
                              <div className="text-xs text-gray-500">{barang.satuan}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">Stok: {barang.stok}</div>
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
          </div>
        </Card>

        {/* Daftar Barang Opname */}
        <Card padding={false} className="flex-1 overflow-hidden min-h-0">
          <div className="h-full min-h-0 overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-primary-50 text-primary-800 sticky top-0 z-10 shadow-sm border-b border-primary-100">
                <tr className="h-10">
                  <th className="px-3 py-2 text-left w-32">Kode</th>
                  <th className="px-3 py-2 text-left">Nama Barang</th>
                  <th className="px-3 py-2 text-center w-28">Stok Sistem</th>
                  <th className="px-3 py-2 text-center w-28">Stok Fisik</th>
                  <th className="px-3 py-2 text-center w-28">Selisih</th>
                  <th className="px-3 py-2 text-left w-64">Keterangan</th>
                  <th className="px-3 py-2 text-center w-16">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/60">
                {opnameItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="mx-auto max-w-xl px-6">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                          <ClipboardCheck className="h-6 w-6" />
                        </div>
                        <div className="text-gray-900 font-semibold">Belum ada barang opname</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  opnameItems.map((item) => {
                    const status = getSelisihStatus(item.selisih);
                    const StatusIcon = status.icon;
                    return (
                      <tr key={item.kode_barang} className="h-10 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-1.5 align-middle font-mono text-primary-600 whitespace-nowrap">
                          {item.kode_barang}
                        </td>
                        <td className="px-3 py-1.5 align-middle">
                          <div className="text-gray-900 truncate max-w-[320px]">{item.nama_barang}</div>
                          <div className="text-xs text-gray-500">{item.satuan}</div>
                        </td>
                        <td className="px-3 py-1.5 align-middle text-center">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium whitespace-nowrap">
                            {item.stok_sistem}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 align-middle text-center">
                          <input
                            type="number"
                            min="0"
                            value={item.stok_fisik}
                            onChange={(e) => handleStokFisikChange(item.kode_barang, e.target.value)}
                            className="w-20 h-8 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                          />
                        </td>
                        <td className="px-3 py-1.5 align-middle text-center">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${status.bg}`}>
                            <StatusIcon className={`w-4 h-4 ${status.color}`} />
                            <span className={`text-sm font-medium ${status.color}`}>
                              {item.selisih > 0 ? '+' : ''}{item.selisih}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-1.5 align-middle">
                          <input
                            type="text"
                            value={item.keterangan}
                            onChange={(e) => handleKeteranganChange(item.kode_barang, e.target.value)}
                            placeholder="Keterangan..."
                            className="w-full h-8 px-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                          />
                        </td>
                        <td className="px-3 py-1.5 align-middle text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.kode_barang)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Actions (match Penjualan wrapper sizing) */}
        <div className="mt-auto px-5 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between gap-4 h-12">
            {opnameItems.length > 0 ? (
              <div className="flex items-center gap-6 text-sm text-gray-800 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">Total Item:</span>
                  <span className="font-bold text-primary-700">{opnameItems.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">Lebih:</span>
                  <span className="font-bold text-primary-700">+{totalSelisih.plus}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">Kurang:</span>
                  <span className="font-bold text-primary-700">-{totalSelisih.minus}</span>
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
                disabled={loading || opnameItems.length === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Menyimpan...' : 'Simpan Opname'}
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
        title="Konfirmasi Stok Opname"
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
                <div className="text-gray-500">No. Opname</div>
                <div className="font-semibold text-gray-900">{confirmSnapshot.header.no_opname}</div>
              </div>
              <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
                <div className="text-gray-500">Tanggal</div>
                <div className="font-semibold text-gray-900">{confirmSnapshot.header.tanggal_opname}</div>
              </div>
              <div className="rounded-md border border-gray-200 bg-white px-4 py-3 sm:col-span-2">
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
                    <th className="px-3 py-2 text-center w-28">Sistem</th>
                    <th className="px-3 py-2 text-center w-28">Fisik</th>
                    <th className="px-3 py-2 text-center w-28">Selisih</th>
                    <th className="px-3 py-2 text-left w-64">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {confirmSnapshot.items.map((row, idx) => (
                    <tr key={row.kode_barang} className="h-10">
                      <td className="px-3 py-1.5 text-center text-gray-600">{idx + 1}</td>
                      <td className="px-3 py-1.5 font-medium text-gray-900 whitespace-nowrap">{row.kode_barang}</td>
                      <td className="px-3 py-1.5 text-gray-900 truncate max-w-[260px]">{row.nama_barang}</td>
                      <td className="px-3 py-1.5 text-center text-gray-700 whitespace-nowrap">{row.stok_sistem}</td>
                      <td className="px-3 py-1.5 text-center text-gray-700 whitespace-nowrap">{row.stok_fisik}</td>
                      <td className="px-3 py-1.5 text-center font-semibold whitespace-nowrap">
                        <span className={row.selisih === 0 ? 'text-green-700' : (row.selisih > 0 ? 'text-amber-700' : 'text-red-700')}>
                          {row.selisih > 0 ? '+' : ''}{row.selisih}
                        </span>
                      </td>
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
                Lebih: <span className="font-semibold text-gray-900">+{confirmSnapshot.totals.plus}</span>
              </div>
              <div className="text-gray-600">
                Kurang: <span className="font-semibold text-gray-900">-{confirmSnapshot.totals.minus}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Click outside to close dropdown */}
      {showBarangDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowBarangDropdown(false)}
        />
      )}
    </div>
  );
}
