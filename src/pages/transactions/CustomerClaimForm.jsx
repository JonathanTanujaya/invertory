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
import { toast } from 'react-toastify';

// Import data
import barangData from '@/data/dummy/m_barang.json';
import customerData from '@/data/dummy/m_customer.json';

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

  // Generate nomor claim
  useEffect(() => {
    const today = new Date();
    const claimNo = `CC-${today.getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    setValue('no_claim', claimNo);
  }, [setValue]);

  // Filter customer berdasarkan pencarian
  const filteredCustomer = useMemo(() => {
    if (!searchCustomer) return customerData.slice(0, 10);
    const query = searchCustomer.toLowerCase();
    return customerData.filter(customer =>
      customer.kode_customer.toLowerCase().includes(query) ||
      customer.nama_customer.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [searchCustomer]);

  // Filter barang berdasarkan pencarian
  const filteredBarang = useMemo(() => {
    if (!searchBarang) return barangData.slice(0, 10);
    const query = searchBarang.toLowerCase();
    return barangData.filter(barang =>
      barang.kode_barang.toLowerCase().includes(query) ||
      barang.nama_barang.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [searchBarang]);

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
  const onSubmit = async (data) => {
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

    setLoading(true);

    const payload = {
      ...data,
      nama_customer: selectedCustomer.nama_customer,
      detail_items: claimItems.map(item => ({
        kode_barang: item.kode_barang,
        nama_barang: item.nama_barang,
        jumlah: item.jumlah,
        keterangan: item.keterangan
      })),
      total_item: claimItems.length,
      total_qty: totalQty
    };

    try {
      console.log('Submitting customer claim:', payload);
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Customer claim berhasil disimpan!');
      navigate('/transactions/customer-claim');
    } catch (error) {
      console.error('Error saving customer claim:', error);
      toast.error('Gagal menyimpan customer claim');
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
    <div className="flex flex-col h-[calc(100vh-9rem)]">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 space-y-4 h-full">
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
        <Card className="flex-1 flex flex-col px-1.5 py-1.5">
          <div className="flex-1 flex flex-col">
            {claimItems.length === 0 ? (
              <div className="flex-1 min-h-[280px] flex flex-col items-center justify-center text-center bg-gray-50/50 border border-dashed border-gray-200 rounded-lg">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <MessageSquareWarning className="w-7 h-7 text-primary-500" />
                </div>
                <p className="text-gray-700 font-medium text-base mb-1">Belum Ada Barang</p>
                <p className="text-sm text-gray-400">
                  Cari dan tambahkan barang untuk membuat claim
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
                        Satuan
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Jumlah
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
                    {claimItems.map(item => (
                      <tr key={item.kode_barang} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono text-primary-600">
                          {item.kode_barang}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.nama_barang}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center">
                          {item.satuan}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.jumlah}
                            onChange={(e) => handleJumlahChange(item.kode_barang, e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.keterangan}
                            onChange={(e) => handleKeteranganChange(item.kode_barang, e.target.value)}
                            placeholder="Alasan claim barang ini..."
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
                    ))}
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
                <span className="font-semibold text-gray-900">{claimItems.length}</span>
              </div>
              {claimItems.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Total Qty:</span>
                  <span className="font-semibold text-gray-900">{totalQty}</span>
                </div>
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
                disabled={loading || claimItems.length === 0 || !selectedCustomer}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Menyimpan...' : 'Simpan Claim'}
              </Button>
            </div>
          </div>
        </div>
      </form>

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
