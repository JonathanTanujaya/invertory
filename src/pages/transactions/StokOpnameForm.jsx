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
      lokasi_rak: barang.lokasi_rak,
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
  const onSubmit = async (data) => {
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

    setLoading(true);

    const payload = {
      ...data,
      detail_items: opnameItems.map(item => ({
        kode_barang: item.kode_barang,
        nama_barang: item.nama_barang,
        stok_sistem: item.stok_sistem,
        stok_fisik: item.stok_fisik,
        selisih: item.selisih,
        keterangan: item.keterangan
      })),
      total_item: opnameItems.length,
      total_selisih_plus: totalSelisih.plus,
      total_selisih_minus: totalSelisih.minus
    };

    try {
      console.log('Submitting stok opname:', payload);
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Stok opname berhasil disimpan!');
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
    <div className="flex flex-col h-[calc(100vh-9rem)]">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 space-y-4 h-full">
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
                              <div className="text-xs text-gray-500">Lokasi: {barang.lokasi_rak} | {barang.satuan}</div>
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
        <Card className="flex-1 flex flex-col px-1.5 py-1.5">
          <div className="flex-1 flex flex-col">
            {opnameItems.length === 0 ? (
              <div className="flex-1 min-h-[280px] flex flex-col items-center justify-center text-center bg-gray-50/50 border border-dashed border-gray-200 rounded-lg">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <ClipboardCheck className="w-7 h-7 text-primary-500" />
                </div>
                <p className="text-gray-700 font-medium text-base mb-1">Belum Ada Barang</p>
                <p className="text-sm text-gray-400">
                  Cari dan tambahkan barang untuk memulai proses opname
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Kode
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Nama Barang
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Lokasi
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Stok Sistem
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Stok Fisik
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Selisih
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Keterangan
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {opnameItems.map(item => {
                      const status = getSelisihStatus(item.selisih);
                      const StatusIcon = status.icon;
                      return (
                        <tr key={item.kode_barang} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-mono text-primary-600">
                            {item.kode_barang}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{item.nama_barang}</div>
                            <div className="text-xs text-gray-500">{item.satuan}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-center">
                            {item.lokasi_rak}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium">
                              {item.stok_sistem}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min="0"
                              value={item.stok_fisik}
                              onChange={(e) => handleStokFisikChange(item.kode_barang, e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${status.bg}`}>
                              <StatusIcon className={`w-4 h-4 ${status.color}`} />
                              <span className={`text-sm font-medium ${status.color}`}>
                                {item.selisih > 0 ? '+' : ''}{item.selisih}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.keterangan}
                              onChange={(e) => handleKeteranganChange(item.kode_barang, e.target.value)}
                              placeholder="Keterangan..."
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.kode_barang)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between gap-4 h-11">
            {/* Summary */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Total Item:</span>
                <span className="font-semibold text-gray-900">{opnameItems.length}</span>
              </div>
              {opnameItems.length > 0 && (
                <>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    <span className="text-gray-600">Lebih:</span>
                    <span className="font-semibold text-amber-600">+{totalSelisih.plus}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-gray-600">Kurang:</span>
                    <span className="font-semibold text-red-600">-{totalSelisih.minus}</span>
                  </div>
                </>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button
                type="submit"
                disabled={loading || opnameItems.length === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Menyimpan...' : 'Simpan Opname'}
              </Button>
            </div>
          </div>
        </div>
      </form>

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
