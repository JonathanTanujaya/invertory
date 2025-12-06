import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Save, Search, Package, RotateCcw, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/utils/helpers';
import { toast } from 'react-toastify';

// Import dummy data
import stokKeluarData from '@/data/dummy/t_stok_keluar.json';
import customerData from '@/data/dummy/m_customer.json';

export default function ReturPenjualanForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      no_retur: '',
      no_faktur_penjualan: '',
      tanggal_retur: new Date().toISOString().split('T')[0],
      alasan: '',
    }
  });

  const [searchFaktur, setSearchFaktur] = useState('');
  const [showFakturDropdown, setShowFakturDropdown] = useState(false);
  const [selectedFaktur, setSelectedFaktur] = useState(null);
  const [returItems, setReturItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Buat mapping customer
  const customerMap = useMemo(() => {
    return customerData.reduce((acc, cust) => {
      acc[cust.kode_customer] = cust.nama_customer;
      return acc;
    }, {});
  }, []);

  // Generate nomor retur
  useEffect(() => {
    const today = new Date();
    const returNo = `RJ-${today.getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    setValue('no_retur', returNo);
  }, [setValue]);

  // Filter faktur berdasarkan pencarian
  const filteredFaktur = useMemo(() => {
    if (!searchFaktur) return stokKeluarData.slice(0, 10);
    const query = searchFaktur.toLowerCase();
    return stokKeluarData.filter(faktur =>
      faktur.no_faktur.toLowerCase().includes(query) ||
      customerMap[faktur.kode_customer]?.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [searchFaktur, customerMap]);

  // Handle pilih faktur
  const handleSelectFaktur = (faktur) => {
    setSelectedFaktur(faktur);
    setValue('no_faktur_penjualan', faktur.no_faktur);
    setSearchFaktur(faktur.no_faktur);
    setShowFakturDropdown(false);
    setReturItems([]);
  };

  // Handle tambah item ke retur
  const handleAddItem = (item) => {
    const exists = returItems.find(r => r.kode_barang === item.kode_barang);
    if (exists) {
      toast.warning('Barang sudah ditambahkan ke daftar retur');
      return;
    }

    setReturItems([...returItems, {
      kode_barang: item.kode_barang,
      nama_barang: item.nama_barang,
      jumlah_penjualan: item.jumlah,
      harga: item.harga,
      jumlah_retur: item.jumlah,
      subtotal: item.jumlah * item.harga
    }]);
    toast.success('Barang ditambahkan ke daftar retur');
  };

  // Handle hapus item dari retur
  const handleRemoveItem = (kode_barang) => {
    setReturItems(returItems.filter(item => item.kode_barang !== kode_barang));
  };

  // Handle ubah jumlah retur
  const handleItemChange = (kode_barang, value) => {
    setReturItems(returItems.map(item => {
      if (item.kode_barang === kode_barang) {
        const jumlah = parseInt(value) || 0;
        return {
          ...item,
          jumlah_retur: jumlah,
          subtotal: jumlah * item.harga
        };
      }
      return item;
    }));
  };

  // Hitung total retur
  const totalRetur = useMemo(() => {
    return returItems.reduce((sum, item) => sum + item.subtotal, 0);
  }, [returItems]);

  // Submit form
  const onSubmit = async (data) => {
    if (returItems.length === 0) {
      toast.error('Tambahkan minimal 1 barang untuk diretur');
      return;
    }

    // Validasi jumlah retur
    const invalidItems = returItems.filter(item =>
      item.jumlah_retur <= 0 || item.jumlah_retur > item.jumlah_penjualan
    );
    if (invalidItems.length > 0) {
      toast.error('Jumlah retur tidak valid untuk beberapa barang');
      return;
    }

    setLoading(true);

    const payload = {
      ...data,
      kode_customer: selectedFaktur?.kode_customer,
      detail_items: returItems.map(item => ({
        kode_barang: item.kode_barang,
        nama_barang: item.nama_barang,
        jumlah: item.jumlah_retur,
        harga: item.harga,
        subtotal: item.subtotal
      })),
      total: totalRetur
    };

    try {
      console.log('Submitting retur penjualan:', payload);
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Retur penjualan berhasil disimpan!');
      navigate('/transactions/retur-penjualan');
    } catch (error) {
      console.error('Error saving retur penjualan:', error);
      toast.error('Gagal menyimpan retur penjualan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)]">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 space-y-4 h-full">
        {/* Informasi Retur */}
        <Card className="px-1.5 py-0">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* No Retur */}
              <Input
                label="No. Retur"
                {...register('no_retur', { required: 'No. retur wajib diisi' })}
                error={errors.no_retur?.message}
                readOnly
                className="bg-gray-50"
              />

              {/* Tanggal Retur */}
              <Input
                label="Tanggal Retur"
                type="date"
                {...register('tanggal_retur', { required: 'Tanggal wajib diisi' })}
                error={errors.tanggal_retur?.message}
              />

              {/* Pilih Faktur Penjualan */}
              <div className="relative w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. Faktur Penjualan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    placeholder="Cari faktur..."
                    value={searchFaktur}
                    onChange={(e) => {
                      setSearchFaktur(e.target.value);
                      setShowFakturDropdown(true);
                    }}
                    onFocus={() => setShowFakturDropdown(true)}
                    startIcon={<Search className="w-4 h-4 text-gray-400" />}
                  />
                  <input type="hidden" {...register('no_faktur_penjualan', { required: 'Faktur penjualan wajib dipilih' })} />
                </div>
                {errors.no_faktur_penjualan && (
                  <p className="mt-1 text-sm text-red-500">{errors.no_faktur_penjualan.message}</p>
                )}

                {/* Dropdown Faktur */}
                {showFakturDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {filteredFaktur.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        Tidak ada faktur ditemukan
                      </div>
                    ) : (
                      filteredFaktur.map(faktur => (
                        <div
                          key={faktur.no_faktur}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => handleSelectFaktur(faktur)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-primary-600">{faktur.no_faktur}</div>
                              <div className="text-sm text-gray-600">{customerMap[faktur.kode_customer]}</div>
                              <div className="text-xs text-gray-400">
                                {new Date(faktur.tanggal).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">{formatCurrency(faktur.total)}</div>
                              <div className="text-xs text-gray-500">{faktur.items.length} item</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Info Customer dari Faktur Terpilih */}
            {selectedFaktur && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Customer:</span>
                    <p className="font-medium text-gray-900">{customerMap[selectedFaktur.kode_customer]}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Tanggal Penjualan:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedFaktur.tanggal).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Penjualan:</span>
                    <p className="font-medium text-gray-900">{formatCurrency(selectedFaktur.total)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Jumlah Item:</span>
                    <p className="font-medium text-gray-900">{selectedFaktur.items.length} item</p>
                  </div>
                </div>
              </div>
            )}

            {/* Alasan Retur */}
            <Input
              label="Alasan Retur"
              {...register('alasan', { required: 'Alasan wajib diisi' })}
              error={errors.alasan?.message}
              placeholder="Jelaskan alasan retur barang dari customer..."
            />
          </div>
        </Card>

        {/* Barang dari Faktur */}
        {selectedFaktur && (
          <Card padding={false}>
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedFaktur.items.map(item => {
                  const isAdded = returItems.find(r => r.kode_barang === item.kode_barang);
                  return (
                    <div
                      key={item.kode_barang}
                      className={`p-4 border rounded-lg ${isAdded ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-primary-300'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-mono text-xs text-gray-500">{item.kode_barang}</div>
                          <div className="font-medium text-gray-900">{item.nama_barang}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <div>Qty: <span className="font-medium">{item.jumlah}</span></div>
                        <div>Harga: <span className="font-medium">{formatCurrency(item.harga)}</span></div>
                        <div>Subtotal: <span className="font-medium">{formatCurrency(item.subtotal)}</span></div>
                      </div>
                      <Button
                        type="button"
                        variant={isAdded ? 'outline' : 'primary'}
                        size="sm"
                        className="w-full"
                        onClick={() => !isAdded && handleAddItem(item)}
                        disabled={isAdded}
                      >
                        {isAdded ? '✓ Sudah Ditambahkan' : 'Tambah ke Retur'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* Daftar Barang Retur */}
        <Card className="flex-1 flex flex-col px-1.5 py-1.5">
          <div className="flex-1 flex flex-col">
            {!selectedFaktur ? (
              <div className="flex-1 min-h-[calc(65vh-100px)] flex flex-col items-center justify-center text-center bg-gray-50/50 border border-dashed border-gray-200 rounded-lg">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-7 h-7 text-primary-500" />
                </div>
                <p className="text-gray-700 font-medium text-base mb-1">Pilih Faktur Penjualan</p>
                <p className="text-sm text-gray-400">
                  Cari faktur pada field di atas untuk memulai proses retur
                </p>
              </div>
            ) : returItems.length === 0 ? (
              <div className="flex-1 min-h-[280px] flex flex-col items-center justify-center text-center bg-amber-50/50 border border-dashed border-amber-200 rounded-lg">
                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <Package className="w-7 h-7 text-amber-500" />
                </div>
                <p className="text-amber-700 font-medium text-base mb-1">Pilih Barang untuk Retur</p>
                <p className="text-sm text-amber-500">
                  Klik "Tambah ke Retur" pada card barang di atas
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          Kode
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          Nama Barang
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                          Qty Jual
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                          Qty Retur
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                          Harga
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                          Subtotal
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {returItems.map(item => (
                        <tr key={item.kode_barang}>
                          <td className="px-4 py-3 text-sm font-mono text-primary-600">
                            {item.kode_barang}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.nama_barang}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-center">
                            {item.jumlah_penjualan}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min="1"
                              max={item.jumlah_penjualan}
                              value={item.jumlah_retur}
                              onChange={(e) => handleItemChange(item.kode_barang, e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right">
                            {formatCurrency(item.harga)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            {formatCurrency(item.subtotal)}
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
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-right font-semibold text-gray-900">
                          Total Retur:
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-lg text-primary-600">
                          {formatCurrency(totalRetur)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm flex-shrink-0">
          <div className="flex items-center justify-end gap-2 h-12">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Clear semua form dan state
                setSearchFaktur('');
                setSelectedFaktur(null);
                setReturItems([]);
                setValue('no_faktur_penjualan', '');
                setValue('alasan', '');
                setValue('tanggal_retur', new Date().toISOString().split('T')[0]);
                // Generate nomor retur baru
                const today = new Date();
                const returNo = `RJ-${today.getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
                setValue('no_retur', returNo);
                toast.info('Form telah direset');
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button
              type="submit"
              disabled={loading || returItems.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Menyimpan...' : 'Simpan Retur'}
            </Button>
          </div>
        </div>
      </form>

      {/* Click outside to close dropdown */}
      {showFakturDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowFakturDropdown(false)}
        />
      )}
    </div>
  );
}
